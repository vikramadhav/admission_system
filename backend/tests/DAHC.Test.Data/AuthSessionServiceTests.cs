using DAHC.Data;
using DAHC.Identity.Core;
using DAHC.Identity.Data;
using DAHC.Identity.Service;
using DAHC.Service.Access;
using DAHC.Service.Results;
using DAHC.Service.Time;
using Microsoft.EntityFrameworkCore;
using NSubstitute;

namespace DAHC.Test.Data;

public sealed class AuthSessionServiceTests
{
    private static readonly DateTimeOffset now = new(2026, 11, 11, 8, 0, 0, TimeSpan.Zero);

    private static readonly LocaleSettings locale = new("Asia/Dubai", "en-AE", ["en-AE", "ar-AE"]);

    private static readonly AccessSettings access = new(RoleCodes.StaffRoles);

    [Fact]
    public async Task FirstSignInOfUnknownIdentity_CreatesCandidateWithCandidateRoleOnly()
    {
        TestDatabase database = new(now);
        await using DahcDbContext context = database.CreateContext();
        AuthSessionService service = CreateService(database, context, "000000001");

        Result<AuthSession> result = await service.SignInAsync(
            "new.candidate",
            Profile("new.candidate"),
            TestContext.Current.CancellationToken);

        Assert.True(result.IsSuccess);
        Assert.Equal(UserType.Candidate, result.Value.UserType);
        Assert.Equal([RoleCodes.Candidate], result.Value.Roles);
        Assert.Equal(RoleCodes.Candidate, result.Value.ActiveRole);
        Assert.Equal("000000001", result.Value.CandidateNumber);
        Candidate stored = await context.Candidates.SingleAsync(TestContext.Current.CancellationToken);
        Assert.True(stored.IsActive);
        Assert.Contains(
            await context.AuditEvents.ToListAsync(TestContext.Current.CancellationToken),
            auditEvent => auditEvent.ActionCode == "candidate.created");
    }

