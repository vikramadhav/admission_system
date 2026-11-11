namespace DAHC.Identity.Core;

/// <summary>
/// A staff user (<c>idn.StaffUser</c>), pre-registered by an Administrator with the IDAM user identifier and staff
/// roles before the first sign-in. Never created by signing in.
/// </summary>
public sealed class StaffUser
{
    public int StaffUserId { get; set; }

    public required Guid PublicId { get; set; }

    public string? IdamUserId { get; set; }

    public required string DisplayName { get; set; }

    public required string Email { get; set; }

    /// <summary>
    /// The role chosen in the role switcher; used only while the user still holds it.
    /// </summary>
    public string? ActiveRoleCode { get; set; }

    /// <summary>
    /// The same person's candidate record (D-14).
    /// </summary>
    public Guid? LinkedCandidatePublicId { get; set; }

    public string? PreferredCulture { get; set; }

    public string? PreferredTimeZoneId { get; set; }

    public bool IsActive { get; set; }

    public required DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset? UpdatedAt { get; set; }
}
