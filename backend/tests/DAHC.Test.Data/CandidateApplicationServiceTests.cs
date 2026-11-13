using DAHC.Applications.Core;
using DAHC.Applications.Data;
using DAHC.Applications.Service;
using DAHC.Data;
using DAHC.Service.Access;
using DAHC.Service.Paging;
using DAHC.Service.Results;
using Microsoft.EntityFrameworkCore;
using NSubstitute;

namespace DAHC.Test.Data;

public sealed class CandidateApplicationServiceTests
{
    private static readonly DateTimeOffset now = new(2027, 2, 1, 6, 0, 0, TimeSpan.Zero);

    [Fact]
    public async Task AnotherCandidatesApplication_IsNotFoundAndNotListed()
    {
        TestDatabase database = new(now);
        await using DahcDbContext context = database.CreateContext();
        CatalogSeed catalog = new();
        await catalog.AddToAsync(context, now);
        CurrentUser owner = await CatalogSeed.AddCandidateAsync(context, "owner", "000000001", now);
        CurrentUser otherCandidate = await CatalogSeed.AddCandidateAsync(context, "other", "000000002", now);
        CandidateApplicationService service = CreateService(context, database);
        Result<ApplicationView> created = await service.CreateDraftAsync(
            owner,
            CreateCommand(catalog, "key-0000000000000001"),
            TestContext.Current.CancellationToken);

        Result<ApplicationView> read = await service.GetAsync(
            otherCandidate,
            created.Value.Id,
            TestContext.Current.CancellationToken);
        Result<Page<ApplicationView>> listed = await service.ListAsync(
            otherCandidate,
            null,
            new PageQuery(null, null, null),
            TestContext.Current.CancellationToken);

        Assert.Equal(ResultStatus.NotFound, read.Status);
        Assert.Empty(listed.Value.Items);
    }

    [Fact]
    public async Task SecondActiveApplicationInSameCycle_IsRefused()
    {
        TestDatabase database = new(now);
        await using DahcDbContext context = database.CreateContext();
        CatalogSeed catalog = new();
        await catalog.AddToAsync(context, now);
        CurrentUser candidate = await CatalogSeed.AddCandidateAsync(context, "candidate", "000000001", now);
        CandidateApplicationService service = CreateService(context, database);
        await service.CreateDraftAsync(
            candidate,
            CreateCommand(catalog, "key-0000000000000001"),
            TestContext.Current.CancellationToken);

        Result<ApplicationView> second = await service.CreateDraftAsync(
            candidate,
            CreateCommand(catalog, "key-0000000000000002"),
            TestContext.Current.CancellationToken);

        Assert.Equal(ResultStatus.Conflict, second.Status);
        Assert.Equal(ApplicationErrorCodes.ActiveApplicationExists, second.Error?.Code);
    }

    [Fact]
    public async Task IdempotencyKeyReplayedWithSameRequest_ReturnsOriginalDraft()
    {
        TestDatabase database = new(now);
        await using DahcDbContext context = database.CreateContext();
        CatalogSeed catalog = new();
        await catalog.AddToAsync(context, now);
        CurrentUser candidate = await CatalogSeed.AddCandidateAsync(context, "candidate", "000000001", now);
        CandidateApplicationService service = CreateService(context, database);
        Result<ApplicationView> first = await service.CreateDraftAsync(
            candidate,
            CreateCommand(catalog, "key-0000000000000001"),
            TestContext.Current.CancellationToken);

        Result<ApplicationView> replayed = await service.CreateDraftAsync(
            candidate,
            CreateCommand(catalog, "key-0000000000000001"),
            TestContext.Current.CancellationToken);

        Assert.True(replayed.IsSuccess);
        Assert.Equal(first.Value.Id, replayed.Value.Id);
    }

