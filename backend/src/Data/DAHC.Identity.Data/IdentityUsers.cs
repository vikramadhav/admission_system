using DAHC.Data;
using DAHC.Identity.Core;
using DAHC.Identity.Service;
using DAHC.Service.Access;
using DAHC.Service.Time;
using Microsoft.EntityFrameworkCore;

namespace DAHC.Identity.Data;

/// <summary>
/// Builds the per-request <see cref="CurrentUser"/> from candidate and staff records, and loads the staff roles
/// held today. Shared by sign-in and the per-request loader so both apply the same rules.
/// </summary>
internal sealed class IdentityUsers
{
    private readonly DahcDbContext dbContext;

    private readonly LocalTimeService localTimeService;

    private readonly AccessSettings accessSettings;

    private readonly LocaleSettings localeSettings;

    public IdentityUsers(
        DahcDbContext dbContext,
        LocalTimeService localTimeService,
        AccessSettings accessSettings,
        LocaleSettings localeSettings)
    {
        this.dbContext = dbContext;
        this.localTimeService = localTimeService;
        this.accessSettings = accessSettings;
        this.localeSettings = localeSettings;
    }

    public CurrentUser ForCandidate(Candidate candidate)
    {
        CurrentUser user = new()
        {
            UserType = UserType.Candidate,
            PublicId = candidate.PublicId,
            InternalId = candidate.CandidateId,
            CandidateNumber = candidate.CandidateNumber,
            DisplayName = candidate.DisplayName,
            Email = candidate.Email,
            Roles = [RoleCodes.Candidate],
            ActiveRole = RoleCodes.Candidate,
            Culture = candidate.PreferredCulture ?? this.localeSettings.DefaultCulture,
            TimeZoneId = candidate.PreferredTimeZoneId ?? this.localeSettings.DefaultTimeZoneId,
        };

        return user;
    }

    /// <summary>
    /// The staff user with the roles held today, or null when no staff role is held.
    /// </summary>
    public async Task<CurrentUser?> ForStaffAsync(StaffUser staffUser, CancellationToken cancellationToken)
    {
        IReadOnlyList<string> heldRoles = await this.LoadHeldRolesAsync(staffUser.StaffUserId, cancellationToken);
        string? activeRole = ActiveRoleRules.ResolveActiveRole(
            heldRoles,
            staffUser.ActiveRoleCode,
            this.accessSettings.StaffRoleOrder);

        if (activeRole is null)
        {
            return null;
        }

        CurrentUser user = new()
        {
            UserType = UserType.Staff,
            PublicId = staffUser.PublicId,
            InternalId = staffUser.StaffUserId,
            DisplayName = staffUser.DisplayName,
            Email = staffUser.Email,
            Roles = heldRoles,
            ActiveRole = activeRole,
            Culture = staffUser.PreferredCulture ?? this.localeSettings.DefaultCulture,
            TimeZoneId = staffUser.PreferredTimeZoneId ?? this.localeSettings.DefaultTimeZoneId,
            LinkedCandidatePublicId = staffUser.LinkedCandidatePublicId,
        };

        return user;
    }

    private async Task<IReadOnlyList<string>> LoadHeldRolesAsync(int staffUserId, CancellationToken cancellationToken)
    {
        List<StaffRoleAssignment> assignments = await this.dbContext.StaffRoleAssignments
            .AsNoTracking()
            .Where(assignment => assignment.StaffUserId == staffUserId)
            .ToListAsync(cancellationToken);

        // Assignment dates are business dates in the default time zone.
        DateOnly today = this.localTimeService.GetToday(null);

        // Candidate is never a staff role: a user holds either the Candidate role alone or staff roles (s.15).
        IEnumerable<string> heldRoles = assignments
            .Where(assignment => assignment.IsHeldOn(today))
            .Select(assignment => assignment.RoleCode)
            .Where(RoleCodes.IsStaffRole);

        return ActiveRoleRules.OrderRoles(heldRoles, this.accessSettings.StaffRoleOrder);
    }
}
