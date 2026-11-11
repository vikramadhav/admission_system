namespace DAHC.Catalog.Core;

/// <summary>
/// A specialty offered by a program (<c>cfg.ProgramSpecialty</c>).
/// </summary>
public sealed class ProgramSpecialty
{
    public int ProgramSpecialtyId { get; set; }

    public required int ProgramId { get; set; }

    public required int SpecialtyId { get; set; }

    public bool IsActive { get; set; }
}
