using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using DAHC.API.Authentication.Development;
using DAHC.API.Configuration;
using DAHC.Data;
using DAHC.Identity.Core;
using DAHC.Service.Access;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace DAHC.Test.API;

/// <summary>
/// The Development-only sign-in issues tokens with its own issuer. They resolve local users through the same
/// issuer + subject path as IDAM tokens (AP-04), never reach an IDAM identity, and are refused outside Development.
/// </summary>
public sealed class DevelopmentSignInTests
{
    [Fact]
    [Trait("Requirement", "US-1.1.1")]
    [Trait("Decision", "AP-04")]
    public async Task DevelopmentToken_ProvisionsCandidateUnderDevelopmentIssuer()
    {
        await using DahcApiFactory factory = DahcApiFactory.ForDevelopmentSignIn();
        HttpClient client = await CreateSignedInClientAsync(factory, "dev.candidate");

        HttpResponseMessage response = await client.PostAsync(
            "/api/v1/auth/sign-in",
            null,
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        using JsonDocument envelope = JsonDocument.Parse(
            await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));
        Assert.Equal("CANDIDATE", envelope.RootElement.GetProperty("data").GetProperty("userType").GetString());

        using IServiceScope scope = factory.Services.CreateScope();
        DahcDbContext context = scope.ServiceProvider.GetRequiredService<DahcDbContext>();
        Candidate candidate = await context.Candidates.SingleAsync(TestContext.Current.CancellationToken);
        string developmentIssuer = factory.Services.GetRequiredService<IOptions<DevelopmentSignInOptions>>().Value.Issuer;
        Assert.Equal(developmentIssuer, candidate.IdamIssuer);
        Assert.Equal("dev.candidate", candidate.IdamUserId);
    }

    [Fact]
    [Trait("Decision", "AP-04")]
    public async Task DevelopmentTokenWithSubjectOfIdamStaffUser_IsNotThatStaffUser()
    {
        await using DahcApiFactory factory = DahcApiFactory.ForDevelopmentSignIn();
        string idamIssuer = factory.Services.GetRequiredService<IOptions<IdamOptions>>().Value.Issuer;
        await AddStaffUserAsync(factory, idamIssuer, "real.administrator", RoleCodes.Administrator);
        HttpClient client = await CreateSignedInClientAsync(factory, "real.administrator");

        HttpResponseMessage response = await client.GetAsync("/api/v1/auth/me", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        using JsonDocument problem = JsonDocument.Parse(
            await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));
        Assert.Equal("account.not_registered", problem.RootElement.GetProperty("code").GetString());
    }

    [Fact]
    [Trait("Decision", "AP-04")]
    public async Task DevelopmentTokenOfStaffUserUnderDevelopmentIssuer_GetsTheirLocalRoles()
    {
        await using DahcApiFactory factory = DahcApiFactory.ForDevelopmentSignIn();
        string developmentIssuer = factory.Services.GetRequiredService<IOptions<DevelopmentSignInOptions>>().Value.Issuer;
        await AddStaffUserAsync(factory, developmentIssuer, "dev.officer", RoleCodes.AdmissionOfficer);
        HttpClient client = await CreateSignedInClientAsync(factory, "dev.officer");

        HttpResponseMessage response = await client.GetAsync("/api/v1/auth/me", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        using JsonDocument envelope = JsonDocument.Parse(
            await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));
        JsonElement session = envelope.RootElement.GetProperty("data");
        Assert.Equal("STAFF", session.GetProperty("userType").GetString());
        Assert.Equal(
            RoleCodes.AdmissionOfficer,
            Assert.Single(session.GetProperty("roles").EnumerateArray()).GetString());
    }

    [Theory]
    [InlineData("Staging")]
    [InlineData("Production")]
    public async Task StartupWithDevelopmentSignInOutsideDevelopment_IsRefused(string environmentName)
    {
        await using DahcApiFactory factory = DahcApiFactory.ForDevelopmentSignIn(environmentName);

        InvalidOperationException exception = Assert.Throws<InvalidOperationException>(() => factory.CreateClient());

        Assert.Contains("outside Development", exception.Message, StringComparison.Ordinal);
    }

    [Fact]
    [Trait("Decision", "AP-04")]
    public async Task StartupWithDevelopmentIssuerEqualToIdamIssuer_IsRefused()
    {
        await using DahcApiFactory factory = DahcApiFactory.ForDevelopmentSignIn(
            developmentIssuer: TestAuthenticationHandler.Issuer);

        InvalidOperationException exception = Assert.Throws<InvalidOperationException>(() => factory.CreateClient());

        Assert.Contains("must differ from Idam:Issuer", exception.Message, StringComparison.Ordinal);
    }

    private static async Task<HttpClient> CreateSignedInClientAsync(DahcApiFactory factory, string subject)
    {
        HttpClient client = factory.CreateClient();
        string password = factory.Services.GetRequiredService<IOptions<DevelopmentSignInOptions>>().Value.Password!;

        HttpResponseMessage response = await client.PostAsJsonAsync(
            DevelopmentSignIn.Route,
            new { subject, password, displayName = "Development Person" },
            TestContext.Current.CancellationToken);

        response.EnsureSuccessStatusCode();
        using JsonDocument envelope = JsonDocument.Parse(
            await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));
        string accessToken = envelope.RootElement.GetProperty("data").GetProperty("accessToken").GetString()!;
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        return client;
    }

    private static async Task AddStaffUserAsync(DahcApiFactory factory, string issuer, string subject, string roleCode)
    {
        using IServiceScope scope = factory.Services.CreateScope();
        DahcDbContext context = scope.ServiceProvider.GetRequiredService<DahcDbContext>();
        StaffUser staffUser = new()
        {
            PublicId = Guid.NewGuid(),
            IdamIssuer = issuer,
            IdamUserId = subject,
            DisplayName = "Pre-registered Staff",
            Email = subject + "@example.test",
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow.AddDays(-1),
        };

        context.StaffUsers.Add(staffUser);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        context.StaffRoleAssignments.Add(new StaffRoleAssignment
        {
            StaffUserId = staffUser.StaffUserId,
            RoleCode = roleCode,
            ValidFrom = new DateOnly(2026, 1, 1),
        });
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);
    }
}
