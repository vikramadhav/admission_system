using DAHC.Catalog.Core;

namespace DAHC.Data.Querying;

/// <summary>
/// The one definition of an available catalog item (US-1.3.1 AC2, AC5), shared by catalog discovery and draft
/// validation: an active program specialty of an active specialty with at least one active specialty site at an
/// active training site.
/// </summary>
public static class CatalogAvailability
{
    public static IQueryable<ProgramSpecialty> AvailableProgramSpecialties(DahcDbContext dbContext)
    {
        ArgumentNullException.ThrowIfNull(dbContext);

        IQueryable<SpecialtySite> availableSpecialtySites = AvailableSpecialtySites(dbContext);
        IQueryable<Specialty> activeSpecialties = dbContext.Specialties.Where(specialty => specialty.IsActive);

        return dbContext.ProgramSpecialties
            .Where(programSpecialty => programSpecialty.IsActive
                && activeSpecialties.Any(specialty => specialty.SpecialtyId == programSpecialty.SpecialtyId)
                && availableSpecialtySites.Any(
                    specialtySite => specialtySite.ProgramSpecialtyId == programSpecialty.ProgramSpecialtyId));
    }

    public static IQueryable<SpecialtySite> AvailableSpecialtySites(DahcDbContext dbContext)
    {
        ArgumentNullException.ThrowIfNull(dbContext);

        IQueryable<TrainingSite> activeSites = dbContext.TrainingSites.Where(site => site.IsActive);

        return dbContext.SpecialtySites
            .Where(specialtySite => specialtySite.IsActive
                && activeSites.Any(site => site.SiteId == specialtySite.SiteId));
    }
}
