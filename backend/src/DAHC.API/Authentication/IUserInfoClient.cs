using System.Security.Claims;
using DAHC.Identity.Service;
using DAHC.Service.Results;

namespace DAHC.API.Authentication;

/// <summary>
/// Reads the caller's profile from IDAM UserInfo, called by the API itself with the caller's access token.
/// Identity and profile data are never taken from the request.
/// </summary>
public interface IUserInfoClient
{
    Task<Result<IdentityProfile>> GetProfileAsync(
        ClaimsPrincipal principal,
        string accessToken,
        string expectedSubject,
        CancellationToken cancellationToken);
}
