namespace DAHC.Catalog.Core;

/// <summary>
/// A specialty (<c>cfg.Specialty</c>), offered by programs through <see cref="ProgramSpecialty"/>.
/// </summary>
public sealed class Specialty
{
    public int SpecialtyId { get; set; }

    public required Guid PublicId { get; set; }

    public required string SpecialtyCode { get; set; }

    public required string SpecialtyName { get; set; }

    public bool IsActive { get; set; }
}
