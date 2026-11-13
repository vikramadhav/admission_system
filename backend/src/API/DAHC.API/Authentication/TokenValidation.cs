using System.Security.Claims;
using DAHC.API.Configuration;
using DAHC.Identity.Service;
using DAHC.Service.Access;
using Microsoft.Extensions.Options;

namespace DAHC.API.Authentication;

/// <summary>
/// The checks a token must pass after its signature or introspection succeeded (standard s.15): the exact
/// issuer, an unexpired lifetime and a DAHC client.
/// </summary>
public static class TokenValidation
{
    /// <summary>
    /// Returns why the token is refused, or null when it is accepted.
    /// </summary>
    public static async Task<string?> FindRejectionAsync(
        ClaimsPrincipal? principal,
        HttpContext httpContext,
        bool checkIssuerAndExpiry)
    {
        ArgumentNullException.ThrowIfNull(httpContext);

        if (principal is null)
        {
            return "token.missing_principal";
        }

        IServiceProvider services = httpContext.RequestServices;
        IdamOptions idam = services.GetRequiredService<IOptions<IdamOptions>>().Value;
        TokenClaims claims = TokenClaims.From(principal);

        if (checkIssuerAndExpiry)
        {
            DateTimeOffset now = services.GetRequiredService<TimeProvider>().GetUtcNow();

            if (!string.Equals(claims.Issuer, idam.Issuer, StringComparison.Ordinal))
            {
                return "token.issuer_mismatch";
            }

            if (claims.ExpiresAt is null
                || claims.ExpiresAt <= now)
            {
                return "token.expired";
            }
        }

        IIntegrationClientDirectory integrationClients = services.GetRequiredService<IIntegrationClientDirectory>();
        TokenKind? tokenKind = await claims.ClassifyAsync(
            idam.WebClientId,
            integrationClients,
            httpContext.RequestAborted);

        return tokenKind is null ? "token.client_not_registered" : null;
    }
}
