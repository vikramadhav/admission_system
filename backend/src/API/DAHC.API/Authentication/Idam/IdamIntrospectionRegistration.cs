using DAHC.API.Configuration;
using Duende.AspNetCore.Authentication.OAuth2Introspection;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace DAHC.API.Authentication.Idam;

/// <summary>
/// The approved introspection handler, authenticating to IDAM as the API's own confidential client. Results are
/// cached by the handler, keyed by a hash of the token, for at most the configured maximum.
/// </summary>
public static class IdamIntrospectionRegistration
{
    private static readonly TimeSpan backchannelTimeout = TimeSpan.FromSeconds(10);

    public static AuthenticationBuilder AddIdamIntrospection(this AuthenticationBuilder authentication)
    {
        ArgumentNullException.ThrowIfNull(authentication);

        IServiceCollection services = authentication.Services;

        services.AddHttpContextAccessor();
        services.AddTransient<IdamBackchannelHandler>();
        services.AddHttpClient(
                OAuth2IntrospectionDefaults.BackChannelHttpClientName,
                client => client.Timeout = backchannelTimeout)
            .AddHttpMessageHandler<IdamBackchannelHandler>();
        services.AddHttpClient(
                IdamUserInfoClient.HttpClientName,
                client => client.Timeout = backchannelTimeout)
            .AddHttpMessageHandler<IdamBackchannelHandler>();
        services.AddSingleton<IdamUserInfoClient>();

        authentication.AddOAuth2Introspection(AuthenticationSchemes.Idam);

        services.AddOptions<OAuth2IntrospectionOptions>(AuthenticationSchemes.Idam)
            .Configure<IOptions<IdamOptions>>((options, idamOptions) =>
            {
                IdamOptions idam = idamOptions.Value;

                options.Authority = idam.Authority;
                options.DiscoveryPolicy = IdamDiscoveryPolicy.Create(idam);
                options.ClientId = idam.ApiClientId;
                options.ClientSecret = idam.ApiClientSecret;
                options.CacheDuration = TimeSpan.FromSeconds(idam.IntrospectionCacheMaxSeconds);
                options.Events = new OAuth2IntrospectionEvents
                {
                    OnTokenValidated = async context =>
                    {
                        string? rejection = await TokenValidation.FindRejectionAsync(
                            context.Principal,
                            context.HttpContext,
                            checkIssuerAndExpiry: true);

                        if (rejection is not null)
                        {
                            context.Fail(rejection);
                        }
                    },
                };
            });

        return authentication;
    }
}
