using System.Security.Claims;
using DAHC.API.Authentication.Idam;
using DAHC.Identity.Service;
using DAHC.Service.Results;

namespace DAHC.API.Authentication.Development;

/// <summary>
/// Development only: a development token carries the synthetic profile itself, because there is no IDAM
/// UserInfo for it. Every other token goes to IDAM UserInfo.
/// </summary>
public sealed class DevelopmentUserInfoClient : IUserInfoClient
{
    private readonly IdamUserInfoClient idamUserInfoClient;

    public DevelopmentUserInfoClient(IdamUserInfoClient idamUserInfoClient)
    {
        this.idamUserInfoClient = idamUserInfoClient;
    }

    public Task<Result<IdentityProfile>> GetProfileAsync(
        ClaimsPrincipal principal,
        string accessToken,
        string expectedSubject,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(principal);

        bool isDevelopmentToken = principal.Identity?.AuthenticationType == AuthenticationSchemes.DevelopmentJwt;

        if (!isDevelopmentToken)
        {
            return this.idamUserInfoClient.GetProfileAsync(principal, accessToken, expectedSubject, cancellationToken);
        }

        IdentityProfile profile = new()
        {
            Subject = expectedSubject,
            DisplayName = principal.FindFirst(IdamClaimNames.Name)?.Value ?? expectedSubject,
            Email = principal.FindFirst(IdamClaimNames.Email)?.Value,
            MobileNumber = principal.FindFirst(IdamClaimNames.PhoneNumber)?.Value,
            EmiratesId = principal.FindFirst(IdamClaimNames.EmiratesId)?.Value,
            PassportNumber = principal.FindFirst(IdamClaimNames.PassportNumber)?.Value,
        };

        return Task.FromResult(Result.Success(profile));
    }
}
