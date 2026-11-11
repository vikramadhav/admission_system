namespace DAHC.Identity.Service;

/// <summary>
/// Profile attributes from IDAM UserInfo, called by the API itself. Holds personal data: never logged, audited
/// or returned; the identity numbers are normalised before they are stored (<see cref="IdentityAttributes"/>).
/// </summary>
public sealed record IdentityProfile
{
    public required string Subject { get; init; }

    public required string DisplayName { get; init; }

    public string? Email { get; init; }

    public string? MobileNumber { get; init; }

    public string? EmiratesId { get; init; }

    public string? PassportNumber { get; init; }
}
