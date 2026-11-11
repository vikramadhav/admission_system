namespace DAHC.Service.Access;

/// <summary>
/// Who a validated access token represents (standard s.15, third-party integrations).
/// </summary>
public enum TokenKind
{
    User,
    IntegrationOnly,
    UserViaIntegration,
}
