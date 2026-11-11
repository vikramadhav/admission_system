namespace DAHC.Applications.Core;

/// <summary>
/// A candidate's application (<c>app.Application</c>). Named <c>CandidateApplication</c> so it never collides with
/// the module name.
/// </summary>
public sealed class CandidateApplication
{
    private readonly List<ApplicationPreference> preferences = [];

    public long ApplicationId { get; set; }

    public required Guid PublicId { get; set; }

    /// <summary>
    /// <c>&lt;cycle start year&gt;&lt;7-digit counter&gt;</c>, the "Application ID" shown to people (D-19).
    /// </summary>
    public required string ApplicationNumber { get; set; }

    public required long CandidateId { get; set; }

    /// <summary>
    /// Copied from the program cycle so the one-active-application-per-cycle rule can be a unique index.
    /// </summary>
    public required int AdmissionCycleId { get; set; }

    public required int ProgramCycleId { get; set; }

    public ApplicationStatus Status { get; set; } = ApplicationStatus.Draft;

    /// <summary>
    /// The resource version used as the ETag; increases with every save.
    /// </summary>
    public int VersionNo { get; set; } = 1;

    public required DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset? LastSavedAt { get; set; }

    public DateTimeOffset? SubmittedAt { get; set; }

    public IReadOnlyCollection<ApplicationPreference> Preferences => this.preferences;

    public bool IsEditable => this.Status == ApplicationStatus.Draft;

    /// <summary>
    /// Withdrawn and archived applications no longer block a new application in the same cycle (US-1.2.1).
    /// </summary>
    public static bool IsActiveStatus(ApplicationStatus status)
    {
        return status is not ApplicationStatus.Withdrawn and not ApplicationStatus.Archived;
    }

    public void ReplacePreferences(IReadOnlyList<ApplicationPreference> newPreferences)
    {
        ArgumentNullException.ThrowIfNull(newPreferences);

        this.preferences.Clear();
        this.preferences.AddRange(newPreferences);
    }

    public void RecordSave(DateTimeOffset savedAt)
    {
        this.VersionNo++;
        this.LastSavedAt = savedAt;
    }
}
