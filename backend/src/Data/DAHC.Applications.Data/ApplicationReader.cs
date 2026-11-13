using System.Linq.Expressions;
using DAHC.Applications.Core;
using DAHC.Applications.Service;
using DAHC.Catalog.Core;
using DAHC.Data;
using DAHC.Data.Querying;
using DAHC.Service.Paging;
using DAHC.Service.Results;
using Microsoft.EntityFrameworkCore;

namespace DAHC.Applications.Data;

/// <summary>
/// Read projections of a candidate's applications. Every query starts from the candidate's own key, which is the
/// ownership filter: another candidate's application is never read.
/// </summary>
internal sealed class ApplicationReader
{
    private static readonly IReadOnlyDictionary<string, Expression<Func<ApplicationRow, object?>>> sorts =
        new Dictionary<string, Expression<Func<ApplicationRow, object?>>>
        {
            [ApplicationSortFields.CreatedAt] = row => row.CreatedAt,
            [ApplicationSortFields.SubmittedAt] = row => row.SubmittedAt,
        };

    private readonly DahcDbContext dbContext;

    public ApplicationReader(DahcDbContext dbContext)
    {
        this.dbContext = dbContext;
    }

    public async Task<Result<Page<ApplicationView>>> ReadPageAsync(
        long candidateId,
        Guid? cycleId,
        PageQuery pageQuery,
        CancellationToken cancellationToken)
    {
        Result<IReadOnlyList<SortKey>> sort = SortParser.Parse(
            pageQuery.Sort,
            ApplicationSortFields.DefaultSort,
            ApplicationSortFields.All);

        if (!sort.IsSuccess)
        {
            return sort.ToFailure<Page<ApplicationView>>();
        }

        IQueryable<ApplicationRow> rows = this.QueryRows(candidateId);

        if (cycleId is not null)
        {
            Guid requestedCycleId = cycleId.Value;
            rows = rows.Where(row => row.CyclePublicId == requestedCycleId);
        }

        // The cursor is bound to the candidate as well as the filter and sort.
        string context = $"applications|{candidateId}|{cycleId:N}|{SortParser.Describe(sort.Value)}";
        Result<Page<ApplicationRow>> page = await rows
            .OrderBySortKeys(sort.Value, sorts, row => row.ApplicationId)
            .ReadPageAsync(pageQuery, context, cancellationToken);

        if (!page.IsSuccess)
        {
            return page.ToFailure<Page<ApplicationView>>();
        }

        IReadOnlyList<ApplicationView> views = await this.ToViewsAsync(page.Value.Items, cancellationToken);
        Page<ApplicationView> viewPage = new(views, page.Value.Limit, page.Value.NextCursor);

        return Result.Success(viewPage);
    }

    public async Task<ApplicationView?> FindAsync(
        long candidateId,
        Guid applicationId,
        CancellationToken cancellationToken)
    {
        ApplicationRow? row = await this.QueryRows(candidateId)
            .FirstOrDefaultAsync(application => application.PublicId == applicationId, cancellationToken);

        if (row is null)
        {
            return null;
        }

        IReadOnlyList<ApplicationView> views = await this.ToViewsAsync([row], cancellationToken);

        return views[0];
    }

    private static ApplicationView ToView(
        ApplicationRow row,
        IReadOnlyDictionary<long, List<PreferenceInput>> preferencesByApplication)
    {
        ApplicationProgram program = new(
            row.ProgramPublicId,
            row.ProgramCode,
            row.ProgramName,
            EnumCodes.ToCode(row.ProgramCategory),
            row.CyclePublicId,
            row.ApplicationOpensAt,
            row.ApplicationClosesAt,
            row.TimeZoneId);

        bool hasPreferences = preferencesByApplication.TryGetValue(
            row.ApplicationId,
            out List<PreferenceInput>? preferences);

        ApplicationView view = new()
        {
            Id = row.PublicId,
            ApplicationNumber = row.ApplicationNumber,
            Program = program,
            Status = row.Status,
            CreatedAt = row.CreatedAt,
            SubmittedAt = row.SubmittedAt,
            Version = row.VersionNo,
            Preferences = hasPreferences && preferences is not null ? preferences : [],
        };

        return view;
    }

    private IQueryable<ApplicationRow> QueryRows(long candidateId)
    {
        IQueryable<ApplicationRow> rows =
            from application in this.dbContext.Applications
            join programCycle in this.dbContext.ProgramCycles
                on application.ProgramCycleId equals programCycle.ProgramCycleId
            join program in this.dbContext.Programs on programCycle.ProgramId equals program.ProgramId
            join cycle in this.dbContext.AdmissionCycles on application.AdmissionCycleId equals cycle.CycleId
            where application.CandidateId == candidateId
            select new ApplicationRow
            {
                ApplicationId = application.ApplicationId,
                PublicId = application.PublicId,
                ApplicationNumber = application.ApplicationNumber,
                Status = application.Status,
                CreatedAt = application.CreatedAt,
                SubmittedAt = application.SubmittedAt,
                VersionNo = application.VersionNo,
                ProgramPublicId = program.PublicId,
                ProgramCode = program.ProgramCode,
                ProgramName = program.ProgramName,
                ProgramCategory = program.Category,
                CyclePublicId = cycle.PublicId,
                ApplicationOpensAt = programCycle.ApplicationOpensAt,
                ApplicationClosesAt = programCycle.ApplicationClosesAt,
                TimeZoneId = programCycle.TimeZoneId,
            };

        return rows.AsNoTracking();
    }

