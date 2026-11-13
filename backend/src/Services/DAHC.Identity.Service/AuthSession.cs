using DAHC.Service.Access;

namespace DAHC.Identity.Service;

/// <summary>
/// The signed-in user as known to DAHC (contract <c>AuthSession</c>).
/// </summary>
public sealed record AuthSession
{
    public required UserType UserType { get; init; }

    public required Guid UserId { get; init; }

    public string? CandidateNumber { get; init; }

    public required string DisplayName { get; init; }

    public string? Email { get; init; }

    public required IReadOnlyList<string> Roles { get; init; }

    public required string ActiveRole { get; init; }

    public required UserPreferences Preferences { get; init; }

    public static AuthSession FromCurrentUser(CurrentUser user)
    {
        ArgumentNullException.ThrowIfNull(user);

        AuthSession session = new()
        {
            UserType = user.UserType,
            UserId = user.PublicId,
            CandidateNumber = user.CandidateNumber,
            DisplayName = user.DisplayName,
            Email = user.Email,
            Roles = user.Roles,
            ActiveRole = user.ActiveRole,
            Preferences = new UserPreferences(user.TimeZoneId, user.Culture),
        };

        return session;
    }
}

/// <summary>
/// The user's display preferences: an IANA time zone id and a supported culture.
/// </summary>
public sealed record UserPreferences(string TimeZoneId, string Culture);
