using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using DAHC.Data;
using DAHC.Identity.Core;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace DAHC.Test.API;

public sealed class AuthenticationTests
{
    [Fact]
    public async Task SignInWithIdentityAndRolesInBody_IgnoresBodyAndProvisionsCandidateFromToken()
    {
        await using DahcApiFactory factory = new();
        HttpClient client = factory.CreateClientFor("token-subject");
        var assertedIdentity = new
        {
            idamUserId = "someone-else",
            roles = new[] { "ADMINISTRATOR" },
            userType = "STAFF",
        };

        HttpResponseMessage response = await client.PostAsJsonAsync(
            "/api/v1/auth/sign-in",
            assertedIdentity,
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        using JsonDocument envelope = JsonDocument.Parse(
            await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));
        JsonElement session = envelope.RootElement.GetProperty("data");
        Assert.Equal("CANDIDATE", session.GetProperty("userType").GetString());
        Assert.Equal("CANDIDATE", Assert.Single(session.GetProperty("roles").EnumerateArray()).GetString());
        Candidate candidate = await ReadSingleCandidateAsync(factory);
        Assert.Equal("token-subject", candidate.IdamUserId);
    }

    [Fact]
    public async Task IdamRoleClaimOnCandidateToken_DoesNotGrantStaffEndpoint()
    {
        await using DahcApiFactory factory = new();
        HttpClient client = factory.CreateClientFor("candidate-with-role-claim");
        await client.PostAsync("/api/v1/auth/sign-in", null, TestContext.Current.CancellationToken);

        HttpResponseMessage response = await client.PutAsJsonAsync(
            "/api/v1/auth/active-role",
            new { roleCode = "ADMINISTRATOR" },
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task IdentityThatNeverSignedIn_Returns403NotRegistered()
    {
        await using DahcApiFactory factory = new();
        HttpClient client = factory.CreateClientFor("never-signed-in");

        HttpResponseMessage response = await client.GetAsync("/api/v1/auth/me", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        using JsonDocument problem = JsonDocument.Parse(
            await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));
        Assert.Equal("account.not_registered", problem.RootElement.GetProperty("code").GetString());
    }

    [Fact]
    public async Task ProductionStartupWithTestAuthenticationHandler_IsRefused()
    {
        await using DahcApiFactory factory = new("Production");

        InvalidOperationException exception = Assert.Throws<InvalidOperationException>(() => factory.CreateClient());

        Assert.Contains("authentication handler", exception.Message, StringComparison.Ordinal);
    }

    private static async Task<Candidate> ReadSingleCandidateAsync(DahcApiFactory factory)
    {
        using IServiceScope scope = factory.Services.CreateScope();
        DahcDbContext context = scope.ServiceProvider.GetRequiredService<DahcDbContext>();

        return await context.Candidates.SingleAsync(TestContext.Current.CancellationToken);
    }
}
