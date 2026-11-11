namespace DAHC.Identity.Service;

/// <summary>
/// Loads the local user and roles for a validated token on every request, so a deactivation or role change takes
/// effect on the next request.
/// </summary>
public interface ICurrentUserLoader
{
    Task<CurrentUserLoadResult> LoadAsync(string idamUserId, CancellationToken cancellationToken);
}