    [Fact]
    public async Task PreRegisteredStaffUser_SignsInAsStaffWithoutCreatingCandidate()
    {
        TestDatabase database = new(now);
        await using DahcDbContext context = database.CreateContext();
        StaffUser officer = await AddStaffUserAsync(context, "officer.one", RoleCodes.AdmissionOfficer);
        AuthSessionService service = CreateService(database, context, "000000001");

        Result<AuthSession> result = await service.SignInAsync(
            "officer.one",
            Profile("officer.one"),
            TestContext.Current.CancellationToken);

        Assert.True(result.IsSuccess);
        Assert.Equal(UserType.Staff, result.Value.UserType);
        Assert.Equal(officer.PublicId, result.Value.UserId);
        Assert.Equal([RoleCodes.AdmissionOfficer], result.Value.Roles);
        Assert.False(await context.Candidates.AnyAsync(TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task DeactivatedCandidate_IsRefusedAndStaysDeactivated()
    {
        TestDatabase database = new(now);
        await using DahcDbContext context = database.CreateContext();
        context.Candidates.Add(Candidate("deactivated.candidate", "000000007", isActive: false));
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);
        AuthSessionService service = CreateService(database, context, "000000008");

        Result<AuthSession> result = await service.SignInAsync(
            "deactivated.candidate",
            Profile("deactivated.candidate"),
            TestContext.Current.CancellationToken);

        Assert.Equal(ResultStatus.Forbidden, result.Status);
        Assert.Equal(IdentityErrorCodes.Deactivated, result.Error?.Code);
        Candidate stored = await context.Candidates.SingleAsync(TestContext.Current.CancellationToken);
        Assert.False(stored.IsActive);
    }

    [Fact]
    public async Task IdentityMatchingAnotherCandidatesEmiratesId_RecordsDuplicatePairAndIsRefused()
    {
        TestDatabase database = new(now);
        await using DahcDbContext context = database.CreateContext();
        Candidate original = Candidate("original.account", "000000001", isActive: true);
        original.EmiratesIdNumber = "784199012345671";
        context.Candidates.Add(original);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);
        AuthSessionService service = CreateService(database, context, "000000002");
        IdentityProfile profile = Profile("second.account") with { EmiratesId = "784-1990-1234567-1" };

        Result<AuthSession> result = await service.SignInAsync(
            "second.account",
            profile,
            TestContext.Current.CancellationToken);

        Assert.Equal(ResultStatus.Conflict, result.Status);
        Assert.Equal(IdentityErrorCodes.Duplicate, result.Error?.Code);
        DuplicateAccountPair pair = await context.DuplicateAccountPairs.SingleAsync(TestContext.Current.CancellationToken);
        Assert.Equal(original.CandidateId, pair.OriginalCandidateId);
        Assert.True(pair.MatchedOnEmiratesId);
        Candidate duplicate = await context.Candidates
            .SingleAsync(candidate => candidate.IdamUserId == "second.account", TestContext.Current.CancellationToken);
        Assert.False(duplicate.IsActive);
    }

    [Fact]
    public async Task SwitchToRoleNotHeld_IsRefusedAndActiveRoleUnchanged()
    {
        TestDatabase database = new(now);
        await using DahcDbContext context = database.CreateContext();
        StaffUser officer = await AddStaffUserAsync(context, "officer.two", RoleCodes.AdmissionOfficer);
        AuthSessionService service = CreateService(database, context, "000000001");
        CurrentUser user = StaffCurrentUser(officer, [RoleCodes.AdmissionOfficer]);

        Result<AuthSession> result = await service.SwitchActiveRoleAsync(
            user,
            RoleCodes.Administrator,
            TestContext.Current.CancellationToken);

        Assert.Equal(ResultStatus.Forbidden, result.Status);
        Assert.Equal(IdentityErrorCodes.RoleNotHeld, result.Error?.Code);
        StaffUser stored = await context.StaffUsers.SingleAsync(TestContext.Current.CancellationToken);
        Assert.Null(stored.ActiveRoleCode);
    }

    private static AuthSessionService CreateService(TestDatabase database, DahcDbContext context, string candidateNumber)
    {
        ICandidateNumberAllocator allocator = Substitute.For<ICandidateNumberAllocator>();
        allocator.AllocateAsync(Arg.Any<CancellationToken>()).Returns(candidateNumber);
        LocalTimeService localTime = new(database.TimeProvider, locale);
        IdentityUsers identityUsers = new(context, localTime, access, locale);

        return new AuthSessionService(context, identityUsers, allocator, database.TimeProvider);
    }

    private static IdentityProfile Profile(string subject)
    {
        return new IdentityProfile { Subject = subject, DisplayName = "Test Person", Email = subject + "@example.test" };
    }

    private static Candidate Candidate(string idamUserId, string candidateNumber, bool isActive)
    {
        Candidate candidate = new()
        {
            PublicId = Guid.NewGuid(),
            CandidateNumber = candidateNumber,
            IdamUserId = idamUserId,
            DisplayName = "Existing Candidate",
            IsActive = isActive,
            CreatedAt = now.AddDays(-30),
        };

        return candidate;
    }

    private static async Task<StaffUser> AddStaffUserAsync(DahcDbContext context, string idamUserId, string roleCode)
    {
        StaffUser staffUser = new()
        {
            PublicId = Guid.NewGuid(),
            IdamUserId = idamUserId,
            DisplayName = "Pre-registered Officer",
            Email = idamUserId + "@example.test",
            IsActive = true,
            CreatedAt = now.AddDays(-10),
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

        return staffUser;
    }

    private static CurrentUser StaffCurrentUser(StaffUser staffUser, IReadOnlyList<string> roles)
    {
        CurrentUser user = new()
        {
            UserType = UserType.Staff,
            PublicId = staffUser.PublicId,
            InternalId = staffUser.StaffUserId,
            DisplayName = staffUser.DisplayName,
            Roles = roles,
            ActiveRole = roles[0],
            Culture = "en-AE",
            TimeZoneId = "Asia/Dubai",
        };

        return user;
    }
}
