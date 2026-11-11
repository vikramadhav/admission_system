using DAHC.Data;
using DAHC.Identity.Core;
using DAHC.Identity.Service;
using DAHC.Service.Access;
using DAHC.Service.Results;
using Microsoft.EntityFrameworkCore;

namespace DAHC.Identity.Data;

/// <summary>
/// First and later sign-ins (US-1.1.1, US-1.1.2) and the active-role switch (standard s.15).
/// </summary>
internal sealed class AuthSessionService : IAuthSessionService
{
    private readonly DahcDbContext dbContext;

    private readonly IdentityUsers identityUsers;

    private readonly ICandidateNumberAllocator candidateNumberAllocator;

    private readonly TimeProvider timeProvider;

    public AuthSessionService(
        DahcDbContext dbContext,
        IdentityUsers identityUsers,
        ICandidateNumberAllocator candidateNumberAllocator,
        TimeProvider timeProvider)
    {
        this.dbContext = dbContext;
        this.identityUsers = identityUsers;
        this.candidateNumberAllocator = candidateNumberAllocator;
        this.timeProvider = timeProvider;
    }

    public async Task<Result<AuthSession>> SignInAsync(
        string idamUserId,
        IdentityProfile profile,
        CancellationToken cancellationToken)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(idamUserId);
        ArgumentNullException.ThrowIfNull(profile);

