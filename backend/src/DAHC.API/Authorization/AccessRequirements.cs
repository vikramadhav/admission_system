using Microsoft.AspNetCore.Authorization;

namespace DAHC.API.Authorization;

/// <summary>
/// A valid token for an active local user whose active role is one of <see cref="ActiveRoles"/>; any role when
/// the list is empty. Authorization uses the active role only, never the union of held roles (standard s.15).
/// </summary>
public sealed record ActiveUserRequirement(IReadOnlyList<string> ActiveRoles) : IAuthorizationRequirement;

/// <summary>
/// A valid user token, whether or not a local user exists yet: only sign-in, which provisions or matches it.
/// </summary>
public sealed record UserTokenRequirement : IAuthorizationRequirement;
