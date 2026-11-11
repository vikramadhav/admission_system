using DAHC.Applications.Service;
using DAHC.Catalog.Core;
using DAHC.Data;
using DAHC.Data.Querying;
using Microsoft.EntityFrameworkCore;

namespace DAHC.Applications.Data;

/// <summary>
/// What a program offers for draft validation: the program cycle with its window and preference limit, and the
/// available specialties with their available sites.
/// </summary>
internal sealed record ProgramOffering(
    ProgramCycle ProgramCycle,
    short CycleStartYear,
    int MaxPreferences,
    IReadOnlyDictionary<Guid, OfferedSpecialty> Specialties)
{
    public static async Task<ProgramOffering?> LoadAsync(
        DahcDbContext dbContext,
        Guid cyclePublicId,
        Guid programPublicId,
        CancellationToken cancellationToken)
    {
        ProgramCycleRow? row = await (
            from programCycle in dbContext.ProgramCycles
            join program in dbContext.Programs on programCycle.ProgramId equals program.ProgramId
            join cycle in dbContext.AdmissionCycles on programCycle.CycleId equals cycle.CycleId
            where cycle.PublicId == cyclePublicId && program.PublicId == programPublicId
                && cycle.IsActive && program.IsActive
            select new ProgramCycleRow
            {
                ProgramCycle = programCycle,
                StartDate = cycle.StartDate,
                MaxPreferences = program.MaxPreferences,
            })
            .AsNoTracking()
            .FirstOrDefaultAsync(cancellationToken);

        return await CompleteAsync(dbContext, row, cancellationToken);
    }

    public static async Task<ProgramOffering?> LoadAsync(
        DahcDbContext dbContext,
        int programCycleId,
        CancellationToken cancellationToken)
    {
        ProgramCycleRow? row = await (
            from programCycle in dbContext.ProgramCycles
            join program in dbContext.Programs on programCycle.ProgramId equals program.ProgramId
            join cycle in dbContext.AdmissionCycles on programCycle.CycleId equals cycle.CycleId
            where programCycle.ProgramCycleId == programCycleId
            select new ProgramCycleRow
            {
                ProgramCycle = programCycle,
                StartDate = cycle.StartDate,
                MaxPreferences = program.MaxPreferences,
            })
            .AsNoTracking()
            .FirstOrDefaultAsync(cancellationToken);

        return await CompleteAsync(dbContext, row, cancellationToken);
    }

    private static async Task<ProgramOffering?> CompleteAsync(
        DahcDbContext dbContext,
        ProgramCycleRow? row,
        CancellationToken cancellationToken)
    {
        if (row is null)
        {
            return null;
        }

        int programId = row.ProgramCycle.ProgramId;
        IQueryable<ProgramSpecialty> availableProgramSpecialties =
            CatalogAvailability.AvailableProgramSpecialties(dbContext);
        IQueryable<SpecialtySite> availableSpecialtySites = CatalogAvailability.AvailableSpecialtySites(dbContext);

        List<OfferedSiteRow> offeredSites = await (
            from programSpecialty in availableProgramSpecialties
            join specialty in dbContext.Specialties on programSpecialty.SpecialtyId equals specialty.SpecialtyId
            join specialtySite in availableSpecialtySites
                on programSpecialty.ProgramSpecialtyId equals specialtySite.ProgramSpecialtyId
            join site in dbContext.TrainingSites on specialtySite.SiteId equals site.SiteId
            where programSpecialty.ProgramId == programId
            select new OfferedSiteRow
            {
                SpecialtyPublicId = specialty.PublicId,
                ProgramSpecialtyId = programSpecialty.ProgramSpecialtyId,
                SitePublicId = site.PublicId,
                SpecialtySiteId = specialtySite.SpecialtySiteId,
            })
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        Dictionary<Guid, OfferedSpecialty> specialties = offeredSites
            .GroupBy(offered => offered.SpecialtyPublicId)
            .ToDictionary(
                group => group.Key,
                group => new OfferedSpecialty(
                    group.First().ProgramSpecialtyId,
                    group.ToDictionary(offered => offered.SitePublicId, offered => offered.SpecialtySiteId)));

        short cycleStartYear = (short)row.StartDate.Year;

        return new ProgramOffering(row.ProgramCycle, cycleStartYear, row.MaxPreferences, specialties);
    }

    private sealed class ProgramCycleRow
    {
        public required ProgramCycle ProgramCycle { get; init; }

        public DateOnly StartDate { get; init; }

        public byte MaxPreferences { get; init; }
    }

    private sealed class OfferedSiteRow
    {
        public Guid SpecialtyPublicId { get; init; }

        public int ProgramSpecialtyId { get; init; }

        public Guid SitePublicId { get; init; }

        public int SpecialtySiteId { get; init; }
    }
}
