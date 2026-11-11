using DAHC.API.Authentication;
using DAHC.Identity.Service;
using DAHC.Service.Access;
using Microsoft.AspNetCore.Authorization;

namespace DAHC.API.Authorization;

/// <summary>
/// Decides the access requirements from the request's <see cref="CurrentAccess"/>, which holds only the local
/// user and roles from the DAHC database. Token claims (including any IDAM <c>role</c> claim) are never read here.
/// </summary>
public sealed class AccessAuthorizationHandler : IAuthorizationHandler
{
    private readonly CurrentAccess currentAccess;

    public AccessAuthorizationHandler(CurrentAccess currentAccess)
    {
        this.currentAccess = currentAccess;
    }

    public Task HandleAsync(AuthorizationHandlerContext context)
    {
        ArgumentNullException.ThrowIfNull(context);

        if (context.User.Identity?.IsAuthenticated != true)
        {
            return Task.CompletedTask;
        }

        foreach (IAuthorizationRequirement requirement in context.PendingRequirements.ToList())
        {
            if (requirement is UserTokenRequirement)
            {
                this.Decide(context, requirement, this.FindUserTokenRefusal());
            }
            else if (requirement is ActiveUserRequirement activeUser)
            {
                this.Decide(context, requirement, this.FindActiveUserRefusal(activeUser));
            }
        }

        return Task.CompletedTask;
    }

    private void Decide(AuthorizationHandlerContext context, IAuthorizationRequirement requirement, string? refusal)
    {
        if (refusal is null)
        {
            context.Succeed(requirement);
        }
        else
        {
            context.Fail(new AuthorizationFailureReason(this, refusal));
        }
    }

    private string? FindUserTokenRefusal()
    {
        if (this.currentAccess.Status == AccessStatus.IntegrationNotPermitted)
        {
            // Delegated and integration-only tokens never provision users.
            return AuthenticationErrorCodes.IntegrationNotPermitted;
        }

        return this.currentAccess.IdamUserId is null ? AuthenticationErrorCodes.Forbidden : null;
    }

    private string? FindActiveUserRefusal(ActiveUserRequirement requirement)
    {
        string? statusRefusal = this.currentAccess.Status switch
        {
            AccessStatus.Active => null,
            AccessStatus.NotRegistered => IdentityErrorCodes.NotRegistered,
            AccessStatus.Deactivated => IdentityErrorCodes.Deactivated,
            AccessStatus.NoRole => IdentityErrorCodes.NoRole,
            AccessStatus.IntegrationNotPermitted => AuthenticationErrorCodes.IntegrationNotPermitted,
            _ => AuthenticationErrorCodes.Forbidden,
        };

        if (statusRefusal is not null)
        {
            return statusRefusal;
        }

        CurrentUser? user = this.currentAccess.User;

        if (user is null)
        {
            return AuthenticationErrorCodes.Forbidden;
        }

        bool isRoleAllowed = requirement.ActiveRoles.Count == 0
            || requirement.ActiveRoles.Contains(user.ActiveRole, StringComparer.Ordinal);

        return isRoleAllowed ? null : AuthenticationErrorCodes.Forbidden;
    }
}
