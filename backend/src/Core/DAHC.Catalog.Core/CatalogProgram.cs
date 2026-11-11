namespace DAHC.Catalog.Core;

/// <summary>
/// A GME program (<c>cfg.Program</c>). Named <c>CatalogProgram</c> so it never collides with the host's
/// <c>Program</c> class.
/// </summary>
public sealed class CatalogProgram
{
    public int ProgramId { get; set; }

    public required Guid PublicId { get; set; }

    public required string ProgramCode { get; set; }

    public required string ProgramName { get; set; }

    public required ProgramCategory Category { get; set; }

    public required string DisciplineCode { get; set; }

    /// <summary>
    /// How many specialty preferences a candidate may choose: 1 or 2 (US-1.3.1 notes 3-4).
    /// </summary>
    public required byte MaxPreferences { get; set; }

    public bool IsActive { get; set; }
}
