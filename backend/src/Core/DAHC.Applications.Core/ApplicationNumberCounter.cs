namespace DAHC.Applications.Core;

/// <summary>
/// The per-cycle counter behind application numbers (<c>app.ApplicationNumberCounter</c>, D-19). It is only ever
/// advanced by one atomic database statement, never read-modify-written through the change tracker.
/// </summary>
public sealed class ApplicationNumberCounter
{
    public required int AdmissionCycleId { get; set; }

    public required short CycleStartYear { get; set; }

    public int LastValue { get; set; }
}
