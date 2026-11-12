using DAHC.API.Authentication;
using DAHC.API.Configuration;
using DAHC.Identity.Service;
using DAHC.Service.Access;
using Microsoft.Extensions.Options;

namespace DAHC.API.Http;

/// <summary>
/// After authentication, classifies the token and loads the active local user and roles from the DAHC database
/// on every request, so a deactivation or role change takes effect on the next request (standard s.15).
/// </summary>
public sealed class AccessContextMiddleware
{
    private readonly RequestDelegate next;

    public AccessContextMiddleware(RequestDelegate next)
    {
        this.next = next;
    }

    public async Task InvokeAsync(
        HttpContext httpContext,
        CurrentAccess currentAccess,
        ICurrentUserLoader currentUserLoader,
        IIntegrationClientDirectory integrationClients,
        IOptions<IdamOptions> idamOptions,
        ILogger<AccessContextMiddleware> logger)
    {
        ArgumentNullException.ThrowIfNull(httpContext);
        ArgumentNullException.ThrowIfNull(currentAccess);
        ArgumentNullException.ThrowIfNull(currentUserLoader);
        ArgumentNullException.ThrowIfNull(idamOptions);
        ArgumentNullException.ThrowIfNull(logger);

        if (httpContext.User.Identity?.IsAuthenticated == true)
        {
            await LoadAccessAsync(httpContext, currentAccess, currentUserLoader, integrationClients, idamOptions.Value);
        }

        Dictionary<string, object?> scope = new()
        {
            ["UserId"] = currentAccess.User?.PublicId,
            ["ActiveRole"] = currentAccess.User?.ActiveRole,
        };

        using (logger.BeginScope(scope))
        {
            await this.next(httpContext);
        }
    }

    private static async Task LoadAccessAsync(
        HttpContext httpContext,
        CurrentAccess currentAccess,
        ICurrentUserLoader currentUserLoader,
        IIntegrationClientDirectory integrationClients,
        IdamOptions idam)
    {
        TokenClaims claims = TokenClaims.From(httpContext.User);
        TokenKind? tokenKind = await claims.ClassifyAsync(
            idam.WebClientId,
            integrationClients,
            httpContext.RequestAborted);

        if (tokenKind is null)
        {
            return;
        }

        if (tokenKind != TokenKind.User
            || claims.Subject is null)
        {
            currentAccess.SetIntegrationNotPermitted(tokenKind.Value);

            return;
        }

        CurrentUserLoadResult result = await currentUserLoader.LoadAsync(claims.Subject, httpContext.RequestAborted);

        if (result.Status == AccessStatus.Active
            && result.User is not null)
        {
            currentAccess.SetActiveUser(claims.Subject, result.User);
        }
        else
        {
            currentAccess.SetRefusedUser(claims.Subject, result.Status);
        }
    }
}
