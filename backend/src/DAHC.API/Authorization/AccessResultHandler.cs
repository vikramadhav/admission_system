using DAHC.API.Authentication;
using DAHC.API.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Policy;
using Microsoft.Net.Http.Headers;

namespace DAHC.API.Authorization;

/// <summary>
/// Writes refusals as ProblemDetails, never as redirects: 401 with <c>WWW-Authenticate: Bearer</c> for a missing,
/// invalid or expired token, 503 when IDAM could not be reached, and 403 with the refusal code otherwise.
/// </summary>
public sealed class AccessResultHandler : IAuthorizationMiddlewareResultHandler
{
    private readonly AuthorizationMiddlewareResultHandler defaultHandler = new();

    private readonly ProblemFactory problemFactory;

    private readonly ILogger<AccessResultHandler> logger;

    public AccessResultHandler(ProblemFactory problemFactory, ILogger<AccessResultHandler> logger)
    {
        this.problemFactory = problemFactory;
        this.logger = logger;
    }

    public async Task HandleAsync(
        RequestDelegate next,
        HttpContext context,
        AuthorizationPolicy policy,
        PolicyAuthorizationResult authorizeResult)
    {
        ArgumentNullException.ThrowIfNull(context);
        ArgumentNullException.ThrowIfNull(authorizeResult);

        if (authorizeResult.Succeeded)
        {
            await this.defaultHandler.HandleAsync(next, context, policy, authorizeResult);

            return;
        }

        if (authorizeResult.Challenged)
        {
            await this.WriteChallengeAsync(context);

            return;
        }

        string code = authorizeResult.AuthorizationFailure?.FailureReasons
            .Select(reason => reason.Message)
            .FirstOrDefault() ?? AuthenticationErrorCodes.Forbidden;

        this.logger.LogWarning("Request refused with {ReasonCode}.", code);

        await this.problemFactory.WriteAsync(context, StatusCodes.Status403Forbidden, code);
    }

    private async Task WriteChallengeAsync(HttpContext context)
    {
        if (IdamAvailability.IsUnavailable(context))
        {
            this.logger.LogWarning("Request refused with {ReasonCode}.", AuthenticationErrorCodes.IdamUnavailable);

            await this.problemFactory.WriteAsync(
                context,
                StatusCodes.Status503ServiceUnavailable,
                AuthenticationErrorCodes.IdamUnavailable);

            return;
        }

        context.Response.Headers[HeaderNames.WWWAuthenticate] = "Bearer";

        await this.problemFactory.WriteAsync(
            context,
            StatusCodes.Status401Unauthorized,
            AuthenticationErrorCodes.TokenInvalid);
    }
}
