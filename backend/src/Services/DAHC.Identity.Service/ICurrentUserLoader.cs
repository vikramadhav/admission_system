using DAHC.Service.Access;

namespace DAHC.Identity.Service;

/// <summary>
/// Loads the local user and roles for a validated token on every request, so a deactivation or role change takes
/// effect on the next request. The user is matched on the validated issuer and subject together (AP-04).
/// </summary>
public interface ICurrentUserLoader
{
    Task<CurrentUserLoadResult> LoadAsync(IdamIdentity identity, CancellationToken cancellationToken);
}
