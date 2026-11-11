namespace DAHC.Applications.Service;

/// <summary>
/// Allocates the next application number of a cycle with one atomic database statement (D-19). A separate
/// boundary because that statement is SQL Server specific and the in-memory test provider cannot run it.
/// </summary>
public interface IApplicationNumberAllocator
{
    Task<string> AllocateAsync(
        int admissionCycleId,
        short cycleStartYear,
        CancellationToken cancellationToken);
}
