using System.ComponentModel.DataAnnotations;
using DAHC.Service.Access;

namespace DAHC.API.Configuration;

/// <summary>
/// The configured staff role order used when a user's stored active role is no longer held.
/// </summary>
public sealed class AccessOptions
{
    public const string SectionName = "Access";

    [Required]
    [MinLength(1)]
    public string[] StaffRoleOrder { get; set; } = [];

    public bool IsConsistent()
    {
        bool containsOnlyStaffRoles = this.StaffRoleOrder.All(RoleCodes.IsStaffRole);
        bool containsEveryStaffRole = RoleCodes.StaffRoles.All(
            role => this.StaffRoleOrder.Contains(role, StringComparer.Ordinal));

        return containsOnlyStaffRoles && containsEveryStaffRole;
    }

    public AccessSettings ToSettings()
    {
        return new AccessSettings(this.StaffRoleOrder);
    }
}
