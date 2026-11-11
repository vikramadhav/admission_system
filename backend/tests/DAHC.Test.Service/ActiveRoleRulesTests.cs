using DAHC.Identity.Service;
using DAHC.Service.Access;

namespace DAHC.Test.Service;

public sealed class ActiveRoleRulesTests
{
    private static readonly IReadOnlyList<string> roleOrder =
    [
        RoleCodes.Administrator,
        RoleCodes.AdmissionSupervisor,
        RoleCodes.AdmissionOfficer,
        RoleCodes.Referee,
    ];

    [Fact]
    public void SwitchToRoleNotHeld_IsRefused()
    {
        string[] heldRoles = [RoleCodes.AdmissionOfficer, RoleCodes.Referee];

        bool canSwitch = ActiveRoleRules.CanSwitchTo(heldRoles, RoleCodes.Administrator);

        Assert.False(canSwitch);
    }

    [Fact]
    public void StoredActiveRoleNoLongerHeld_FallsBackToFirstHeldRoleInConfiguredOrder()
    {
        string[] heldRoles = [RoleCodes.Referee, RoleCodes.AdmissionOfficer];

        string? activeRole = ActiveRoleRules.ResolveActiveRole(heldRoles, RoleCodes.AdmissionSupervisor, roleOrder);

        Assert.Equal(RoleCodes.AdmissionOfficer, activeRole);
    }

    [Fact]
    public void StoredActiveRoleStillHeld_StaysActive()
    {
        string[] heldRoles = [RoleCodes.AdmissionOfficer, RoleCodes.Referee];

        string? activeRole = ActiveRoleRules.ResolveActiveRole(heldRoles, RoleCodes.Referee, roleOrder);

        Assert.Equal(RoleCodes.Referee, activeRole);
    }

    [Fact]
    public void NoRoleLeft_ResolvesNoActiveRole()
    {
        string[] heldRoles = [];

        string? activeRole = ActiveRoleRules.ResolveActiveRole(heldRoles, RoleCodes.Referee, roleOrder);

        Assert.Null(activeRole);
    }
}
