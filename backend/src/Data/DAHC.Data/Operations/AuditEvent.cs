namespace DAHC.Data.Operations;

/// <summary>
/// One append-only audit record (<c>ops.AuditEvent</c>): who did what to which record, in which role, with what
/// outcome and when. It never holds entity values, request bodies, credentials or tokens.
/// </summary>
public sealed class AuditEvent
{
    public long AuditEventId { get; set; }

    public required Guid PublicId { get; set; }

    public required DateTimeOffset OccurredAt { get; set; }

    /// <summary>
    /// <c>CANDIDATE</c>, <c>STAFF</c>, <c>SERVICE</c> or <c>SYSTEM</c>.
    /// </summary>
    public required string ActorType { get; set; }

    public long? ActorCandidateId { get; set; }

    public int? ActorStaffUserId { get; set; }

    public string? ActiveRoleCode { get; set; }

    public required string ActionCode { get; set; }

    public required string ResourceType { get; set; }

    public required string ResourceId { get; set; }

    /// <summary>
    /// <c>SUCCESS</c>, <c>DENIED</c> or <c>FAILED</c>.
    /// </summary>
    public required string Outcome { get; set; }

    public string? RequestId { get; set; }
}
