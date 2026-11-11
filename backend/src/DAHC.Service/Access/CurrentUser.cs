namespace DAHC.Service.Access;

/// <summary>
/// The active local user behind the current request, loaded from the DAHC database on every request.
/// <see cref="InternalId"/> is the database key and never leaves the server.
/// </summary>
public sealed record CurrentUser
{
    public required UserType UserType { get; init; }

    public required Guid PublicId { get; init; }

    public required long InternalId { get; init; }

    public string? CandidateNumber { get; init; }

    public required string DisplayName { get; init; }

    public string? Email { get; init; }

    public required IReadOnlyList<string> Roles { get; init; }

    /// <summary>
    /// The only role used for authorization (standard s.15); always one of <see cref="Roles"/>.
    /// </summary>
    public required string ActiveRole { get; init; }

    public required string Culture { get; init; }

    public required string TimeZoneId { get; init; }

    /// <summary>
    /// For staff: the same person's candidate record (D-14), whose records they may never act on.
    /// </summary>
    public Guid? LinkedCandidatePublicId { get; init; }
}
