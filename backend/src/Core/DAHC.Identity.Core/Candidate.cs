namespace DAHC.Identity.Core;

/// <summary>
/// A candidate account (<c>idn.Candidate</c>). Matched to IDAM only by <see cref="IdamIssuer"/> and
/// <see cref="IdamUserId"/> together (AP-04, DEC-01); the profile attributes are refreshed from IDAM UserInfo at
/// every sign-in and never edited in DAHC.
/// </summary>
public sealed class Candidate
{
    public long CandidateId { get; set; }

    public required Guid PublicId { get; set; }

    /// <summary>
    /// Nine digits with leading zeros, always text (D-05, D-13).
    /// </summary>
    public required string CandidateNumber { get; set; }

    /// <summary>
    /// The validated issuer (<c>iss</c>) of the token the candidate was provisioned from.
    /// </summary>
    public required string IdamIssuer { get; set; }

    /// <summary>
    /// The validated subject (<c>sub</c>); unique only together with <see cref="IdamIssuer"/>.
    /// </summary>
    public required string IdamUserId { get; set; }

    public required string DisplayName { get; set; }

    public string? Email { get; set; }

    /// <summary>
    /// International form <c>+&lt;digits&gt;</c>; also a duplicate-account match key.
    /// </summary>
    public string? MobileNumber { get; set; }

    /// <summary>
    /// Digits only. Personal data: never logged or audited.
    /// </summary>
    public string? EmiratesIdNumber { get; set; }

    /// <summary>
    /// Letters and digits, upper case. Personal data: never logged or audited.
    /// </summary>
    public string? PassportNumber { get; set; }

    public string? PreferredCulture { get; set; }

    public string? PreferredTimeZoneId { get; set; }

    public bool IsActive { get; set; }

    public required DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset? UpdatedAt { get; set; }
}