    private async Task<IReadOnlyList<ApplicationView>> ToViewsAsync(
        IReadOnlyList<ApplicationRow> rows,
        CancellationToken cancellationToken)
    {
        List<long> applicationIds = rows.Select(row => row.ApplicationId).ToList();
        Dictionary<long, List<PreferenceInput>> preferencesByApplication =
            await this.LoadPreferencesAsync(applicationIds, cancellationToken);

        List<ApplicationView> views = rows.Select(row => ToView(row, preferencesByApplication)).ToList();

        return views;
    }

    private async Task<Dictionary<long, List<PreferenceInput>>> LoadPreferencesAsync(
        List<long> applicationIds,
        CancellationToken cancellationToken)
    {
        List<PreferenceRow> preferences = await (
            from preference in this.dbContext.ApplicationPreferences
            join programSpecialty in this.dbContext.ProgramSpecialties
                on preference.ProgramSpecialtyId equals programSpecialty.ProgramSpecialtyId
            join specialty in this.dbContext.Specialties on programSpecialty.SpecialtyId equals specialty.SpecialtyId
            where applicationIds.Contains(preference.ApplicationId)
            select new PreferenceRow
            {
                ApplicationPreferenceId = preference.ApplicationPreferenceId,
                ApplicationId = preference.ApplicationId,
                PreferenceOrder = preference.PreferenceOrder,
                SpecialtyPublicId = specialty.PublicId,
            })
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        List<long> preferenceIds = preferences.Select(preference => preference.ApplicationPreferenceId).ToList();

        List<SiteRow> sites = await (
            from site in this.dbContext.ApplicationPreferenceSites
            join specialtySite in this.dbContext.SpecialtySites on site.SpecialtySiteId equals specialtySite.SpecialtySiteId
            join trainingSite in this.dbContext.TrainingSites on specialtySite.SiteId equals trainingSite.SiteId
            where preferenceIds.Contains(site.ApplicationPreferenceId)
            select new SiteRow
            {
                ApplicationPreferenceId = site.ApplicationPreferenceId,
                SiteOrder = site.SiteOrder,
                SitePublicId = trainingSite.PublicId,
            })
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        ILookup<long, SiteRow> sitesByPreference = sites.ToLookup(site => site.ApplicationPreferenceId);

        Dictionary<long, List<PreferenceInput>> preferencesByApplication = preferences
            .OrderBy(preference => preference.PreferenceOrder)
            .GroupBy(preference => preference.ApplicationId)
            .ToDictionary(
                group => group.Key,
                group => group.Select(preference => ToPreferenceInput(preference, sitesByPreference)).ToList());

        return preferencesByApplication;
    }

    private static PreferenceInput ToPreferenceInput(PreferenceRow preference, ILookup<long, SiteRow> sitesByPreference)
    {
        List<TrainingSitePreferenceInput> sites = sitesByPreference[preference.ApplicationPreferenceId]
            .OrderBy(site => site.SiteOrder)
            .Select(site => new TrainingSitePreferenceInput(site.SitePublicId, site.SiteOrder))
            .ToList();

        return new PreferenceInput(preference.SpecialtyPublicId, preference.PreferenceOrder, sites);
    }

    private sealed class ApplicationRow
    {
        public long ApplicationId { get; init; }

        public Guid PublicId { get; init; }

        public required string ApplicationNumber { get; init; }

        public ApplicationStatus Status { get; init; }

        public DateTimeOffset CreatedAt { get; init; }

        public DateTimeOffset? SubmittedAt { get; init; }

        public int VersionNo { get; init; }

        public Guid ProgramPublicId { get; init; }

        public required string ProgramCode { get; init; }

        public required string ProgramName { get; init; }

        public ProgramCategory ProgramCategory { get; init; }

        public Guid CyclePublicId { get; init; }

        public DateTimeOffset? ApplicationOpensAt { get; init; }

        public DateTimeOffset? ApplicationClosesAt { get; init; }

        public required string TimeZoneId { get; init; }
    }

    private sealed class PreferenceRow
    {
        public long ApplicationPreferenceId { get; init; }

        public long ApplicationId { get; init; }

        public byte PreferenceOrder { get; init; }

        public Guid SpecialtyPublicId { get; init; }
    }

    private sealed class SiteRow
    {
        public long ApplicationPreferenceId { get; init; }

        public byte SiteOrder { get; init; }

        public Guid SitePublicId { get; init; }
    }
}
