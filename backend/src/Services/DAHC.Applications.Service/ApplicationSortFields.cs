namespace DAHC.Applications.Service;

/// <summary>
/// The allow-listed sort fields of the candidate's application lists.
/// </summary>
public static class ApplicationSortFields
{
    public const string CreatedAt = "createdAt";

    public const string SubmittedAt = "submittedAt";

    public const string DefaultSort = "-createdAt";

    public static IReadOnlyList<string> All { get; } = [CreatedAt, SubmittedAt];
}
