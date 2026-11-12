using System.Diagnostics;
using DAHC.Data;
using DAHC.Data.Operations;
using DAHC.Identity.Core;
using DAHC.Identity.Data;
using DAHC.Identity.Service;
using DAHC.Service.Access;
using DAHC.Service.Results;
using Microsoft.EntityFrameworkCore;

namespace DAHC.Test.Data;

/// <summary>
/// Security and provisioning audit events of sign-in and the active-role switch (BE-03, DEC-07, standard s.19):
/// exactly one event per outcome, with outcome, reason code, actor, resource and trace id, and nothing sensitive.
/// </summary>
public sealed class SecurityAuditTests
{
    private static readonly DateTimeOffset now = new(2026, 11, 11, 8, 0, 0, TimeSpan.Zero);

    private static readonly string[] securityActions =
    [
        AuditActions.AccountProvisioned,
        AuditActions.DuplicateDetected,
        AuditActions.SignIn,
        AuditActions.ActiveRoleSwitched,
        AuditActions.AccessDenied,
    ];

    [Fact]
    [Trait("Requirement", "US-1.1.1")]
    public async Task FirstSignIn_WritesOneProvisionedSuccessWithMetadataAndTraceId()
    {
        TestDatabase database = new(now);
        await using DahcDbContext context = database.CreateContext();
        AuthSessionService service = AuthSessionServiceTests.CreateService(database, context, "000000001");
        IdamIdentity identity = AuthSessionServiceTests.Identity("new.candidate");

        // As the access middleware leaves it for a first sign-in: a user token with no local account yet.
        database.Access.SetRefusedUser(identity, AccessStatus.NotRegistered);
        using Activity activity = new Activity("sign-in").Start();

        Result<AuthSession> result = await service.SignInAsync(
            identity,
            new IdentityProfile { Subject = "new.candidate", DisplayName = "New Candidate" },
            TestContext.Current.CancellationToken);

        Assert.True(result.IsSuccess);
        AuditEvent auditEvent = Assert.Single(await ReadSecurityEventsAsync(context));
        Assert.Equal(AuditActions.AccountProvisioned, auditEvent.ActionCode);
        Assert.Equal(AuditOutcomes.Success, auditEvent.Outcome);
        Assert.Null(auditEvent.ReasonCode);
        Assert.Equal("candidate", auditEvent.ResourceType);
        Assert.Equal(result.Value.UserId.ToString(), auditEvent.ResourceId);
        Assert.Equal("CANDIDATE", auditEvent.ActorType);
        Assert.Equal(now, auditEvent.OccurredAt);
        Assert.Equal(activity.TraceId.ToHexString(), auditEvent.RequestId);

        // The row-change audit is kept alongside the security event.
        Assert.Contains(
            await context.AuditEvents.ToListAsync(TestContext.Current.CancellationToken),
            row => row.ActionCode == "candidate.created");
    }

    [Fact]
    [Trait("Requirement", "US-1.1.1/AC5")]
    public async Task DuplicateFirstSignIn_WritesDuplicateDetectedDeniedAndNoProvisioning()
    {
        TestDatabase database = new(now);
        await using DahcDbContext context = database.CreateContext();
        Candidate original = AuthSessionServiceTests.Candidate("original.account", "000000001", isActive: true);
        original.MobileNumber = "+971501234567";
        context.Candidates.Add(original);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);
        AuthSessionService service = AuthSessionServiceTests.CreateService(database, context, "000000002");

        Result<AuthSession> result = await service.SignInAsync(
            AuthSessionServiceTests.Identity("second.account"),
            new IdentityProfile
            {
                Subject = "second.account",
                DisplayName = "Second Account",
                MobileNumber = "+971501234567",
            },
            TestContext.Current.CancellationToken);

