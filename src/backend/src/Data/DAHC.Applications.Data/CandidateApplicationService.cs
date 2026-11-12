using DAHC.Applications.Core;
using DAHC.Applications.Service;
using DAHC.Data;
using DAHC.Data.Operations;
using DAHC.Service.Access;
using DAHC.Service.Paging;
using DAHC.Service.Results;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace DAHC.Applications.Data;

/// <summary>
/// The candidate's own applications: list, read, create a draft (US-1.3.1) and save a draft (US-1.3.11 core).
/// </summary>
internal sealed class CandidateApplicationService : ICandidateApplicationService
{
    private const string CreateOperation = "applications.create";

    private static readonly TimeSpan idempotencyKeyLifetime = TimeSpan.FromHours(24);

    private readonly DahcDbContext dbContext;

    private readonly ApplicationReader applicationReader;

    private readonly IApplicationNumberAllocator applicationNumberAllocator;

    private readonly TimeProvider timeProvider;

    public CandidateApplicationService(
        DahcDbContext dbContext,
        ApplicationReader applicationReader,
        IApplicationNumberAllocator applicationNumberAllocator,
        TimeProvider timeProvider)
    {
        this.dbContext = dbContext;
        this.applicationReader = applicationReader;
        this.applicationNumberAllocator = applicationNumberAllocator;
        this.timeProvider = timeProvider;
    }

    public async Task<Result<Page<ApplicationView>>> ListAsync(
        CurrentUser candidate,
        Guid? cycleId,
        PageQuery pageQuery,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(candidate);
        ArgumentNullException.ThrowIfNull(pageQuery);

        try
        {
            return await this.applicationReader.ReadPageAsync(
                candidate.InternalId,
                cycleId,
                pageQuery,
                cancellationToken);
        }
        catch (Exception exception) when (DahcDataException.IsDatabaseFailure(exception))
        {
            throw new DahcDataException("CandidateApplicationService.ListAsync", exception);
        }
    }

    public async Task<Result<ApplicationView>> GetAsync(
        CurrentUser candidate,
        Guid applicationId,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(candidate);

        try
        {
            return await this.ReadOwnApplicationAsync(candidate, applicationId, cancellationToken);
        }
        catch (Exception exception) when (DahcDataException.IsDatabaseFailure(exception))
        {
            throw new DahcDataException("CandidateApplicationService.GetAsync", exception);
        }
    }

    public async Task<Result<ApplicationView>> CreateDraftAsync(
        CurrentUser candidate,
        CreateDraftCommand command,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(candidate);
        ArgumentNullException.ThrowIfNull(command);

        try
        {
            Result<ApplicationView>? result = await this.TryCreateDraftAsync(candidate, command, cancellationToken);

            if (result is null)
            {
                // A unique index rejected the insert: a concurrent request created the active application or used
                // the same idempotency key first. Re-evaluate against what it committed.
                this.dbContext.ChangeTracker.Clear();
                result = await this.ResolveCreateConflictAsync(candidate, command, cancellationToken);
            }

            return result;
        }
        catch (Exception exception) when (DahcDataException.IsDatabaseFailure(exception))
        {
            throw new DahcDataException("CandidateApplicationService.CreateDraftAsync", exception);
        }
    }

    public async Task<Result<ApplicationView>> UpdateDraftAsync(
        CurrentUser candidate,
        UpdateDraftCommand command,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(candidate);
        ArgumentNullException.ThrowIfNull(command);

        try
        {
            Result<ApplicationView>? result = await this.TryUpdateDraftAsync(candidate, command, cancellationToken);

            if (result is null)
            {
                // Another save changed the draft between this read and this save.
                this.dbContext.ChangeTracker.Clear();
                result = Result.Failure<ApplicationView>(
                    ResultStatus.PreconditionFailed,
                    ErrorCodes.PreconditionFailed);
            }

            return result;
        }
        catch (Exception exception) when (DahcDataException.IsDatabaseFailure(exception))
        {
            throw new DahcDataException("CandidateApplicationService.UpdateDraftAsync", exception);
        }
    }

    private static string KeyScope(CurrentUser candidate)
    {
        return $"{CreateOperation}:{candidate.PublicId:N}";
    }

