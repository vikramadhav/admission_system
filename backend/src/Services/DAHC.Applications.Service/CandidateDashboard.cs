using DAHC.Service.Paging;

namespace DAHC.Applications.Service;

/// <summary>
/// The candidate dashboard (US-1.2.1): whether a new application can be started, and the candidate's own
/// applications with the actions each allows now.
/// </summary>
public sealed record CandidateDashboard(
    StartNewApplicationState StartNewApplication,
    Page<CandidateDashboardItem> Applications);

/// <summary>
/// Whether "Start New Application" is enabled and, if not, why (US-1.2.1 AC4-AC6).
/// </summary>
public sealed record StartNewApplicationState(
    bool IsEnabled,
    StartNewDisabledReason? DisabledReason,
    DateTimeOffset? NextCycleOpensAt);

/// <summary>
/// One application in the dashboard inbox.
/// </summary>
public sealed record CandidateDashboardItem(
    ApplicationView Application,
    DateTimeOffset? SubmissionDeadline,
    IReadOnlyList<CandidateApplicationAction> AllowedActions);
