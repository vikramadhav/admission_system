namespace DAHC.Catalog.Core;

/// <summary>
/// An admission cycle (<c>cfg.AdmissionCycle</c>). The year of <see cref="StartDate"/> prefixes every application
/// number of the cycle (D-19).
/// </summary>
public sealed class AdmissionCycle
{
    public int CycleId { get; set; }

    public required Guid PublicId { get; set; }

    public required string CycleCode { get; set; }

    public required DateOnly StartDate { get; set; }

    public required DateOnly EndDate { get; set; }

    public bool IsActive { get; set; }
}