    [Fact]
    public async Task IdempotencyKeyReusedWithDifferentRequest_IsRefused()
    {
        TestDatabase database = new(now);
        await using DahcDbContext context = database.CreateContext();
        CatalogSeed catalog = new();
        await catalog.AddToAsync(context, now);
        CurrentUser candidate = await CatalogSeed.AddCandidateAsync(context, "candidate", "000000001", now);
        CandidateApplicationService service = CreateService(context, database);
        await service.CreateDraftAsync(
            candidate,
            CreateCommand(catalog, "key-0000000000000001"),
            TestContext.Current.CancellationToken);
        CreateDraftCommand differentRequest = CreateCommand(catalog, "key-0000000000000001") with
        {
            Preferences = [new PreferenceInput(catalog.Surgery, 1, [new TrainingSitePreferenceInput(catalog.RashidHospital, 1)])],
        };

        Result<ApplicationView> reused = await service.CreateDraftAsync(
            candidate,
            differentRequest,
            TestContext.Current.CancellationToken);

        Assert.Equal(ResultStatus.Conflict, reused.Status);
        Assert.Equal(ErrorCodes.IdempotencyKeyReused, reused.Error?.Code);
    }

    [Fact]
    public async Task SavingDraftPreferences_SoftDeletesReplacedPreferencesAndAdvancesVersion()
    {
        TestDatabase database = new(now);
        CatalogSeed catalog = new();
        CurrentUser candidate;
        Guid applicationId;
        await using (DahcDbContext setup = database.CreateContext())
        {
            await catalog.AddToAsync(setup, now);
            candidate = await CatalogSeed.AddCandidateAsync(setup, "candidate", "000000001", now);
            Result<ApplicationView> created = await CreateService(setup, database).CreateDraftAsync(
                candidate,
                CreateCommand(catalog, "key-0000000000000001"),
                TestContext.Current.CancellationToken);
            applicationId = created.Value.Id;
        }

        await using DahcDbContext context = database.CreateContext();
        PreferenceInput[] newPreferences =
        [
            new(catalog.Surgery, 1, [new TrainingSitePreferenceInput(catalog.RashidHospital, 1)]),
        ];

        Result<ApplicationView> saved = await CreateService(context, database).UpdateDraftAsync(
            candidate,
            new UpdateDraftCommand(applicationId, 1, newPreferences),
            TestContext.Current.CancellationToken);

        Assert.True(saved.IsSuccess);
        Assert.Equal(2, saved.Value.Version);
        PreferenceInput visible = Assert.Single(saved.Value.Preferences);
        Assert.Equal(catalog.Surgery, visible.SpecialtyId);
        List<ApplicationPreference> allRows = await context.ApplicationPreferences
            .IgnoreQueryFilters()
            .ToListAsync(TestContext.Current.CancellationToken);
        Assert.Equal(2, allRows.Count);
    }

    [Fact]
    public async Task SavingDraftWithStaleVersion_IsRefused()
    {
        TestDatabase database = new(now);
        await using DahcDbContext context = database.CreateContext();
        CatalogSeed catalog = new();
        await catalog.AddToAsync(context, now);
        CurrentUser candidate = await CatalogSeed.AddCandidateAsync(context, "candidate", "000000001", now);
        CandidateApplicationService service = CreateService(context, database);
        Result<ApplicationView> created = await service.CreateDraftAsync(
            candidate,
            CreateCommand(catalog, "key-0000000000000001"),
            TestContext.Current.CancellationToken);

        Result<ApplicationView> saved = await service.UpdateDraftAsync(
            candidate,
            new UpdateDraftCommand(created.Value.Id, 7, created.Value.Preferences),
            TestContext.Current.CancellationToken);

        Assert.Equal(ResultStatus.PreconditionFailed, saved.Status);
    }

    private static CandidateApplicationService CreateService(DahcDbContext context, TestDatabase database)
    {
        IApplicationNumberAllocator allocator = Substitute.For<IApplicationNumberAllocator>();
        allocator.AllocateAsync(Arg.Any<int>(), Arg.Any<short>(), Arg.Any<CancellationToken>())
            .Returns("20270000001", "20270000002");

        return new CandidateApplicationService(context, new ApplicationReader(context), allocator, database.TimeProvider);
    }

    private static CreateDraftCommand CreateCommand(CatalogSeed catalog, string idempotencyKey)
    {
        PreferenceInput[] preferences =
        [
            new(
                catalog.Cardiology,
                1,
                [
                    new TrainingSitePreferenceInput(catalog.DubaiHospital, 1),
                    new TrainingSitePreferenceInput(catalog.RashidHospital, 2),
                ]),
        ];

        return new CreateDraftCommand(catalog.CycleId, catalog.ProgramId, preferences, idempotencyKey);
    }
}
