namespace DAHC.Catalog.Core;

/// <summary>
/// A training site (<c>cfg.TrainingSite</c>), mapped to program specialties through <see cref="SpecialtySite"/>.
/// </summary>
public sealed class TrainingSite
{
    public int SiteId { get; set; }

    public required Guid PublicId { get; set; }

    public required string SiteCode { get; set; }

    public required string SiteName { get; set; }

    public bool IsActive { get; set; }
}
