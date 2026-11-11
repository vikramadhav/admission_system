using DAHC.API.Configuration;
using Duende.IdentityModel.Client;

namespace DAHC.API.Authentication.Idam;

/// <summary>
/// IDAM publishes its metadata per OIDC definition, not at <c>/.well-known/openid-configuration</c>, so endpoints
/// are read from the configured metadata address and never hard-coded.
/// </summary>
public static class IdamDiscoveryPolicy
{
    public static DiscoveryPolicy Create(IdamOptions idam)
    {
        ArgumentNullException.ThrowIfNull(idam);

        DiscoveryPolicy policy = new()
        {
            DiscoveryDocumentPath = idam.MetadataPath,
            RequireHttps = true,
        };

        return policy;
    }
}