    private static List<ApplicationPreference> BuildPreferences(
        IReadOnlyList<PreferenceInput> preferences,
        ProgramOffering offering,
        DateTimeOffset createdAt)
    {
        List<ApplicationPreference> entities = [];

        foreach (PreferenceInput preference in preferences)
        {
            OfferedSpecialty offered = offering.Specialties[preference.SpecialtyId];

            ApplicationPreference entity = new()
            {
                PreferenceOrder = (byte)preference.PreferenceOrder,
                ProgramSpecialtyId = offered.ProgramSpecialtyId,
                CreatedAt = createdAt,
            };

            foreach (TrainingSitePreferenceInput site in preference.TrainingSites)
            {
                entity.AddSite(new ApplicationPreferenceSite
                {
                    ProgramSpecialtyId = offered.ProgramSpecialtyId,
                    SpecialtySiteId = offered.SpecialtySiteIds[site.SiteId],
                    SiteOrder = (byte)site.SiteOrder,
                });
            }

            entities.Add(entity);
        }

        return entities;
    }

    private static Result<ApplicationView>? ValidatePreferences(
        IReadOnlyList<PreferenceInput> preferences,
        ProgramOffering offering)
    {
        IReadOnlyList<ValidationIssue> issues = PreferenceRules.Validate(
            preferences,
            offering.MaxPreferences,
            offering.Specialties);

        if (issues.Count == 0)
        {
            return null;
        }

        return Result.Failure<ApplicationView>(
            ResultStatus.ValidationFailed,
            ApplicationErrorCodes.InvalidPreferences,
            issues);
    }

    private async Task<Result<ApplicationView>> ReadOwnApplicationAsync(
        CurrentUser candidate,
        Guid applicationId,
        CancellationToken cancellationToken)
    {
        ApplicationView? view = await this.applicationReader.FindAsync(
            candidate.InternalId,
            applicationId,
            cancellationToken);

        if (view is null)
        {
            return Result.NotFound<ApplicationView>();
        }

        return Result.Success(view);
    }

    private async Task<Result<ApplicationView>?> TryCreateDraftAsync(
        CurrentUser candidate,
        CreateDraftCommand command,
        CancellationToken cancellationToken)
    {
        byte[] requestHash = CreateDraftFingerprint.Compute(command);
        Result<ApplicationView>? replay = await this.ReplayIdempotentCreateAsync(
            candidate,
            command.IdempotencyKey,
            requestHash,
            cancellationToken);

        if (replay is not null)
        {
            return replay;
        }

        DateTimeOffset now = this.timeProvider.GetUtcNow();
        ProgramOffering? offering = await ProgramOffering.LoadAsync(
            this.dbContext,
            command.CycleId,
            command.ProgramId,
            cancellationToken);

        if (offering is null
            || !offering.ProgramCycle.IsOpenAt(now))
        {
            ValidationIssue issue = new(ApplicationErrorCodes.ProgramNotOpen, "/programId");

            return Result.Failure<ApplicationView>(
                ResultStatus.ValidationFailed,
                ApplicationErrorCodes.ProgramNotOpen,
                [issue]);
        }

        Result<ApplicationView>? invalid = ValidatePreferences(command.Preferences, offering);

        if (invalid is not null)
        {
            return invalid;
        }

        int admissionCycleId = offering.ProgramCycle.CycleId;

        if (await this.HasActiveApplicationAsync(candidate, admissionCycleId, cancellationToken))
        {
            return Result.Failure<ApplicationView>(
                ResultStatus.Conflict,
                ApplicationErrorCodes.ActiveApplicationExists);
        }

        try
        {
            Guid applicationId = await this.InsertDraftAsync(
                candidate,
                command,
                offering,
                requestHash,
                now,
                cancellationToken);

            return await this.ReadOwnApplicationAsync(candidate, applicationId, cancellationToken);
        }
        catch (DbUpdateException exception) when (DahcDataException.IsUniqueViolation(exception))
        {
            return null;
        }
    }

    private async Task<Guid> InsertDraftAsync(
        CurrentUser candidate,
        CreateDraftCommand command,
        ProgramOffering offering,
        byte[] requestHash,
        DateTimeOffset now,
        CancellationToken cancellationToken)
    {
        await using IDbContextTransaction transaction =
            await this.dbContext.Database.BeginTransactionAsync(cancellationToken);

        string applicationNumber = await this.applicationNumberAllocator.AllocateAsync(
            offering.ProgramCycle.CycleId,
            offering.CycleStartYear,
            cancellationToken);

        CandidateApplication application = new()
        {
            PublicId = Guid.CreateVersion7(now),
            ApplicationNumber = applicationNumber,
            CandidateId = candidate.InternalId,
            AdmissionCycleId = offering.ProgramCycle.CycleId,
            ProgramCycleId = offering.ProgramCycle.ProgramCycleId,
            Status = ApplicationStatus.Draft,
            CreatedAt = now,
            LastSavedAt = now,
        };

        application.ReplacePreferences(BuildPreferences(command.Preferences, offering, now));

        IdempotencyKey idempotencyKey = new()
        {
            KeyScope = KeyScope(candidate),
            KeyValue = command.IdempotencyKey,
            RequestHash = requestHash,
            ResponseStatus = 201,
            ResourceId = application.PublicId.ToString(),
            CreatedAt = now,
            ExpiresAt = now + idempotencyKeyLifetime,
        };

        this.dbContext.Applications.Add(application);
        this.dbContext.IdempotencyKeys.Add(idempotencyKey);

        await this.dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return application.PublicId;
    }

