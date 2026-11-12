using DAHC.Data;
using DAHC.Identity.Core;
using DAHC.Identity.Data;
using DAHC.Identity.Service;
using DAHC.Service.Access;
using DAHC.Service.Time;

namespace DAHC.Test.Data;

public sealed class CurrentUserLoaderTests
{
    private static readonly DateTimeOffset now = new(2026, 11, 11, 8, 0, 0, TimeSpan.Zero);

    private static readonly LocaleSettings locale = new("Asia/Dubai", "en-AE", ["en-AE", "ar-AE"]);

    [Fact]
    [Trait("Decision", "AP-04")]
    public async Task StaffUser_IsLoadedForMatchingIssuerAndSubject()
    {
        TestDatabase database = new(now);
        await using DahcDbContext context = database.CreateContext();
        StaffUser officer = await AuthSessionServiceTests.AddStaffUserAsync(
            context,
            "officer.loader",
            RoleCodes.AdmissionOfficer);
        CurrentUserLoader loader = CreateLoader(database, context);

        CurrentUserLoadResult result = await loader.LoadAsync(
            new IdamIdentity(AuthSessionServiceTests.IdamIssuer, "officer.loader"),
            TestContext.Current.CancellationToken);

        Assert.Equal(AccessStatus.Active, result.Status);
        Assert.Equal(officer.PublicId, result.User?.PublicId);
    }

    [Fact]
    [Trait("Decision", "AP-04")]
    public async Task SameSubjectFromAnotherIssuer_IsNotRegistered()
    {
        TestDatabase database = new(now);
        await using DahcDbContext context = database.CreateContext();
        await AuthSessionServiceTests.AddStaffUserAsync(context, "officer.loader", RoleCodes.Administrator);
        CurrentUserLoader loader = CreateLoader(database, context);

        CurrentUserLoadResult result = await loader.LoadAsync(
            new IdamIdentity("dahc-development", "officer.loader"),
            TestContext.Current.CancellationToken);

        Assert.Equal(AccessStatus.NotRegistered, result.Status);
        Assert.Null(result.User);
    }

    private static CurrentUserLoader CreateLoader(TestDatabase database, DahcDbContext context)
    {
        LocalTimeService localTime = new(database.TimeProvider, locale);
        IdentityUsers identityUsers = new(context, localTime, new AccessSettings(RoleCodes.StaffRoles), locale);

        return new CurrentUserLoader(context, identityUsers);
    }
}
