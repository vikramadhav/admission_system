using System.Globalization;
using System.Security.Claims;
using DAHC.Identity.Service;
using DAHC.Service.Access;

namespace DAHC.API.Authentication;

/// <summary>
/// The fields of a validated token that authentication needs: subject, client, issuer and expiry.
/// </summary>
public sealed record TokenClaims(string? Subject, string? ClientId, string? Issuer, DateTimeOffset? ExpiresAt)
{
    public static TokenClaims From(ClaimsPrincipal principal)
    {
        ArgumentNullException.ThrowIfNull(principal);

        string? expiry = principal.FindFirst(IdamClaimNames.Expiry)?.Value;
        bool hasExpiry = long.TryParse(expiry, NumberStyles.None, CultureInfo.InvariantCulture, out long seconds);

        TokenClaims claims = new(
            principal.FindFirst(IdamClaimNames.Subject)?.Value,
            principal.FindFirst(IdamClaimNames.ClientId)?.Value,
            principal.FindFirst(IdamClaimNames.Issuer)?.Value,
            hasExpiry ? DateTimeOffset.FromUnixTimeSeconds(seconds) : null);

        return claims;
    }

    /// <summary>
    /// Classifies the token with the shared classifier; a client other than the web client is looked up in the
    /// integration client records.
    /// </summary>
    public async Task<TokenKind?> ClassifyAsync(
        string webClientId,
        IIntegrationClientDirectory integrationClients,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(integrationClients);

        bool isWebClient = string.Equals(this.ClientId, webClientId, StringComparison.Ordinal);
        bool isIntegrationClient = false;

        if (!isWebClient
            && !string.IsNullOrWhiteSpace(this.ClientId))
        {
            isIntegrationClient = await integrationClients.IsActiveIntegrationClientAsync(
                this.ClientId,
                cancellationToken);
        }

        return TokenClassifier.Classify(this.Subject, this.ClientId, webClientId, isIntegrationClient);
    }
}
