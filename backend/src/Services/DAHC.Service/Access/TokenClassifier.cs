namespace DAHC.Service.Access;

/// <summary>
/// The one shared classification of a validated token, made from the introspection response.
/// Endpoints never inspect raw claims.
/// </summary>
public static class TokenClassifier
{
    /// <summary>
    /// Returns null when the token was not issued to a DAHC client and must be refused.
    /// </summary>
    /// <remarks>
    /// The exact introspection fields for the client credentials grant are pending with the IDAM team (OQ-15):
    /// a token without a user subject, or whose subject is the client id, is treated as the client acting as itself.
    /// </remarks>
    public static TokenKind? Classify(
        string? subject,
        string? clientId,
        string webClientId,
        bool isRegisteredIntegrationClient)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(webClientId);

        if (string.IsNullOrWhiteSpace(clientId))
        {
            return null;
        }

        bool hasUserSubject = !string.IsNullOrWhiteSpace(subject)
            && !string.Equals(subject, clientId, StringComparison.Ordinal);

        if (string.Equals(clientId, webClientId, StringComparison.Ordinal))
        {
            return hasUserSubject ? TokenKind.User : null;
        }

        if (!isRegisteredIntegrationClient)
        {
            return null;
        }

        return hasUserSubject ? TokenKind.UserViaIntegration : TokenKind.IntegrationOnly;
    }
}
