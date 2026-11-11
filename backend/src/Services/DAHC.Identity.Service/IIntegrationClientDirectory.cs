namespace DAHC.Identity.Service;

/// <summary>
/// Looks up the internal integration client records used to classify tokens issued to third-party middleware.
/// </summary>
public interface IIntegrationClientDirectory
{
    Task<bool> IsActiveIntegrationClientAsync(string idamClientId, CancellationToken cancellationToken);
}
