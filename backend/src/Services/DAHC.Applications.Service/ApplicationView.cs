using DAHC.Applications.Core;

namespace DAHC.Applications.Service;

/// <summary>
/// An application as the candidate sees it (contract <c>Application</c> without the program-configured sections,
/// which wait for OQ-02).
/// </summary>
public sealed record ApplicationView
{
    public required Guid Id { get; init; }

    public required string ApplicationNumber { get; init; }

    public required ApplicationProgram Program { get; init; }

    public required ApplicationStatus Status { get; init; }

    public required DateTimeOffset CreatedAt { get; init; }

    public DateTimeOffset? SubmittedAt { get; init; }

    public required int Version { get; init; }

    public required IReadOnlyList<PreferenceInput> Preferences { get; init; }
}

/// <summary>
/// The program of an application, in the shape of the contract's <c>Program</c>.
/// </summary>
public sealed record ApplicationProgram(
    Guid Id,
    string Code,
    string Name,
    string Category,
    Guid CycleId,
    DateTimeOffset? ApplicationOpensAt,
    DateTimeOffset? ApplicationClosesAt,
    string TimeZoneId);
