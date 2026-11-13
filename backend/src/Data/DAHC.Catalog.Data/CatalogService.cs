using System.Linq.Expressions;
using DAHC.Catalog.Core;
using DAHC.Catalog.Service;
using DAHC.Data;
using DAHC.Data.Querying;
using DAHC.Service.Paging;
using DAHC.Service.Results;
using Microsoft.EntityFrameworkCore;

namespace DAHC.Catalog.Data;

/// <summary>
/// Read-only catalog discovery (US-1.3.1). "Available" means active and configured all the way down: an active
/// program specialty of an active specialty with at least one active site at an active training site.
/// </summary>
internal sealed class CatalogService : ICatalogService
{
    private static readonly IReadOnlyDictionary<string, Expression<Func<ProgramRow, object?>>> programSorts =
        new Dictionary<string, Expression<Func<ProgramRow, object?>>>
        {
            [CatalogSortFields.Name] = row => row.Name,
            [CatalogSortFields.Code] = row => row.Code,
            [CatalogSortFields.ApplicationOpensAt] = row => row.ApplicationOpensAt,
        };

    private static readonly IReadOnlyDictionary<string, Expression<Func<CatalogRow, object?>>> catalogSorts =
        new Dictionary<string, Expression<Func<CatalogRow, object?>>>
        {
            [CatalogSortFields.Name] = row => row.Name,
            [CatalogSortFields.Code] = row => row.Code,
        };

    private readonly DahcDbContext dbContext;

    public CatalogService(DahcDbContext dbContext)
    {
        this.dbContext = dbContext;
    }

    public async Task<Result<Page<ProgramItem>>> ListProgramsAsync(
        Guid cycleId,
        PageQuery pageQuery,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(pageQuery);

        Result<IReadOnlyList<SortKey>> sort = SortParser.Parse(
            pageQuery.Sort,
            CatalogSortFields.Name,
            CatalogSortFields.Programs);

        if (!sort.IsSuccess)
        {
            return sort.ToFailure<Page<ProgramItem>>();
        }

        try
        {
            IQueryable<ProgramSpecialty> availableProgramSpecialties =
                CatalogAvailability.AvailableProgramSpecialties(this.dbContext);

            IQueryable<ProgramRow> rows =
                from programCycle in this.dbContext.ProgramCycles
                join program in this.dbContext.Programs on programCycle.ProgramId equals program.ProgramId
                join cycle in this.dbContext.AdmissionCycles on programCycle.CycleId equals cycle.CycleId
                where cycle.PublicId == cycleId
                    && cycle.IsActive
                    && programCycle.IsActive
                    && program.IsActive
                    && availableProgramSpecialties.Any(
                        programSpecialty => programSpecialty.ProgramId == program.ProgramId)
                select new ProgramRow
                {
                    ProgramId = program.ProgramId,
                    PublicId = program.PublicId,
                    Code = program.ProgramCode,
                    Name = program.ProgramName,
                    Category = program.Category,
                    CycleId = cycle.PublicId,
                    ApplicationOpensAt = programCycle.ApplicationOpensAt,
                    ApplicationClosesAt = programCycle.ApplicationClosesAt,
                    TimeZoneId = programCycle.TimeZoneId,
                };

            string context = $"programs|{cycleId:N}|{SortParser.Describe(sort.Value)}";
            Result<Page<ProgramRow>> page = await rows
                .AsNoTracking()
                .OrderBySortKeys(sort.Value, programSorts, row => row.ProgramId)
                .ReadPageAsync(pageQuery, context, cancellationToken);

            if (!page.IsSuccess)
            {
                return page.ToFailure<Page<ProgramItem>>();
            }

            return Result.Success(page.Value.Map(ToProgramItem));
        }
        catch (Exception exception) when (DahcDataException.IsDatabaseFailure(exception))
        {
            throw new DahcDataException("CatalogService.ListProgramsAsync", exception);
        }
    }

    public async Task<Result<Page<SpecialtyItem>>> ListSpecialtiesAsync(
        Guid programId,
        PageQuery pageQuery,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(pageQuery);

        Result<IReadOnlyList<SortKey>> sort = ParseCatalogSort(pageQuery);

        if (!sort.IsSuccess)
        {
            return sort.ToFailure<Page<SpecialtyItem>>();
        }

        try
        {
            bool isVisible = await this.dbContext.Programs
                .AnyAsync(program => program.PublicId == programId && program.IsActive, cancellationToken);

            if (!isVisible)
            {
                return Result.NotFound<Page<SpecialtyItem>>();
            }

            IQueryable<ProgramSpecialty> availableProgramSpecialties =

                CatalogAvailability.AvailableProgramSpecialties(this.dbContext);

            IQueryable<CatalogRow> rows =
                from programSpecialty in availableProgramSpecialties
                join program in this.dbContext.Programs on programSpecialty.ProgramId equals program.ProgramId
                join specialty in this.dbContext.Specialties on programSpecialty.SpecialtyId equals specialty.SpecialtyId
                where program.PublicId == programId
                select new CatalogRow
                {
                    InternalId = specialty.SpecialtyId,
                    PublicId = specialty.PublicId,
                    Code = specialty.SpecialtyCode,
                    Name = specialty.SpecialtyName,
                };

            string context = $"specialties|{programId:N}|{SortParser.Describe(sort.Value)}";
            Result<Page<CatalogRow>> page = await rows
                .AsNoTracking()
                .OrderBySortKeys(sort.Value, catalogSorts, row => row.InternalId)
                .ReadPageAsync(pageQuery, context, cancellationToken);

            if (!page.IsSuccess)
            {
                return page.ToFailure<Page<SpecialtyItem>>();
            }

            return Result.Success(page.Value.Map(row => new SpecialtyItem(row.PublicId, row.Code, row.Name)));
        }
        catch (Exception exception) when (DahcDataException.IsDatabaseFailure(exception))
        {
            throw new DahcDataException("CatalogService.ListSpecialtiesAsync", exception);
        }
    }

