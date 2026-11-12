namespace DAHC.Identity.Core;

/// <summary>
/// A registered third-party middleware (<c>idn.IntegrationClient</c>), matched by its IDAM client id.
/// Managed by Administrators; never created automatically.
/// </summary>
public sealed class IntegrationClient
{
    public int IntegrationClientId { get; set; }

    public required Guid PublicId { get; set; }

    public required string IdamClientId { get; set; }

    public required string Name { get; set; }

    public bool IsActive { get; set; }

    public required DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset? UpdatedAt { get; set; }
}
