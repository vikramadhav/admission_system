using DAHC.Data;
using DAHC.Data.Operations;
using DAHC.Identity.Core;
using DAHC.Identity.Service;
using DAHC.Service.Access;
using DAHC.Service.Results;
using Microsoft.EntityFrameworkCore;

namespace DAHC.Identity.Data;

/// <summary>
/// First and later sign-ins (US-1.1.1, US-1.1.2) and the active-role switch (standard s.15). Every outcome writes
/// one security audit event (BE-03, DEC-07): with the change it describes when there is one, otherwise on its own.
/// </summary>
internal sealed class AuthSessionService : IAuthSessionService
{
    private const string CandidateResource = "candidate";

    private const string StaffUserResource = "staff_user";

    private const string RoleResource = "role";

    private readonly DahcDbContext dbContext;

    private readonly IdentityUsers identityUsers;

    private readonly ICandidateNumberAllocator candidateNumberAllocator;

    private readonly AuditWriter auditWriter;

    private readonly TimeProvider timeProvider;

    public AuthSessionService(
        DahcDbContext dbContext,
        IdentityUsers identityUsers,
        ICandidateNumberAllocator candidateNumberAllocator,
        AuditWriter auditWriter,
        TimeProvider timeProvider)
    {
        this.dbContext = dbContext;
        this.identityUsers = identityUsers;
        this.candidateNumberAllocator = candidateNumberAllocator;
        this.auditWriter = auditWriter;
        this.timeProvider = timeProvider;
    }

