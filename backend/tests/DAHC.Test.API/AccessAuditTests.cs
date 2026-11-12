using System.Net;
using System.Net.Http.Json;
using DAHC.API.Http;
using DAHC.Data;
using DAHC.Data.Operations;
using DAHC.Identity.Core;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace DAHC.Test.API;

/// <summary>
/// Refused authenticated requests are audited once, with the reason code and the request's trace id, and without
/// the token, the subject or the request body (BE-03, DEC-07).
/// </summary>
public sealed class AccessAuditTests
{
    [Fact]
    public async Task CandidateCallingStaffEndpoint_WritesOneAccessDeniedWithTraceId()
    {
        await using DahcApiFactory factory = new();
        HttpClient client = factory.CreateClientFor("candidate.escalating");
        await client.PostAsync("/api/v1/auth/sign-in", null, TestContext.Current.CancellationToken);

        HttpResponseMessage response = await client.PutAsJsonAsync(
            "/api/v1/auth/active-role",
            new { roleCode = "ADMINISTRATOR" },
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        AuditEvent auditEvent = Assert.Single(await ReadEventsAsync(factory, AuditActions.AccessDenied));
        Assert.Equal(AuditOutcomes.Denied, auditEvent.Outcome);
        Assert.Equal("auth.forbidden", auditEvent.ReasonCode);
        Assert.Equal("endpoint", auditEvent.ResourceType);
        Assert.Equal("PUT api/v1/auth/active-role", auditEvent.ResourceId);
        Assert.Equal("CANDIDATE", auditEvent.ActorType);
        Assert.NotNull(auditEvent.ActorCandidateId);
        Assert.Equal(
            Assert.Single(response.Headers.GetValues(RequestIdMiddleware.RequestIdHeader)),
            auditEvent.RequestId);
    }

    [Fact]
    public async Task DeactivatedCandidate_AccessAndSignInAttemptsAreEachAuditedOnce()
    {
        await using DahcApiFactory factory = new();
        await AddDeactivatedCandidateAsync(factory, "candidate.disabled");
        HttpClient client = factory.CreateClientFor("candidate.disabled");

        HttpResponseMessage me = await client.GetAsync("/api/v1/auth/me", TestContext.Current.CancellationToken);
        HttpResponseMessage signIn = await client.PostAsJsonAsync(
            "/api/v1/auth/sign-in",
            new { password = "not-recorded", idamUserId = "not-recorded" },
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, me.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, signIn.StatusCode);
        AuditEvent accessDenied = Assert.Single(await ReadEventsAsync(factory, AuditActions.AccessDenied));
        Assert.Equal("account.deactivated", accessDenied.ReasonCode);
        Assert.Equal("GET api/v1/auth/me", accessDenied.ResourceId);
        AuditEvent signInDenied = Assert.Single(await ReadEventsAsync(factory, AuditActions.SignIn));
        Assert.Equal(AuditOutcomes.Denied, signInDenied.Outcome);
        Assert.Equal("account.deactivated", signInDenied.ReasonCode);
        Assert.NotEqual(accessDenied.RequestId, signInDenied.RequestId);

        List<AuditEvent> all = await ReadEventsAsync(factory, null);
        Assert.DoesNotContain(
            all.SelectMany(auditEvent => new[] { auditEvent.ResourceId, auditEvent.ReasonCode, auditEvent.RequestId }),
            value => value is not null
                && (value.Contains("candidate.disabled", StringComparison.Ordinal)
                    || value.Contains("not-recorded", StringComparison.Ordinal)
                    || value.Contains("test:", StringComparison.Ordinal)));
    }

    [Fact]
    public async Task IdentityNeverRegistered_AccessDeniedHasNoLocalActor()
    {
        await using DahcApiFactory factory = new();
        HttpClient client = factory.CreateClientFor("never.registered");

        await client.GetAsync("/api/v1/auth/me", TestContext.Current.CancellationToken);

        AuditEvent auditEvent = Assert.Single(await ReadEventsAsync(factory, AuditActions.AccessDenied));
        Assert.Equal("account.not_registered", auditEvent.ReasonCode);
        Assert.Null(auditEvent.ActorCandidateId);
        Assert.Null(auditEvent.ActorStaffUserId);
    }

    [Fact]
    public async Task AnonymousRequest_IsNotAudited()
    {
        await using DahcApiFactory factory = new();
        HttpClient client = factory.CreateClientFor(null);

        HttpResponseMessage response = await client.GetAsync("/api/v1/auth/me", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Empty(await ReadEventsAsync(factory, null));
    }

    private static async Task AddDeactivatedCandidateAsync(DahcApiFactory factory, string subject)
    {
        using IServiceScope scope = factory.Services.CreateScope();
        DahcDbContext context = scope.ServiceProvider.GetRequiredService<DahcDbContext>();
        context.Candidates.Add(new Candidate
        {
            PublicId = Guid.NewGuid(),
            CandidateNumber = "000000009",
            IdamIssuer = TestAuthenticationHandler.Issuer,
            IdamUserId = subject,
            DisplayName = "Deactivated Candidate",
            IsActive = false,
            CreatedAt = DateTimeOffset.UtcNow.AddDays(-1),
        });
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);
    }

    /// <summary>
    /// The audit events with the action code, or all events except the row-change events of test seeding.
    /// </summary>
    private static async Task<List<AuditEvent>> ReadEventsAsync(DahcApiFactory factory, string? actionCode)
    {
        using IServiceScope scope = factory.Services.CreateScope();
        DahcDbContext context = scope.ServiceProvider.GetRequiredService<DahcDbContext>();

        return await context.AuditEvents
            .AsNoTracking()
            .Where(auditEvent => actionCode == null
                ? !auditEvent.ActionCode.EndsWith(".created")
                : auditEvent.ActionCode == actionCode)
            .OrderBy(auditEvent => auditEvent.AuditEventId)
            .ToListAsync(TestContext.Current.CancellationToken);
    }
}
