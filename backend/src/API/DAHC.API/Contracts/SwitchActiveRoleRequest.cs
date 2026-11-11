using System.ComponentModel.DataAnnotations;
using DAHC.Service.Access;

namespace DAHC.API.Contracts;

/// <summary>
/// Body of <c>switchActiveRole</c>: a staff role code (contract <c>StaffRoleCode</c>).
/// </summary>
public sealed record SwitchActiveRoleRequest
{
    [Required]
    [AllowedValues(
        RoleCodes.Administrator,
        RoleCodes.AdmissionOfficer,
        RoleCodes.AdmissionSupervisor,
        RoleCodes.CentralMonitor,
        RoleCodes.FinanceOfficer,
        RoleCodes.Referee,
        RoleCodes.ThirdReferee,
        RoleCodes.SecondEvaluationReferee,
        RoleCodes.SeniorReferee)]
    public string? RoleCode { get; init; }
}
