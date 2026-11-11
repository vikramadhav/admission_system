namespace DAHC.Service.Access;

/// <summary>
/// The configured order of staff roles. When a user's stored active role is no longer held, the first held role
/// in this order becomes the active role (standard s.15).
/// </summary>
public sealed record AccessSettings(IReadOnlyList<string> StaffRoleOrder);
