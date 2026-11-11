namespace DAHC.Applications.Service;

/// <summary>
/// Why "Start New Application" is disabled (contract <c>startNewApplication.disabledReason</c>).
/// </summary>
public enum StartNewDisabledReason
{
    ActiveApplicationExists,
    NoOpenProgram,
}
