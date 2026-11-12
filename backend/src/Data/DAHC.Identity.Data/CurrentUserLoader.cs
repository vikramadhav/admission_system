using DAHC.Data;
using DAHC.Identity.Core;
using DAHC.Identity.Service;
using DAHC.Service.Access;
using Microsoft.EntityFrameworkCore;

namespace DAHC.Identity.Data;

/// <summary>
/// Loads the local user for the validated issuer and subject on every request, never for the subject alone
/// (AP-04). A staff record wins over a candidate record for
/// the same identity: after a conversion the candidate records are no longer reachable through a Candidate role.
/// </summary>
internal sealed class CurrentUserLoader : ICurrentUserLoader
{
    private readonly DahcDbContext dbContext;

    private readonly IdentityUsers identityUsers;

    public CurrentUserLoader(DahcDbContext dbContext, IdentityUsers identityUsers)
    {
        this.dbContext = dbContext;
        this.identityUsers = identityUsers;
    }

    public async Task<CurrentUserLoadResult> LoadAsync(IdamIdentity identity, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(identity);

        string issuer = identity.Issuer;
        string subject = identity.Subject;

        try
        {
            StaffUser? staffUser = await this.dbContext.StaffUsers
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    staff => staff.IdamIssuer == issuer && staff.IdamUserId == subject,
                    cancellationToken);

            if (staffUser is not null)
            {
                return await this.LoadStaffAsync(staffUser, cancellationToken);
            }

            Candidate? candidate = await this.dbContext.Candidates
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    existing => existing.IdamIssuer == issuer && existing.IdamUserId == subject,
                    cancellationToken);

            return this.LoadCandidate(candidate);
        }
        catch (Exception exception) when (DahcDataException.IsDatabaseFailure(exception))
        {
            throw new DahcDataException("CurrentUserLoader.LoadAsync", exception);
        }
    }

    private async Task<CurrentUserLoadResult> LoadStaffAsync(StaffUser staffUser, CancellationToken cancellationToken)
    {
        if (!staffUser.IsActive)
        {
            return new CurrentUserLoadResult(AccessStatus.Deactivated, null);
        }

        CurrentUser? user = await this.identityUsers.ForStaffAsync(staffUser, cancellationToken);

        if (user is null)
        {
            return new CurrentUserLoadResult(AccessStatus.NoRole, null);
        }

        return new CurrentUserLoadResult(AccessStatus.Active, user);
    }

    private CurrentUserLoadResult LoadCandidate(Candidate? candidate)
    {
        if (candidate is null)
        {
            return new CurrentUserLoadResult(AccessStatus.NotRegistered, null);
        }

        if (!candidate.IsActive)
        {
            return new CurrentUserLoadResult(AccessStatus.Deactivated, null);
        }

        CurrentUser user = this.identityUsers.ForCandidate(candidate);

        return new CurrentUserLoadResult(AccessStatus.Active, user);
    }
}