    public async Task<Result<AuthSession>> SignInAsync(
        IdamIdentity identity,
        IdentityProfile profile,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(identity);
        ArgumentNullException.ThrowIfNull(profile);

        try
        {
            Result<AuthSession>? result = await this.TrySignInAsync(identity, profile, cancellationToken);

            if (result is null)
            {
                // Concurrent first sign-ins: the unique index on (IdamIssuer, IdamUserId) rejected this insert, so
                // the record the other sign-in created is used instead.
                this.dbContext.ChangeTracker.Clear();
                result = await this.TrySignInAsync(identity, profile, cancellationToken)
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

        try
        {
            // A candidate holds one role, and a staff user may only switch to a role they hold.
            if (user.UserType != UserType.Staff
                || !ActiveRoleRules.CanSwitchTo(user.Roles, roleCode))
            {
                return await this.RefuseRoleSwitchAsync(user, roleCode, IdentityErrorCodes.RoleNotHeld);
            }

            StaffUser? staffUser = await this.dbContext.StaffUsers
                .FirstOrDefaultAsync(staff => staff.StaffUserId == user.InternalId, cancellationToken);

            if (staffUser is null)
            {
                return await this.RefuseRoleSwitchAsync(user, roleCode, IdentityErrorCodes.NotRegistered);
            }

            staffUser.ActiveRoleCode = roleCode;
            staffUser.UpdatedAt = this.timeProvider.GetUtcNow();

            // The resource is the role switched to; role codes are not personal data.
            this.auditWriter.Add(
                new AuditRecord(AuditActions.ActiveRoleSwitched, AuditOutcomes.Success, RoleResource, roleCode)
                {
                    ActorStaffUserId = staffUser.StaffUserId,
                });

            await this.dbContext.SaveChangesAsync(cancellationToken);

            CurrentUser switchedUser = user with { ActiveRole = roleCode };

            return Result.Success(AuthSession.FromCurrentUser(switchedUser));
        }
        catch (Exception exception) when (DahcDataException.IsDatabaseFailure(exception))
        {
            throw new DahcDataException("AuthSessionService.SwitchActiveRoleAsync", exception);
        }
    }

    private static AuditRecord SignInRecord(StaffUser staffUser, string outcome, string? reasonCode)
    {
        return new AuditRecord(AuditActions.SignIn, outcome, StaffUserResource, staffUser.PublicId.ToString())
        {
            ReasonCode = reasonCode,
            ActorStaffUserId = staffUser.StaffUserId,
        };
    }

    private static AuditRecord SignInRecord(Candidate candidate, string outcome, string? reasonCode)
    {
        return new AuditRecord(AuditActions.SignIn, outcome, CandidateResource, candidate.PublicId.ToString())
        {
            ReasonCode = reasonCode,
            ActorCandidateId = candidate.CandidateId,
        };
    }

    private async Task<Result<AuthSession>> RefuseRoleSwitchAsync(CurrentUser user, string roleCode, string reasonCode)
    {
        AuditRecord record = new(AuditActions.ActiveRoleSwitched, AuditOutcomes.Denied, RoleResource, roleCode)
        {
            ReasonCode = reasonCode,
            ActorStaffUserId = user.UserType == UserType.Staff ? (int)user.InternalId : null,
            ActorCandidateId = user.UserType == UserType.Candidate ? user.InternalId : null,
        };

        await this.auditWriter.WriteAsync(record);

        return Result.Failure<AuthSession>(ResultStatus.Forbidden, reasonCode);
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
        IdamIdentity identity,
        IdentityProfile profile,
        CancellationToken cancellationToken)
    {
        try
        {
            return await this.SignInOnceAsync(identity, profile, cancellationToken);
        }
        catch (DbUpdateException exception) when (DahcDataException.IsUniqueViolation(exception))
        {
            return null;
        }
    }

    private async Task<Result<AuthSession>> SignInOnceAsync(
        IdamIdentity identity,
        IdentityProfile profile,
        CancellationToken cancellationToken)
    {
        // Issuer and subject are matched together, never the subject alone (AP-04): the same subject from another
        // issuer is another identity.
        string issuer = identity.Issuer;
        string subject = identity.Subject;

        // A pre-registered staff user is matched first, so no Candidate is ever created for them.
        StaffUser? staffUser = await this.dbContext.StaffUsers
            .FirstOrDefaultAsync(
                staff => staff.IdamIssuer == issuer && staff.IdamUserId == subject,
                cancellationToken);

        if (staffUser is not null)
        {
            return await this.SignInStaffAsync(staffUser, profile, cancellationToken);
        }

        Candidate? candidate = await this.dbContext.Candidates
            .FirstOrDefaultAsync(
                existing => existing.IdamIssuer == issuer && existing.IdamUserId == subject,
                cancellationToken);

        if (candidate is not null)
        {
            return await this.SignInCandidateAsync(candidate, profile, cancellationToken);
        }

        return await this.ProvisionCandidateAsync(identity, profile, cancellationToken);
    }

    private async Task<Result<AuthSession>> SignInStaffAsync(
        StaffUser staffUser,
        IdentityProfile profile,
        CancellationToken cancellationToken)
    {
        // A deactivated user is refused and never reactivated by signing in.
        if (!staffUser.IsActive)
        {
            await this.auditWriter.WriteAsync(
                SignInRecord(staffUser, AuditOutcomes.Denied, IdentityErrorCodes.Deactivated));

            return Result.Failure<AuthSession>(ResultStatus.Forbidden, IdentityErrorCodes.Deactivated);
        }

        string email = profile.Email ?? staffUser.Email;
        bool hasChanged = staffUser.DisplayName != profile.DisplayName || staffUser.Email != email;

        if (hasChanged)
        {
            staffUser.DisplayName = profile.DisplayName;
            staffUser.Email = email;
            staffUser.UpdatedAt = this.timeProvider.GetUtcNow();
        }

        CurrentUser? user = await this.identityUsers.ForStaffAsync(staffUser, cancellationToken);
        string? refusal = user is null ? IdentityErrorCodes.NoRole : null;

        // One save: the profile refresh (kept even when no role is held) and the sign-in event together.
        this.auditWriter.Add(
            SignInRecord(staffUser, refusal is null ? AuditOutcomes.Success : AuditOutcomes.Denied, refusal));

        await this.dbContext.SaveChangesAsync(cancellationToken);

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

            await this.auditWriter.WriteAsync(SignInRecord(candidate, AuditOutcomes.Denied, code));

            return Result.Failure<AuthSession>(status, code);
        }

        IdentityAttributes attributes = IdentityAttributes.FromProfile(profile);

        if (RefreshCandidateProfile(candidate, profile, attributes))
        {
            candidate.UpdatedAt = this.timeProvider.GetUtcNow();
        }

        // One save: any profile refresh and the sign-in event together.
        this.auditWriter.Add(SignInRecord(candidate, AuditOutcomes.Success, null));

        await this.dbContext.SaveChangesAsync(cancellationToken);

        CurrentUser user = this.identityUsers.ForCandidate(candidate);

        return Result.Success(AuthSession.FromCurrentUser(user));
    }

    private async Task<Result<AuthSession>> ProvisionCandidateAsync(
        IdamIdentity identity,
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
            IdamIssuer = identity.Issuer,
            IdamUserId = identity.Subject,
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

        // Saved with the new account, so the event exists exactly when the account does. The actor has no local
        // id until this save (the token user is the actor); the new account's public id is the resource. Which
        // attributes matched stays on the duplicate pair, never in the audit event (US-1.1.1 AC4-AC6).
        this.auditWriter.Add(original is null
            ? new AuditRecord(
                AuditActions.AccountProvisioned,
                AuditOutcomes.Success,
                CandidateResource,
                candidate.PublicId.ToString())
            : new AuditRecord(
                AuditActions.DuplicateDetected,
                AuditOutcomes.Denied,
                CandidateResource,
                candidate.PublicId.ToString())
            {
                ReasonCode = IdentityErrorCodes.Duplicate,
            });

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