    public async Task<Result<Page<TrainingSiteItem>>> ListTrainingSitesAsync(
        Guid specialtyId,
        PageQuery pageQuery,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(pageQuery);

        Result<IReadOnlyList<SortKey>> sort = ParseCatalogSort(pageQuery);

        if (!sort.IsSuccess)
        {
            return sort.ToFailure<Page<TrainingSiteItem>>();
        }

        try
        {
            bool isVisible = await this.dbContext.Specialties
                .AnyAsync(specialty => specialty.PublicId == specialtyId && specialty.IsActive, cancellationToken);

            if (!isVisible)
            {
                return Result.NotFound<Page<TrainingSiteItem>>();
            }

            IQueryable<CatalogRow> rows = this.AvailableSitesOfSpecialty(specialtyId);

            string context = $"sites|{specialtyId:N}|{SortParser.Describe(sort.Value)}";
            Result<Page<CatalogRow>> page = await rows
                .AsNoTracking()
                .OrderBySortKeys(sort.Value, catalogSorts, row => row.InternalId)
                .ReadPageAsync(pageQuery, context, cancellationToken);

            if (!page.IsSuccess)
            {
                return page.ToFailure<Page<TrainingSiteItem>>();
            }

            return Result.Success(page.Value.Map(row => new TrainingSiteItem(row.PublicId, row.Code, row.Name)));
        }
        catch (Exception exception) when (DahcDataException.IsDatabaseFailure(exception))
        {
            throw new DahcDataException("CatalogService.ListTrainingSitesAsync", exception);
        }
    }

    private static Result<IReadOnlyList<SortKey>> ParseCatalogSort(PageQuery pageQuery)
    {
        return SortParser.Parse(pageQuery.Sort, CatalogSortFields.Name, CatalogSortFields.SpecialtiesAndSites);
    }

    private static ProgramItem ToProgramItem(ProgramRow row)
    {
        ProgramItem item = new(
            row.PublicId,
            row.Code,
            row.Name,
            row.Category,
            row.CycleId,
            row.ApplicationOpensAt,
            row.ApplicationClosesAt,
            row.TimeZoneId);

        return item;
    }

    /// <summary>
    /// The contract addresses sites by specialty only, so a specialty offered by several programs lists the
    /// active sites of all of them (raised as an open question).
    /// </summary>
    private IQueryable<CatalogRow> AvailableSitesOfSpecialty(Guid specialtyId)
    {
        IQueryable<ProgramSpecialty> availableProgramSpecialties =
            CatalogAvailability.AvailableProgramSpecialties(this.dbContext);
        IQueryable<SpecialtySite> availableSpecialtySites =
            CatalogAvailability.AvailableSpecialtySites(this.dbContext);
        IQueryable<CatalogProgram> activePrograms = this.dbContext.Programs.Where(program => program.IsActive);
        IQueryable<Specialty> requestedSpecialty = this.dbContext.Specialties
            .Where(specialty => specialty.PublicId == specialtyId);

        IQueryable<CatalogRow> rows = this.dbContext.TrainingSites
            .Where(site => availableSpecialtySites.Any(
                specialtySite => specialtySite.SiteId == site.SiteId
                    && availableProgramSpecialties.Any(
                        programSpecialty => programSpecialty.ProgramSpecialtyId == specialtySite.ProgramSpecialtyId
                            && activePrograms.Any(program => program.ProgramId == programSpecialty.ProgramId)
                            && requestedSpecialty.Any(
                                specialty => specialty.SpecialtyId == programSpecialty.SpecialtyId))))
            .Select(site => new CatalogRow
            {
                InternalId = site.SiteId,
                PublicId = site.PublicId,
                Code = site.SiteCode,
                Name = site.SiteName,
            });

        return rows;
    }

    private sealed class ProgramRow
    {
        public int ProgramId { get; init; }

        public Guid PublicId { get; init; }

        public required string Code { get; init; }

        public required string Name { get; init; }

        public ProgramCategory Category { get; init; }

        public Guid CycleId { get; init; }

        public DateTimeOffset? ApplicationOpensAt { get; init; }

        public DateTimeOffset? ApplicationClosesAt { get; init; }

        public required string TimeZoneId { get; init; }
    }

    private sealed class CatalogRow
    {
        public int InternalId { get; init; }

        public Guid PublicId { get; init; }

        public required string Code { get; init; }

        public required string Name { get; init; }
    }
}