        try
        {
            Result<AuthSession>? result = await this.TrySignInAsync(idamUserId, profile, cancellationToken);

            if (result is null)
            {
                // Concurrent first sign-ins: the unique index on IdamUserId rejected this insert, so the record
                // the other sign-in created is used instead.
                this.dbContext.ChangeTracker.Clear();
                result = await this.TrySignInAsync(idamUserId, profile, cancellationToken)
                    ?? throw new InvalidOperationException("The candidate created by a concurrent sign-in was not found.");
            }

            return result;
        }
        catch (Exception exception) when (DahcDataException.IsDatabaseFailure(exception))
        {
            throw new DahcDataException("AuthSessionService.SignInAsync", exception);
        }
    }

    public async Task<Result<AuthSession>> SwitchActiveRoleAsync(
        CurrentUser user,
        string roleCode,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(user);
        ArgumentException.ThrowIfNullOrWhiteSpace(roleCode);

        // A candidate holds one role, and a staff user may only switch to a role they hold.
        if (user.UserType != UserType.Staff
            || !ActiveRoleRules.CanSwitchTo(user.Roles, roleCode))
        {
            return Result.Failure<AuthSession>(ResultStatus.Forbidden, IdentityErrorCodes.RoleNotHeld);
        }

        try
        {
            StaffUser? staffUser = await this.dbContext.StaffUsers
                .FirstOrDefaultAsync(staff => staff.StaffUserId == user.InternalId, cancellationToken);

            if (staffUser is null)
            {
                return Result.Failure<AuthSession>(ResultStatus.Forbidden, IdentityErrorCodes.NotRegistered);
            }

            staffUser.ActiveRoleCode = roleCode;
            staffUser.UpdatedAt = this.timeProvider.GetUtcNow();

            await this.dbContext.SaveChangesAsync(cancellationToken);

            CurrentUser switchedUser = user with { ActiveRole = roleCode };

            return Result.Success(AuthSession.FromCurrentUser(switchedUser));
        }
        catch (Exception exception) when (DahcDataException.IsDatabaseFailure(exception))
        {
            throw new DahcDataException("AuthSessionService.SwitchActiveRoleAsync", exception);
        }
    }

    private static bool RefreshCandidateProfile(
        Candidate candidate,
        IdentityProfile profile,
        IdentityAttributes attributes)
    {
        bool hasChanged = candidate.DisplayName != profile.DisplayName
            || candidate.Email != profile.Email
            || candidate.MobileNumber != attributes.MobileNumber
            || candidate.EmiratesIdNumber != attributes.EmiratesIdNumber
            || candidate.PassportNumber != attributes.PassportNumber;

        candidate.DisplayName = profile.DisplayName;
        candidate.Email = profile.Email;
        candidate.MobileNumber = attributes.MobileNumber;
        candidate.EmiratesIdNumber = attributes.EmiratesIdNumber;
        candidate.PassportNumber = attributes.PassportNumber;

        return hasChanged;
    }

    private async Task<Result<AuthSession>?> TrySignInAsync(
        string idamUserId,
        IdentityProfile profile,
        CancellationToken cancellationToken)
    {
        try
        {
            return await this.SignInOnceAsync(idamUserId, profile, cancellationToken);
        }
        catch (DbUpdateException exception) when (DahcDataException.IsUniqueViolation(exception))
        {
            return null;
        }
    }

    private async Task<Result<AuthSession>> SignInOnceAsync(
        string idamUserId,
        IdentityProfile profile,
        CancellationToken cancellationToken)
    {
        // A pre-registered staff user is matched first, so no Candidate is ever created for them.
        StaffUser? staffUser = await this.dbContext.StaffUsers
            .FirstOrDefaultAsync(staff => staff.IdamUserId == idamUserId, cancellationToken);

        if (staffUser is not null)
        {
            return await this.SignInStaffAsync(staffUser, profile, cancellationToken);
        }

        Candidate? candidate = await this.dbContext.Candidates
            .FirstOrDefaultAsync(existing => existing.IdamUserId == idamUserId, cancellationToken);

        if (candidate is not null)
        {
            return await this.SignInCandidateAsync(candidate, profile, cancellationToken);
        }

        return await this.ProvisionCandidateAsync(idamUserId, profile, cancellationToken);
    }

    private async Task<Result<AuthSession>> SignInStaffAsync(
        StaffUser staffUser,
        IdentityProfile profile,
        CancellationToken cancellationToken)
    {
        // A deactivated user is refused and never reactivated by signing in.
        if (!staffUser.IsActive)
        {
            return Result.Failure<AuthSession>(ResultStatus.Forbidden, IdentityErrorCodes.Deactivated);
        }

        string email = profile.Email ?? staffUser.Email;
        bool hasChanged = staffUser.DisplayName != profile.DisplayName || staffUser.Email != email;

        if (hasChanged)
        {
            staffUser.DisplayName = profile.DisplayName;
            staffUser.Email = email;
            staffUser.UpdatedAt = this.timeProvider.GetUtcNow();

            await this.dbContext.SaveChangesAsync(cancellationToken);
        }

        CurrentUser? user = await this.identityUsers.ForStaffAsync(staffUser, cancellationToken);

        if (user is null)
        {
            return Result.Failure<AuthSession>(ResultStatus.Forbidden, IdentityErrorCodes.NoRole);
        }

        return Result.Success(AuthSession.FromCurrentUser(user));
    }

    private async Task<Result<AuthSession>> SignInCandidateAsync(
        Candidate candidate,
        IdentityProfile profile,
        CancellationToken cancellationToken)
    {
        if (!candidate.IsActive)
        {
            bool isRecordedDuplicate = await this.dbContext.DuplicateAccountPairs
                .AnyAsync(pair => pair.DuplicateCandidateId == candidate.CandidateId, cancellationToken);
            string code = isRecordedDuplicate ? IdentityErrorCodes.Duplicate : IdentityErrorCodes.Deactivated;
            ResultStatus status = isRecordedDuplicate ? ResultStatus.Conflict : ResultStatus.Forbidden;

            return Result.Failure<AuthSession>(status, code);
        }

        IdentityAttributes attributes = IdentityAttributes.FromProfile(profile);

        if (RefreshCandidateProfile(candidate, profile, attributes))
        {
            candidate.UpdatedAt = this.timeProvider.GetUtcNow();

            await this.dbContext.SaveChangesAsync(cancellationToken);
        }

        CurrentUser user = this.identityUsers.ForCandidate(candidate);

        return Result.Success(AuthSession.FromCurrentUser(user));
    }

    private async Task<Result<AuthSession>> ProvisionCandidateAsync(
        string idamUserId,
        IdentityProfile profile,
        CancellationToken cancellationToken)
    {
        IdentityAttributes attributes = IdentityAttributes.FromProfile(profile);
        Candidate? original = await this.FindOriginalAccountAsync(attributes, cancellationToken);
        string candidateNumber = await this.candidateNumberAllocator.AllocateAsync(cancellationToken);
        DateTimeOffset now = this.timeProvider.GetUtcNow();

        // A suspected duplicate is stored inactive, so it can be reported but never used (US-1.1.1 AC5-AC6).
        Candidate candidate = new()
        {
            PublicId = Guid.CreateVersion7(now),
            CandidateNumber = candidateNumber,
            IdamUserId = idamUserId,
            DisplayName = profile.DisplayName,
            Email = profile.Email,
            MobileNumber = attributes.MobileNumber,
            EmiratesIdNumber = attributes.EmiratesIdNumber,
            PassportNumber = attributes.PassportNumber,
            IsActive = original is null,
            CreatedAt = now,
        };

        this.dbContext.Candidates.Add(candidate);

        if (original is not null)
        {
            this.dbContext.DuplicateAccountPairs.Add(CreatePair(original, candidate, attributes, now));
        }

        await this.dbContext.SaveChangesAsync(cancellationToken);

        if (original is not null)
        {
            return Result.Failure<AuthSession>(ResultStatus.Conflict, IdentityErrorCodes.Duplicate);
        }

        CurrentUser user = this.identityUsers.ForCandidate(candidate);

        return Result.Success(AuthSession.FromCurrentUser(user));
    }

    private static DuplicateAccountPair CreatePair(
        Candidate original,
        Candidate duplicate,
        IdentityAttributes duplicateAttributes,
        DateTimeOffset detectedAt)
    {
        IdentityAttributes originalAttributes = new(
            original.EmiratesIdNumber,
            original.PassportNumber,
            original.MobileNumber);
        DuplicateAccountMatch match = DuplicateAccountMatch.Compare(duplicateAttributes, originalAttributes);

        DuplicateAccountPair pair = new()
        {
            PublicId = Guid.CreateVersion7(detectedAt),
            OriginalCandidateId = original.CandidateId,
            DuplicateCandidate = duplicate,
            MatchedOnEmiratesId = match.OnEmiratesId,
            MatchedOnPassport = match.OnPassport,
            MatchedOnMobile = match.OnMobile,
            DetectedAt = detectedAt,
        };

        return pair;
    }

    /// <summary>
    /// The earliest candidate whose Emirates ID, passport number or mobile number matches (US-1.1.1 AC4).
    /// </summary>
    private async Task<Candidate?> FindOriginalAccountAsync(
        IdentityAttributes attributes,
        CancellationToken cancellationToken)
    {
        string? emiratesIdNumber = attributes.EmiratesIdNumber;
        string? passportNumber = attributes.PassportNumber;
        string? mobileNumber = attributes.MobileNumber;

        if (emiratesIdNumber is null
            && passportNumber is null
            && mobileNumber is null)
        {
            return null;
        }

        // A missing attribute never matches, including another candidate's missing value.
        Candidate? original = await this.dbContext.Candidates
            .AsNoTracking()
            .Where(candidate => (emiratesIdNumber != null && candidate.EmiratesIdNumber == emiratesIdNumber)
                || (passportNumber != null && candidate.PassportNumber == passportNumber)
                || (mobileNumber != null && candidate.MobileNumber == mobileNumber))
            .OrderBy(candidate => candidate.CreatedAt)
            .ThenBy(candidate => candidate.CandidateId)
            .FirstOrDefaultAsync(cancellationToken);

        return original;
    }
}
