using System.Net;
using System.Security.Claims;
using DAHC.API.Configuration;
using DAHC.Identity.Service;
using DAHC.Service.Results;
using Duende.IdentityModel.Client;
using Microsoft.Extensions.Options;

namespace DAHC.API.Authentication.Idam;

/// <summary>
/// Calls the IDAM UserInfo endpoint. IDAM types and SDK failures stay in this folder: the response is mapped to
/// <see cref="IdentityProfile"/> and failures to results (401 for a refused token or a subject mismatch, 503 when
/// IDAM is unreachable).
/// </summary>
public sealed class IdamUserInfoClient : IUserInfoClient
{
    public const string HttpClientName = "IdamUserInfo";

    private readonly IHttpClientFactory httpClientFactory;

    private readonly DiscoveryCache discoveryCache;

    private readonly IdamUserInfoClaimOptions claims;

    public IdamUserInfoClient(IHttpClientFactory httpClientFactory, IOptions<IdamOptions> idamOptions)
    {
        ArgumentNullException.ThrowIfNull(idamOptions);

        IdamOptions idam = idamOptions.Value;

        this.httpClientFactory = httpClientFactory;
        this.claims = idam.UserInfoClaims;
        this.discoveryCache = new DiscoveryCache(
            idam.Authority,
            () => httpClientFactory.CreateClient(HttpClientName),
            IdamDiscoveryPolicy.Create(idam));
    }

    public async Task<Result<IdentityProfile>> GetProfileAsync(
        ClaimsPrincipal principal,
        string accessToken,
        string expectedSubject,
        CancellationToken cancellationToken)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(accessToken);
        ArgumentException.ThrowIfNullOrWhiteSpace(expectedSubject);

        DiscoveryDocumentResponse discovery = await this.discoveryCache.GetAsync();

        if (discovery.IsError
            || string.IsNullOrWhiteSpace(discovery.UserInfoEndpoint))
        {
            return Unavailable();
        }

        HttpClient httpClient = this.httpClientFactory.CreateClient(HttpClientName);
        UserInfoRequest request = new()
        {
            Address = discovery.UserInfoEndpoint,
            Token = accessToken,
        };

        UserInfoResponse response = await httpClient.GetUserInfoAsync(request, cancellationToken);

        if (response.IsError)
        {
            return IsIdamFailure(response) ? Unavailable() : TokenInvalid();
        }

        // UserInfo must describe the same user as the validated token.
        string? subject = response.TryGet(IdamClaimNames.Subject);

        if (!string.Equals(subject, expectedSubject, StringComparison.Ordinal))
        {
            return TokenInvalid();
        }

        IdentityProfile profile = new()
        {
            Subject = expectedSubject,
            DisplayName = response.TryGet(this.claims.Name) ?? expectedSubject,
            Email = response.TryGet(this.claims.Email),
            MobileNumber = response.TryGet(this.claims.PhoneNumber),
            EmiratesId = response.TryGet(this.claims.EmiratesId),
            PassportNumber = response.TryGet(this.claims.PassportNumber),
        };

        return Result.Success(profile);
    }

    private static bool IsIdamFailure(UserInfoResponse response)
    {
        return response.ErrorType == ResponseErrorType.Exception
            || response.HttpStatusCode >= HttpStatusCode.InternalServerError;
    }

    private static Result<IdentityProfile> Unavailable()
    {
        return Result.Failure<IdentityProfile>(ResultStatus.Unavailable, AuthenticationErrorCodes.IdamUnavailable);
    }

    private static Result<IdentityProfile> TokenInvalid()
    {
        return Result.Failure<IdentityProfile>(ResultStatus.Unauthenticated, AuthenticationErrorCodes.TokenInvalid);
    }
}
