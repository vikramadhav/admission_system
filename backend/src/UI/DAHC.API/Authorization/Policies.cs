using DAHC.Service.Access;
using Microsoft.AspNetCore.Authorization;

namespace DAHC.API.Authorization;

/// <summary>
/// Authorization policies, one per role set in the contract's <c>x-dahc-roles</c>. The fallback and default
/// policies require a valid token and an active local user; only health checks are anonymous.
/// </summary>
public static class Policies
{
    /// <summary>
    /// <c>VALID_TOKEN</c>: sign-in only.
    /// </summary>
    public const string SignIn = "SignIn";

    /// <summary>
    /// <c>CANDIDATE</c>.
    /// </summary>
    public const string Candidate = "Candidate";

    /// <summary>
    /// Any staff role (the role switcher).
    /// </summary>
    public const string Staff = "Staff";

    public static IServiceCollection AddDahcAuthorization(this IServiceCollection services)
    {
        ArgumentNullException.ThrowIfNull(services);

        AuthorizationPolicy activeUser = new AuthorizationPolicyBuilder()
            .RequireAuthenticatedUser()
            .AddRequirements(new ActiveUserRequirement([]))
            .Build();

        services.AddAuthorizationBuilder()
            .SetFallbackPolicy(activeUser)
            .SetDefaultPolicy(activeUser)
            .AddPolicy(
                SignIn,
                policy => policy.RequireAuthenticatedUser().AddRequirements(new UserTokenRequirement()))
            .AddPolicy(
                Candidate,
                policy => policy.RequireAuthenticatedUser().AddRequirements(
                    new ActiveUserRequirement([RoleCodes.Candidate])))
            .AddPolicy(
                Staff,
                policy => policy.RequireAuthenticatedUser().AddRequirements(
                    new ActiveUserRequirement(RoleCodes.StaffRoles)));

        services.AddScoped<IAuthorizationHandler, AccessAuthorizationHandler>();
        services.AddSingleton<IAuthorizationMiddlewareResultHandler, AccessResultHandler>();

        return services;
    }
}
