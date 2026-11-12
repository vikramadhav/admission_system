namespace DAHC.Identity.Core;

/// <summary>
/// A staff role held between two calendar dates (<c>idn.StaffRoleAssignment</c>). The dates are business dates
/// in the default time zone.
/// </summary>
public sealed class StaffRoleAssignment
{
    public int StaffRoleAssignmentId { get; set; }

    public required int StaffUserId { get; set; }

    public required string RoleCode { get; set; }

    public required DateOnly ValidFrom { get; set; }

    public DateOnly? ValidTo { get; set; }

    public bool IsHeldOn(DateOnly date)
    {
        bool hasStarted = this.ValidFrom <= date;
        bool hasNotEnded = this.ValidTo is null || this.ValidTo >= date;

        return hasStarted && hasNotEnded;
    }
}
