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
/// place of IDAM, a substitute for IDAM UserInfo and for the SQL Server candidate-number sequence.
/// </summary>
internal sealed class DahcApiFactory : WebApplicationFactory<Program>
{
    private readonly string databaseName = Guid.NewGuid().ToString("N");

    private readonly string environmentName;

    public DahcApiFactory(string environmentName = AuthenticationRegistration.TestingEnvironment)
    {
        this.environmentName = environmentName;
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
