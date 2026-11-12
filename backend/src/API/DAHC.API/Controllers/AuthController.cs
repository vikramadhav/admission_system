using DAHC.API.Authentication;
using DAHC.API.Authorization;
using DAHC.API.Contracts;
using DAHC.API.Http;
using DAHC.API.Responses;
using DAHC.Identity.Service;
using DAHC.Service.Access;
using DAHC.Service.Results;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace DAHC.API.Controllers;

/// <summary>
/// Sign-in, the current session and the active-role switch (US-1.1.1, US-1.1.2, standard s.15). Identity,
/// profile and role data are never read from the request: only from the validated token and IDAM UserInfo.
/// </summary>
[ApiController]
[Route("api/v1/auth")]
[EnableRateLimiting(RateLimiting.AuthenticationPolicy)]
public sealed class AuthController : ControllerBase
{
    private readonly IAuthSessionService authSessionService;

    private readonly IUserInfoClient userInfoClient;

    private readonly CurrentAccess currentAccess;

    private readonly ApiResults apiResults;

    public AuthController(
        IAuthSessionService authSessionService,
        IUserInfoClient userInfoClient,
        CurrentAccess currentAccess,
        ApiResults apiResults)
    {
        this.authSessionService = authSessionService;
        this.userInfoClient = userInfoClient;
        this.currentAccess = currentAccess;
        this.apiResults = apiResults;
    }

    /// <summary>
    /// <c>signIn</c>: provisions a Candidate for an unknown identity, or matches a pre-registered staff user, and
    /// refreshes the profile from IDAM UserInfo. Any request body is ignored.
    /// </summary>
    [HttpPost("sign-in")]
    [Authorize(Policy = Policies.SignIn)]
    public async Task<IActionResult> SignInAsync(CancellationToken cancellationToken)
    {
        IdamIdentity? identity = this.currentAccess.Identity;
        string? accessToken = BearerToken.Read(this.Request);

        if (identity is null
            || accessToken is null)
        {
            Result<AuthSession> refused = Result.Failure<AuthSession>(
                ResultStatus.Unauthenticated,
                AuthenticationErrorCodes.TokenInvalid);

            return this.apiResults.Ok(this.HttpContext, refused);
        }

        Result<IdentityProfile> profile = await this.userInfoClient.GetProfileAsync(
            this.User,
            accessToken,
            identity.Subject,
            cancellationToken);

        if (!profile.IsSuccess)
        {
            return this.apiResults.Ok(this.HttpContext, profile.ToFailure<AuthSession>());
        }

        Result<AuthSession> session = await this.authSessionService.SignInAsync(
            identity,
            profile.Value,
            cancellationToken);

        return this.apiResults.Ok(this.HttpContext, session);
    }

    /// <summary>
    /// <c>getCurrentSession</c>: the same session as sign-in, without provisioning or profile refresh.
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    public IActionResult GetCurrentSession()
    {
        CurrentUser user = this.RequireCurrentUser();

        return this.apiResults.Ok(this.HttpContext, Result.Success(AuthSession.FromCurrentUser(user)));
    }

    /// <summary>
    /// <c>switchActiveRole</c>: staff only; the role must be one the user holds.
    /// </summary>
    [HttpPut("active-role")]
    [Authorize(Policy = Policies.Staff)]
    public async Task<IActionResult> SwitchActiveRoleAsync(
        [FromBody] SwitchActiveRoleRequest request,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        CurrentUser user = this.RequireCurrentUser();

        // RoleCode is required by model validation before the action runs.
        Result<AuthSession> session = await this.authSessionService.SwitchActiveRoleAsync(
            user,
            request.RoleCode!,
            cancellationToken);

        return this.apiResults.Ok(this.HttpContext, session);
    }

    private CurrentUser RequireCurrentUser()
    {
        return this.currentAccess.User
            ?? throw new InvalidOperationException("The authorization policy admitted a request without an active user.");
    }
}
