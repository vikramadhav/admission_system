using DAHC.API.Responses;
using DAHC.Applications.Core;
using DAHC.Applications.Service;

namespace DAHC.API.Contracts;

/// <summary>
/// The contract's <c>CandidateDashboard</c>.
/// </summary>
public sealed record CandidateDashboardResponse(
    StartNewApplicationResponse StartNewApplication,
    IReadOnlyList<CandidateDashboardItemResponse> Items,
    PageMetadata Page)
{
    public static CandidateDashboardResponse From(CandidateDashboard dashboard)
    {
        ArgumentNullException.ThrowIfNull(dashboard);

        StartNewApplicationState startNew = dashboard.StartNewApplication;
        StartNewApplicationResponse startNewResponse = new(
            startNew.IsEnabled,
            startNew.DisabledReason,
            startNew.NextCycleOpensAt);

        List<CandidateDashboardItemResponse> items = dashboard.Applications.Items
            .Select(CandidateDashboardItemResponse.From)
            .ToList();

        PageMetadata page = new(dashboard.Applications.Limit, dashboard.Applications.NextCursor);

        return new CandidateDashboardResponse(startNewResponse, items, page);
    }
}

/// <summary>
/// Whether "Start New Application" is enabled, and why not (contract <c>startNewApplication</c>).
/// </summary>
public sealed record StartNewApplicationResponse(
    bool Enabled,
    StartNewDisabledReason? DisabledReason,
    DateTimeOffset? NextCycleOpensAt);

/// <summary>
/// One inbox item (contract <c>CandidateDashboardItem</c>): the application summary with its deadline and the
/// actions it allows now.
/// </summary>
public sealed record CandidateDashboardItemResponse
{
    public required Guid Id { get; init; }

    public required string ApplicationNumber { get; init; }

    public required ApplicationProgram Program { get; init; }

    public required ApplicationStatus Status { get; init; }

    public required DateTimeOffset CreatedAt { get; init; }

    public DateTimeOffset? SubmittedAt { get; init; }

    public required int Version { get; init; }

    public required IReadOnlyList<PreferenceInput> Preferences { get; init; }

    public DateTimeOffset? SubmissionDeadline { get; init; }

    public required IReadOnlyList<CandidateApplicationAction> AllowedActions { get; init; }

    public static CandidateDashboardItemResponse From(CandidateDashboardItem item)
    {
        ArgumentNullException.ThrowIfNull(item);

        ApplicationView application = item.Application;

        CandidateDashboardItemResponse response = new()
        {
            Id = application.Id,
            ApplicationNumber = application.ApplicationNumber,
            Program = application.Program,
            Status = application.Status,
            CreatedAt = application.CreatedAt,
            SubmittedAt = application.SubmittedAt,
            Version = application.Version,
            Preferences = application.Preferences,
            SubmissionDeadline = item.SubmissionDeadline,
            AllowedActions = item.AllowedActions,
        };

        return response;
    }
}