    /// <summary>
    /// Replaying a key with the same request returns the application it created; reusing it with a different
    /// request is refused. Returns null when the key has not been used.
    /// </summary>
    private async Task<Result<ApplicationView>?> ReplayIdempotentCreateAsync(
        CurrentUser candidate,
        string keyValue,
        byte[] requestHash,
        CancellationToken cancellationToken)
    {
        string keyScope = KeyScope(candidate);
        IdempotencyKey? existingKey = await this.dbContext.IdempotencyKeys
            .AsNoTracking()
            .FirstOrDefaultAsync(
                key => key.KeyScope == keyScope && key.KeyValue == keyValue,
                cancellationToken);

        if (existingKey is null)
        {
            return null;
        }

        bool isSameRequest = existingKey.RequestHash.AsSpan().SequenceEqual(requestHash);

        if (!isSameRequest
            || !Guid.TryParse(existingKey.ResourceId, out Guid applicationId))
        {
            return Result.Failure<ApplicationView>(ResultStatus.Conflict, ErrorCodes.IdempotencyKeyReused);
        }

        return await this.ReadOwnApplicationAsync(candidate, applicationId, cancellationToken);
    }

    private async Task<Result<ApplicationView>> ResolveCreateConflictAsync(
        CurrentUser candidate,
        CreateDraftCommand command,
        CancellationToken cancellationToken)
    {
        byte[] requestHash = CreateDraftFingerprint.Compute(command);
        Result<ApplicationView>? replay = await this.ReplayIdempotentCreateAsync(
            candidate,
            command.IdempotencyKey,
            requestHash,
            cancellationToken);

        return replay ?? Result.Failure<ApplicationView>(
            ResultStatus.Conflict,
            ApplicationErrorCodes.ActiveApplicationExists);
    }

    private async Task<bool> HasActiveApplicationAsync(
        CurrentUser candidate,
        int admissionCycleId,
        CancellationToken cancellationToken)
    {
        return await this.dbContext.Applications
            .AnyAsync(
                application => application.CandidateId == candidate.InternalId
                    && application.AdmissionCycleId == admissionCycleId
                    && application.Status != ApplicationStatus.Withdrawn
                    && application.Status != ApplicationStatus.Archived,
                cancellationToken);
    }

    private async Task<Result<ApplicationView>?> TryUpdateDraftAsync(
        CurrentUser candidate,
        UpdateDraftCommand command,
        CancellationToken cancellationToken)
    {
        CandidateApplication? application = await this.dbContext.Applications
            .Include(draft => draft.Preferences)
            .ThenInclude(preference => preference.Sites)
            .FirstOrDefaultAsync(
                draft => draft.PublicId == command.ApplicationId && draft.CandidateId == candidate.InternalId,
                cancellationToken);

        if (application is null)
        {
            return Result.NotFound<ApplicationView>();
        }

        if (!application.IsEditable)
        {
            return Result.Failure<ApplicationView>(ResultStatus.Conflict, ApplicationErrorCodes.NotEditable);
        }

        if (application.VersionNo != command.ExpectedVersion)
        {
            return Result.Failure<ApplicationView>(ResultStatus.PreconditionFailed, ErrorCodes.PreconditionFailed);
        }

        ProgramOffering? offering = await ProgramOffering.LoadAsync(
            this.dbContext,
            application.ProgramCycleId,
            cancellationToken);

        if (offering is null)
        {
            return Result.NotFound<ApplicationView>();
        }

        Result<ApplicationView>? invalid = ValidatePreferences(command.Preferences, offering);

        if (invalid is not null)
        {
            return invalid;
        }

        DateTimeOffset now = this.timeProvider.GetUtcNow();

        application.ReplacePreferences(BuildPreferences(command.Preferences, offering, now));
        application.RecordSave(now);

        try
        {
            await this.dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            return null;
        }

        return await this.ReadOwnApplicationAsync(candidate, application.PublicId, cancellationToken);
    }
}
