namespace DAHC.Data.Operations;

/// <summary>
/// One security or business event for <see cref="AuditWriter"/>. The resource is referenced by its public id (or
/// another non-sensitive key); the actor defaults to the request's current user unless it is given here, for
/// events about an account that is not (or not yet) the active current user.
/// </summary>
public sealed record AuditRecord(string ActionCode, string Outcome, string ResourceType, string ResourceId)
{
    /// <summary>
    /// The refusal's error code; required for any outcome other than <see cref="AuditOutcomes.Success"/>.
    /// </summary>
    public string? ReasonCode { get; init; }

    public long? ActorCandidateId { get; init; }

    public int? ActorStaffUserId { get; init; }
}

/// <summary>
/// The outcomes allowed by <c>CK_AuditEvent_Outcome</c>.
/// </summary>
public static class AuditOutcomes
{
    public const string Success = "SUCCESS";

    public const string Denied = "DENIED";

    public const string Failed = "FAILED";
}

/// <summary>
/// Action codes of the security and provisioning events (BE-03, standard s.19). Row-change events keep their
/// generated <c>&lt;table&gt;.&lt;change&gt;</c> codes.
/// </summary>
public static class AuditActions
{
    /// <summary>
    /// A first sign-in created a Candidate (US-1.1.1).
    /// </summary>
    public const string AccountProvisioned = "account.provisioned";

    /// <summary>
    /// A first sign-in matched another candidate's identity attributes, so the new account was stored inactive and
    /// refused (US-1.1.1 AC4-AC6).
    /// </summary>
    public const string DuplicateDetected = "account.duplicate_detected";

    /// <summary>
    /// A sign-in by an existing staff user or candidate (US-1.1.2), allowed or refused.
    /// </summary>
    public const string SignIn = "auth.sign_in";

    /// <summary>
    /// A staff user's switch of active role (standard s.15), allowed or refused.
    /// </summary>
    public const string ActiveRoleSwitched = "auth.active_role_switched";

    /// <summary>
    /// An authenticated request refused by authorization (403).
    /// </summary>
    public const string AccessDenied = "access.denied";
}
