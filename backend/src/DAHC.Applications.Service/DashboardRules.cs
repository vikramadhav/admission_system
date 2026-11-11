using DAHC.Applications.Core;

namespace DAHC.Applications.Service;

/// <summary>
/// Dashboard rules of US-1.2.1: when a new application may be started, and which actions an application allows.
/// </summary>
public static class DashboardRules
{
    /// <summary>
    /// "Start New Application" is enabled while some cycle has an open program in which the candidate has no
    /// active application (business rule 1: one active application per cycle).
    /// </summary>
    public static StartNewApplicationState EvaluateStartNew(
        IReadOnlyCollection<int> cyclesWithOpenProgram,
        IReadOnlyCollection<int> cyclesWithActiveApplication,
        DateTimeOffset? nextOpeningAt)
    {
        ArgumentNullException.ThrowIfNull(cyclesWithOpenProgram);
        ArgumentNullException.ThrowIfNull(cyclesWithActiveApplication);

        if (cyclesWithOpenProgram.Count == 0)
        {
            return new StartNewApplicationState(false, StartNewDisabledReason.NoOpenProgram, nextOpeningAt);
        }

        bool hasCycleWithoutActiveApplication = cyclesWithOpenProgram
            .Any(cycleId => !cyclesWithActiveApplication.Contains(cycleId));

        if (!hasCycleWithoutActiveApplication)
        {
            return new StartNewApplicationState(false, StartNewDisabledReason.ActiveApplicationExists, null);
        }

        return new StartNewApplicationState(true, null, null);
    }

    public static IReadOnlyList<CandidateApplicationAction> AllowedActions(ApplicationStatus status)
    {
        if (status == ApplicationStatus.Draft)
        {
            return [CandidateApplicationAction.View, CandidateApplicationAction.Resume];
        }

        return [CandidateApplicationAction.View];
    }
}
