namespace DAHC.Applications.Service;

/// <summary>
/// Create a draft for the signed-in candidate (US-1.3.1 AC12). The candidate comes from the request's access
/// context, never from the command.
/// </summary>
public sealed record CreateDraftCommand(
    Guid CycleId,
    Guid ProgramId,
    IReadOnlyList<PreferenceInput> Preferences,
    string IdempotencyKey);

/// <summary>
/// Save changes to a draft (US-1.3.11 core save). <see cref="ExpectedVersion"/> comes from <c>If-Match</c>.
/// </summary>
public sealed record UpdateDraftCommand(
    Guid ApplicationId,
    int ExpectedVersion,
    IReadOnlyList<PreferenceInput> Preferences);
