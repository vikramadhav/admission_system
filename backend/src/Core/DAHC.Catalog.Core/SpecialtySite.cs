namespace DAHC.Catalog.Core;

/// <summary>
/// A training site offered for one program specialty (<c>cfg.SpecialtySite</c>).
/// </summary>
public sealed class SpecialtySite
{
    public int SpecialtySiteId { get; set; }

    public required int ProgramSpecialtyId { get; set; }

    public required int SiteId { get; set; }

    public bool IsActive { get; set; }
}
