namespace DAHC.Service.Access;

/// <summary>
/// Per-request holder of the caller's access state. The API fills it once per request, after authentication;
/// authorization, services and the audit interceptor read it.
/// </summary>
public sealed class CurrentAccess
{
    public AccessStatus Status { get; private set; } = AccessStatus.Anonymous;

    /// <summary>
    /// The IDAM user identifier from the validated token, when the token represents a user.
    /// </summary>
    public string? IdamUserId { get; private set; }

    public TokenKind? TokenKind { get; private set; }

    public CurrentUser? User { get; private set; }

    public void SetActiveUser(string idamUserId, CurrentUser user)
    {
        ArgumentNullException.ThrowIfNull(user);

        this.SetUserToken(idamUserId);
        this.User = user;
        this.Status = AccessStatus.Active;
    }

    public void SetRefusedUser(string idamUserId, AccessStatus status)
    {
        if (status is AccessStatus.Active or AccessStatus.Anonymous)
        {
            throw new ArgumentException("A refused user needs a refusal status.", nameof(status));
        }

        this.SetUserToken(idamUserId);
        this.User = null;
        this.Status = status;
    }

    /// <summary>
    /// Integration-only and user-via-integration tokens: no endpoint in this release declares an integration
    /// permission, and acting for a user through middleware is not supported until a middleware needs it (D-21).
    /// </summary>
    public void SetIntegrationNotPermitted(TokenKind tokenKind)
    {
        this.TokenKind = tokenKind;
        this.User = null;
        this.Status = AccessStatus.IntegrationNotPermitted;
    }

    private void SetUserToken(string idamUserId)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(idamUserId);

        this.IdamUserId = idamUserId;
        this.TokenKind = Access.TokenKind.User;
    }
}
