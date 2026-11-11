using DAHC.API.Authentication.Development;
using DAHC.API.Authentication.Idam;
using Duende.AspNetCore.Authentication.OAuth2Introspection;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace DAHC.API.Authentication;

/// <summary>
/// Bearer-token authentication only: no sessions, no cookies, no sign-in flow (standard s.15).
/// </summary>
public static class AuthenticationRegistration
{
    /// <summary>
    /// The environment in which <c>DAHC.Test.API</c> runs. Only there may another authentication handler (the test
    /// handler that replaces IDAM) be registered.
    /// </summary>
    public const string TestingEnvironment = "Testing";

    public static WebApplicationBuilder AddDahcAuthentication(this WebApplicationBuilder builder)
    {
        ArgumentNullException.ThrowIfNull(builder);

        bool useDevelopmentSignIn = DevelopmentSignIn.EnsureAllowed(builder.Environment, builder.Configuration);
        string defaultScheme = useDevelopmentSignIn
            ? AuthenticationSchemes.DevelopmentSelector
            : AuthenticationSchemes.Idam;

        AuthenticationBuilder authentication = builder.Services.AddAuthentication(defaultScheme);

        authentication.AddIdamIntrospection();

        if (useDevelopmentSignIn)
        {
            authentication.AddDevelopmentSignIn();
        }
        else
        {
            builder.Services.AddSingleton<IUserInfoClient>(
                provider => provider.GetRequiredService<IdamUserInfoClient>());
        }

        return builder;
    }

    /// <summary>
    /// Refuses to start when an authentication handler other than the approved ones is registered. The test
    /// handler of <c>DAHC.Test.API</c> is accepted only in the Testing environment.
    /// </summary>
    public static async Task EnsureApprovedHandlersAsync(this WebApplication app)
    {
        ArgumentNullException.ThrowIfNull(app);

        if (app.Environment.IsEnvironment(TestingEnvironment))
        {
            return;
        }

        List<Type> approvedHandlers = [typeof(OAuth2IntrospectionHandler)];

        if (app.Environment.IsDevelopment())
        {
            approvedHandlers.Add(typeof(JwtBearerHandler));
            approvedHandlers.Add(typeof(PolicySchemeHandler));
        }

        IAuthenticationSchemeProvider schemeProvider = app.Services.GetRequiredService<IAuthenticationSchemeProvider>();
        IEnumerable<AuthenticationScheme> schemes = await schemeProvider.GetAllSchemesAsync();
        bool hasUnapprovedHandler = schemes.Any(scheme => !approvedHandlers.Contains(scheme.HandlerType));

        if (hasUnapprovedHandler)
        {
            throw new InvalidOperationException("An authentication handler other than IDAM introspection is registered.");
        }
    }
}