        Assert.Equal(IdentityErrorCodes.Duplicate, result.Error?.Code);
        Candidate duplicate = await context.Candidates
            .SingleAsync(candidate => !candidate.IsActive, TestContext.Current.CancellationToken);
        AuditEvent auditEvent = Assert.Single(await ReadSecurityEventsAsync(context));
        Assert.Equal(AuditActions.DuplicateDetected, auditEvent.ActionCode);
        Assert.Equal(AuditOutcomes.Denied, auditEvent.Outcome);
        Assert.Equal(IdentityErrorCodes.Duplicate, auditEvent.ReasonCode);
        Assert.Equal(duplicate.PublicId.ToString(), auditEvent.ResourceId);
    }

    [Fact]
    [Trait("Requirement", "US-1.1.2")]
    public async Task DeactivatedCandidateSignIn_WritesDeniedWithAccountAsActorAndChangesNothingElse()
    {
        TestDatabase database = new(now);
        await using DahcDbContext context = database.CreateContext();
        Candidate deactivated = AuthSessionServiceTests.Candidate("deactivated.one", "000000007", isActive: false);
        context.Candidates.Add(deactivated);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);
        int rowsBefore = await context.AuditEvents.CountAsync(TestContext.Current.CancellationToken);
        AuthSessionService service = AuthSessionServiceTests.CreateService(database, context, "000000008");

        Result<AuthSession> result = await service.SignInAsync(
            AuthSessionServiceTests.Identity("deactivated.one"),
            new IdentityProfile { Subject = "deactivated.one", DisplayName = "Changed Name" },
            TestContext.Current.CancellationToken);

        Assert.Equal(IdentityErrorCodes.Deactivated, result.Error?.Code);
        AuditEvent auditEvent = Assert.Single(await ReadSecurityEventsAsync(context));
        Assert.Equal(AuditActions.SignIn, auditEvent.ActionCode);
        Assert.Equal(AuditOutcomes.Denied, auditEvent.Outcome);
        Assert.Equal(IdentityErrorCodes.Deactivated, auditEvent.ReasonCode);
        Assert.Equal(deactivated.CandidateId, auditEvent.ActorCandidateId);
        Assert.Equal(deactivated.PublicId.ToString(), auditEvent.ResourceId);

        // The refusal is the only row written: no profile refresh, no reactivation.
        Assert.Equal(rowsBefore + 1, await context.AuditEvents.CountAsync(TestContext.Current.CancellationToken));
        Candidate stored = await context.Candidates.AsNoTracking().SingleAsync(TestContext.Current.CancellationToken);
        Assert.False(stored.IsActive);
        Assert.Equal("Existing Candidate", stored.DisplayName);
    }

    [Fact]
    [Trait("Requirement", "US-1.1.2")]
    public async Task DeactivatedStaffSignIn_WritesDeniedForTheStaffUser()
    {
        TestDatabase database = new(now);
        await using DahcDbContext context = database.CreateContext();
        StaffUser officer = await AuthSessionServiceTests.AddStaffUserAsync(
            context,
            "officer.disabled",
            RoleCodes.AdmissionOfficer);
        officer.IsActive = false;
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);
        AuthSessionService service = AuthSessionServiceTests.CreateService(database, context, "000000001");

        await service.SignInAsync(
            AuthSessionServiceTests.Identity("officer.disabled"),
            new IdentityProfile { Subject = "officer.disabled", DisplayName = "Officer" },
            TestContext.Current.CancellationToken);

        AuditEvent auditEvent = Assert.Single(await ReadSecurityEventsAsync(context));
        Assert.Equal(AuditOutcomes.Denied, auditEvent.Outcome);
        Assert.Equal(IdentityErrorCodes.Deactivated, auditEvent.ReasonCode);
        Assert.Equal("STAFF", auditEvent.ActorType);
        Assert.Equal(officer.StaffUserId, auditEvent.ActorStaffUserId);
        Assert.Equal("staff_user", auditEvent.ResourceType);
    }

    [Fact]
    [Trait("Requirement", "US-1.1.2")]
    public async Task SecondSignIn_WritesOneSignInEventWithoutRepeatingProvisioning()
    {
        TestDatabase database = new(now);
        await using DahcDbContext context = database.CreateContext();
        AuthSessionService service = AuthSessionServiceTests.CreateService(database, context, "000000001");
        IdentityProfile profile = new() { Subject = "returning.one", DisplayName = "Returning" };

        await service.SignInAsync(
            AuthSessionServiceTests.Identity("returning.one"),
            profile,
            TestContext.Current.CancellationToken);
        await service.SignInAsync(
            AuthSessionServiceTests.Identity("returning.one"),
            profile,
            TestContext.Current.CancellationToken);

        List<AuditEvent> events = await ReadSecurityEventsAsync(context);
        Assert.Equal(
            [AuditActions.AccountProvisioned, AuditActions.SignIn],
            events.Select(auditEvent => auditEvent.ActionCode));
        Assert.All(events, auditEvent => Assert.Equal(AuditOutcomes.Success, auditEvent.Outcome));
    }

    [Fact]
    public async Task StaffWithoutRoleSignIn_WritesDeniedNoRole()
    {
        TestDatabase database = new(now);
        await using DahcDbContext context = database.CreateContext();
        StaffUser officer = await AuthSessionServiceTests.AddStaffUserAsync(
            context,
            "officer.no.role",
            RoleCodes.AdmissionOfficer);
        StaffRoleAssignment assignment = await context.StaffRoleAssignments.SingleAsync(
            TestContext.Current.CancellationToken);
        assignment.ValidTo = new DateOnly(2026, 6, 30);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);
        AuthSessionService service = AuthSessionServiceTests.CreateService(database, context, "000000001");

        Result<AuthSession> result = await service.SignInAsync(
            AuthSessionServiceTests.Identity("officer.no.role"),
            new IdentityProfile { Subject = "officer.no.role", DisplayName = officer.DisplayName },
            TestContext.Current.CancellationToken);

        Assert.Equal(IdentityErrorCodes.NoRole, result.Error?.Code);
        AuditEvent auditEvent = Assert.Single(await ReadSecurityEventsAsync(context));
        Assert.Equal(AuditOutcomes.Denied, auditEvent.Outcome);
        Assert.Equal(IdentityErrorCodes.NoRole, auditEvent.ReasonCode);
        Assert.Equal(officer.StaffUserId, auditEvent.ActorStaffUserId);
    }

    [Fact]
    public async Task ActiveRoleSwitch_WritesSuccessForTheRoleSwitchedTo()
    {
        TestDatabase database = new(now);
        await using DahcDbContext context = database.CreateContext();
        StaffUser officer = await AuthSessionServiceTests.AddStaffUserAsync(
            context,
            "officer.switch",
            RoleCodes.AdmissionOfficer);
        context.StaffRoleAssignments.Add(new StaffRoleAssignment
        {
            StaffUserId = officer.StaffUserId,
            RoleCode = RoleCodes.Referee,
            ValidFrom = new DateOnly(2026, 1, 1),
        });
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);
        AuthSessionService service = AuthSessionServiceTests.CreateService(database, context, "000000001");
        CurrentUser user = AuthSessionServiceTests.StaffCurrentUser(
            officer,
            [RoleCodes.AdmissionOfficer, RoleCodes.Referee]);

        Result<AuthSession> result = await service.SwitchActiveRoleAsync(
            user,
            RoleCodes.Referee,
            TestContext.Current.CancellationToken);

        Assert.True(result.IsSuccess);
        AuditEvent auditEvent = Assert.Single(await ReadSecurityEventsAsync(context));
        Assert.Equal(AuditActions.ActiveRoleSwitched, auditEvent.ActionCode);
        Assert.Equal(AuditOutcomes.Success, auditEvent.Outcome);
        Assert.Equal("role", auditEvent.ResourceType);
        Assert.Equal(RoleCodes.Referee, auditEvent.ResourceId);
        Assert.Equal(officer.StaffUserId, auditEvent.ActorStaffUserId);
    }

    [Fact]
    public async Task ActiveRoleSwitchToRoleNotHeld_WritesDeniedAndKeepsActiveRole()
    {
        TestDatabase database = new(now);
        await using DahcDbContext context = database.CreateContext();
        StaffUser officer = await AuthSessionServiceTests.AddStaffUserAsync(
            context,
            "officer.escalate",
            RoleCodes.AdmissionOfficer);
        AuthSessionService service = AuthSessionServiceTests.CreateService(database, context, "000000001");
        CurrentUser user = AuthSessionServiceTests.StaffCurrentUser(officer, [RoleCodes.AdmissionOfficer]);

        await service.SwitchActiveRoleAsync(user, RoleCodes.Administrator, TestContext.Current.CancellationToken);

        AuditEvent auditEvent = Assert.Single(await ReadSecurityEventsAsync(context));
        Assert.Equal(AuditOutcomes.Denied, auditEvent.Outcome);
        Assert.Equal(IdentityErrorCodes.RoleNotHeld, auditEvent.ReasonCode);
        Assert.Equal(RoleCodes.Administrator, auditEvent.ResourceId);
        StaffUser stored = await context.StaffUsers.AsNoTracking().SingleAsync(TestContext.Current.CancellationToken);
        Assert.Null(stored.ActiveRoleCode);
    }

    [Fact]
    [Trait("Requirement", "US-1.1.1")]
    public async Task AuditEvents_HoldNoSubjectIssuerOrProfileValues()
    {
        TestDatabase database = new(now);
        await using DahcDbContext context = database.CreateContext();
        AuthSessionService service = AuthSessionServiceTests.CreateService(database, context, "000000001");
        IdentityProfile profile = new()
        {
            Subject = "private.subject",
            DisplayName = "Private Person",
            Email = "private.person@example.test",
            MobileNumber = "+971509876543",
            EmiratesId = "784-1990-7654321-0",
            PassportNumber = "P1234567",
        };

        await service.SignInAsync(
            AuthSessionServiceTests.Identity("private.subject"),
            profile,
            TestContext.Current.CancellationToken);
        await service.SignInAsync(
            AuthSessionServiceTests.Identity("private.subject"),
            profile,
            TestContext.Current.CancellationToken);

        List<AuditEvent> events = await context.AuditEvents.ToListAsync(TestContext.Current.CancellationToken);
        string[] sensitive =
        [
            "private.subject",
            AuthSessionServiceTests.IdamIssuer,
            "Private Person",
            "private.person@example.test",
            "971509876543",
            "784199076543210",
            "P1234567",
        ];
        IEnumerable<string> recorded = events.SelectMany(auditEvent => new[]
        {
            auditEvent.ActorType,
            auditEvent.ActiveRoleCode,
            auditEvent.ActionCode,
            auditEvent.ResourceType,
            auditEvent.ResourceId,
            auditEvent.Outcome,
            auditEvent.ReasonCode,
            auditEvent.RequestId,
        }).OfType<string>();
        Assert.NotEmpty(events);
        Assert.DoesNotContain(
            recorded,
            value => sensitive.Any(secret => value.Contains(secret, StringComparison.OrdinalIgnoreCase)));
    }

    [Fact]
    public async Task StandAloneWrite_WithOtherPendingChanges_IsRefused()
    {
        TestDatabase database = new(now);
        await using DahcDbContext context = database.CreateContext();
        context.Candidates.Add(AuthSessionServiceTests.Candidate("pending.change", "000000001", isActive: true));
        AuditWriter writer = new(context, database.Access, database.TimeProvider);

        await Assert.ThrowsAsync<InvalidOperationException>(() => writer.WriteAsync(
            new AuditRecord(AuditActions.AccessDenied, AuditOutcomes.Denied, "endpoint", "GET test")
            {
                ReasonCode = "auth.forbidden",
            }));

        Assert.False(await context.Candidates.AnyAsync(TestContext.Current.CancellationToken));
    }

    private static Task<List<AuditEvent>> ReadSecurityEventsAsync(DahcDbContext context)
    {
        return context.AuditEvents
            .AsNoTracking()
            .Where(auditEvent => securityActions.Contains(auditEvent.ActionCode))
            .OrderBy(auditEvent => auditEvent.AuditEventId)
            .ToListAsync(TestContext.Current.CancellationToken);
    }
}
