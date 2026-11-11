namespace DAHC.Service.Access;

/// <summary>
/// What the API knows about the caller of the current request after token validation and the local user lookup.
/// </summary>
public enum AccessStatus
{
    Anonymous,
    Active,
    NotRegistered,
    Deactivated,
    NoRole,
    IntegrationNotPermitted,
}
