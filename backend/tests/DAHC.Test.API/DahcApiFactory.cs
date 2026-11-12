using System.Net.Http.Headers;
using System.Security.Claims;
using DAHC.API.Authentication;
using DAHC.Data;
using DAHC.Identity.Service;
using DAHC.Service.Results;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using NSubstitute;

namespace DAHC.Test.API;

/// <summary>
/// The real API in the Testing environment, with the in-memory database, the test authentication handler in
/// place of IDAM, a substitute for IDAM UserInfo and for the SQL Server candidate-number sequence. With
/// <see cref="ForDevelopmentSignIn"/> it instead runs in Development with the real development sign-in and its
/// tokens, and no IDAM at all.
/// </summary>
internal sealed class DahcApiFactory : WebApplicationFactory<Program>
{
    /// <summary>
    /// Development only, for these tests; never a real secret.
    /// </summary>
    private const string DevelopmentSigningKey = "test-only-development-signing-key-0123456789";

    private readonly string databaseName = Guid.NewGuid().ToString("N");

    private readonly string environmentName;

    private readonly Dictionary<string, string?> settings;

    public DahcApiFactory(string environmentName = AuthenticationRegistration.TestingEnvironment)
        : this(environmentName, [])
    {
    }

    private DahcApiFactory(string environmentName, Dictionary<string, string?> settings)
    {
        this.environmentName = environmentName;
        this.settings = settings;
    }

    private bool UsesDevelopmentSignIn => this.settings.ContainsKey("DevelopmentSignIn:Enabled");

    /// <summary>
    /// The API in <paramref name="environmentName"/> with the development sign-in enabled and configured, as a
    /// developer would in user secrets. Outside Development, startup must refuse it.
    /// </summary>
    public static DahcApiFactory ForDevelopmentSignIn(
        string environmentName = "Development",
        string? developmentIssuer = null)
    {
        Dictionary<string, string?> settings = new()
        {
            ["DevelopmentSignIn:Enabled"] = "true",
            ["DevelopmentSignIn:SigningKey"] = DevelopmentSigningKey,
            ["DevelopmentSignIn:Password"] = "test-only-password",
        };

        if (developmentIssuer is not null)
        {
            settings["DevelopmentSignIn:Issuer"] = developmentIssuer;
        }

        return new DahcApiFactory(environmentName, settings);
    }

    public HttpClient CreateClientFor(string? subject)
    {
        HttpClient client = this.CreateClient();

        if (subject is not null)
        {
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", "test:" + subject);
        }

        return client;
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        ArgumentNullException.ThrowIfNull(builder);

        builder.UseEnvironment(this.environmentName);
        builder.UseSetting("ConnectionStrings:Dahc", "Server=unused;Database=unused");
        builder.UseSetting("DahcLogging:ElasticsearchEndpoint", "http://127.0.0.1:9");
        builder.UseSetting("Idam:Authority", "https://idam.test/");
        builder.UseSetting("Idam:MetadataAddress", "https://idam.test/mga/sps/oauth/oauth20/metadata/DahcTest");
        builder.UseSetting("Idam:Issuer", TestAuthenticationHandler.Issuer);
        builder.UseSetting("Idam:ApiClientId", "dahc-api-test");
        builder.UseSetting("Idam:ApiClientSecret", "not-a-real-secret");
        builder.UseSetting("Idam:WebClientId", TestAuthenticationHandler.WebClientId);

        foreach (KeyValuePair<string, string?> setting in this.settings)
        {
            builder.UseSetting(setting.Key, setting.Value);
        }

        builder.ConfigureTestServices(services =>
        {
            services.RemoveAll<DbContextOptions<DahcDbContext>>();
            services.RemoveAll<IDbContextOptionsConfiguration<DahcDbContext>>();
            services.AddDbContext<DahcDbContext>((provider, options) =>
            {
                options.UseInMemoryDatabase(this.databaseName);
                DahcDataRegistration.AddInterceptors(provider, options);
            });

            services.RemoveAll<ICandidateNumberAllocator>();
            services.AddScoped(_ => CreateCandidateNumberAllocator());

            // The development sign-in is exercised as it is: its own token scheme and its UserInfo stand-in.
            if (this.UsesDevelopmentSignIn)
            {
                return;
            }

            services.RemoveAll<IUserInfoClient>();
            services.AddSingleton(CreateUserInfoClient());

            services.AddAuthentication()
                .AddScheme<AuthenticationSchemeOptions, TestAuthenticationHandler>(
                    TestAuthenticationHandler.SchemeName,
                    null);
            services.PostConfigure<AuthenticationOptions>(options =>
            {
                options.DefaultScheme = TestAuthenticationHandler.SchemeName;
                options.DefaultAuthenticateScheme = TestAuthenticationHandler.SchemeName;
                options.DefaultChallengeScheme = TestAuthenticationHandler.SchemeName;
            });
        });
    }

    private static ICandidateNumberAllocator CreateCandidateNumberAllocator()
    {
        ICandidateNumberAllocator allocator = Substitute.For<ICandidateNumberAllocator>();
        allocator.AllocateAsync(Arg.Any<CancellationToken>()).Returns("000000001");

        return allocator;
    }

    /// <summary>
    /// IDAM UserInfo for the token's own subject; never anything from the request.
    /// </summary>
    private static IUserInfoClient CreateUserInfoClient()
    {
        IUserInfoClient userInfoClient = Substitute.For<IUserInfoClient>();
        userInfoClient
            .GetProfileAsync(
                Arg.Any<ClaimsPrincipal>(),
                Arg.Any<string>(),
                Arg.Any<string>(),
                Arg.Any<CancellationToken>())
            .Returns(call => Result.Success(new IdentityProfile
            {
                Subject = call.ArgAt<string>(2),
                DisplayName = "Test Candidate",
            }));

        return userInfoClient;
    }
}
