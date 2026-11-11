using System.Security.Cryptography;
using System.Text;
using DAHC.API.Configuration;
using DAHC.API.Http;
using DAHC.API.Responses;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace DAHC.API.Authentication.Development;

/// <summary>
/// The Development-only local sign-in (standard s.15): its endpoint, its JWT scheme and the selector between
/// development tokens and IDAM tokens. Startup outside Development fails if it is enabled or configured.
/// </summary>
public static class DevelopmentSignIn
{
    public const string Route = "/api/v1/development/sign-in";

    private const string InvalidCredentialsCode = "auth.development_credentials_invalid";

    /// <summary>
    /// Refuses a development sign-in outside Development, and an incomplete one inside it. Returns whether the
    /// development sign-in is in use.
    /// </summary>
    public static bool EnsureAllowed(IHostEnvironment environment, IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(environment);
        ArgumentNullException.ThrowIfNull(configuration);

        DevelopmentSignInOptions options = configuration
            .GetSection(DevelopmentSignInOptions.SectionName)
            .Get<DevelopmentSignInOptions>() ?? new DevelopmentSignInOptions();

        bool isConfigured = options.Enabled
            || !string.IsNullOrEmpty(options.SigningKey)
            || !string.IsNullOrEmpty(options.Password);

        if (!environment.IsDevelopment())
        {
            if (isConfigured)
            {
                throw new InvalidOperationException(
                    "The development sign-in and its issuer must be disabled and unconfigured outside Development.");
            }

            return false;
        }

        bool isComplete = options.SigningKey is not null
            && options.SigningKey.Length >= DevelopmentSignInOptions.MinSigningKeyLength
            && !string.IsNullOrEmpty(options.Password);

        if (options.Enabled
            && !isComplete)
        {
            throw new InvalidOperationException(
                "DevelopmentSignIn:SigningKey (at least 32 characters) and DevelopmentSignIn:Password are required "
                + "in user secrets when the development sign-in is enabled.");
        }

        return options.Enabled;
    }

    public static AuthenticationBuilder AddDevelopmentSignIn(this AuthenticationBuilder authentication)
    {
        ArgumentNullException.ThrowIfNull(authentication);

        authentication.Services.AddSingleton<DevelopmentTokenIssuer>();
        authentication.Services.AddSingleton<IUserInfoClient, DevelopmentUserInfoClient>();

        authentication.AddJwtBearer(AuthenticationSchemes.DevelopmentJwt);
        authentication.Services.AddOptions<JwtBearerOptions>(AuthenticationSchemes.DevelopmentJwt)
            .Configure<IOptions<DevelopmentSignInOptions>>((options, developmentOptions) =>
            {
                DevelopmentSignInOptions development = developmentOptions.Value;

                options.MapInboundClaims = false;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidIssuer = development.Issuer,
                    ValidAudience = development.Audience,
                    IssuerSigningKey = DevelopmentTokenIssuer.CreateSigningKey(development),
                    AuthenticationType = AuthenticationSchemes.DevelopmentJwt,
                    ClockSkew = TimeSpan.FromSeconds(30),
                };
                options.Events = new JwtBearerEvents
                {
                    OnTokenValidated = async context =>
                    {
                        string? rejection = await TokenValidation.FindRejectionAsync(
                            context.Principal,
                            context.HttpContext,
                            checkIssuerAndExpiry: false);

                        if (rejection is not null)
                        {
                            context.Fail(rejection);
                        }
                    },
                };
            });

        // IDAM access tokens are opaque; only development tokens are JWTs.
        authentication.AddPolicyScheme(
            AuthenticationSchemes.DevelopmentSelector,
            AuthenticationSchemes.DevelopmentSelector,
            options => options.ForwardDefaultSelector = httpContext =>
                BearerToken.Read(httpContext.Request)?.Contains('.', StringComparison.Ordinal) == true
                    ? AuthenticationSchemes.DevelopmentJwt
                    : AuthenticationSchemes.Idam);

        return authentication;
    }

    public static void MapDevelopmentSignIn(this WebApplication app)
    {
        ArgumentNullException.ThrowIfNull(app);

        app.MapPost(Route, SignIn)
            .AllowAnonymous()
            .RequireRateLimiting(RateLimiting.AuthenticationPolicy);
    }

    private static IResult SignIn(
        DevelopmentSignInRequest request,
        DevelopmentTokenIssuer issuer,
        IOptions<DevelopmentSignInOptions> options,
        ProblemFactory problemFactory,
        HttpContext httpContext)
    {
        bool hasIdentity = !string.IsNullOrWhiteSpace(request.Subject) || !string.IsNullOrWhiteSpace(request.ClientId);

        if (!hasIdentity
            || !IsPasswordValid(request.Password, options.Value.Password))
        {
            return Results.Json(
                problemFactory.Create(httpContext, StatusCodes.Status401Unauthorized, InvalidCredentialsCode, []),
                statusCode: StatusCodes.Status401Unauthorized,
                contentType: ProblemFactory.ContentType);
        }

        DevelopmentToken token = issuer.Issue(request);

        return Results.Ok(new ApiResponse<DevelopmentToken> { Data = token });
    }

    private static bool IsPasswordValid(string supplied, string? expected)
    {
        if (string.IsNullOrEmpty(expected))
        {
            return false;
        }

        byte[] suppliedBytes = SHA256.HashData(Encoding.UTF8.GetBytes(supplied));
        byte[] expectedBytes = SHA256.HashData(Encoding.UTF8.GetBytes(expected));

        return CryptographicOperations.FixedTimeEquals(suppliedBytes, expectedBytes);
    }
}
