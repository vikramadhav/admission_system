namespace DAHC.Service.Access;

/// <summary>
/// Internal role codes held in the DAHC database. They equal the codes of the <c>idn.AccessRole</c> reference
/// data and the contract's <c>StaffRoleCode</c>. IDAM role, group or entitlement claims never map to them.
/// </summary>
public static class RoleCodes
{
    public const string Candidate = "CANDIDATE";

    public const string Administrator = "ADMINISTRATOR";

    public const string AdmissionOfficer = "ADMISSION_OFFICER";

    public const string AdmissionSupervisor = "ADMISSION_SUPERVISOR";

    public const string CentralMonitor = "CENTRAL_MONITOR";

    public const string FinanceOfficer = "FINANCE_OFFICER";

    public const string Referee = "REFEREE";

    public const string ThirdReferee = "THIRD_REFEREE";

    public const string SecondEvaluationReferee = "SECOND_EVALUATION_REFEREE";

    public const string SeniorReferee = "SENIOR_REFEREE";

    public static IReadOnlyList<string> StaffRoles { get; } =
    [
        Administrator,
        AdmissionOfficer,
        AdmissionSupervisor,
        CentralMonitor,
        FinanceOfficer,
        Referee,
        ThirdReferee,
        SecondEvaluationReferee,
        SeniorReferee,
    ];

    public static bool IsStaffRole(string roleCode)
    {
        return StaffRoles.Contains(roleCode, StringComparer.Ordinal);
    }
}
