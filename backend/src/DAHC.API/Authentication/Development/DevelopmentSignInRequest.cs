namespace DAHC.API.Authentication.Development;

/// <summary>
/// Development only. Signs in as any development identity: a user (subject, web client by default), an
/// integration client acting as itself (client id, no subject) or a user via an integration client. The profile
/// fields stand in for IDAM UserInfo and must be synthetic.
/// </summary>
public sealed record DevelopmentSignInRequest
{
    public string? Subject { get; init; }

    public string? ClientId { get; init; }

    public required string Password { get; init; }

    public string? DisplayName { get; init; }

    public string? Email { get; init; }

    public string? MobileNumber { get; init; }

    public string? EmiratesId { get; init; }

    public string? PassportNumber { get; init; }
}

/// <summary>
/// A short-lived development access token and its expiry.
/// </summary>
public sealed record DevelopmentToken(string AccessToken, DateTimeOffset ExpiresAt);
