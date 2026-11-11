using System.ComponentModel.DataAnnotations;

namespace DAHC.API.Configuration;

/// <summary>
/// IDAM settings for this environment (standard s.15). No default points at a real environment; the API client
/// secret comes from user secrets locally and the secret store when deployed.
/// </summary>
public sealed class IdamOptions
{
    public const string SectionName = "Idam";

    [Required]
    [Url]
    public string Authority { get; set; } = string.Empty;

    /// <summary>
    /// The per-definition metadata document; IDAM does not publish <c>/.well-known/openid-configuration</c>.
    /// </summary>
    [Required]
    [Url]
    public string MetadataAddress { get; set; } = string.Empty;

    /// <summary>
    /// Compared exactly with the token's issuer, including any trailing slash or port.
    /// </summary>
    [Required]
    public string Issuer { get; set; } = string.Empty;

    [Required]
    public string ApiClientId { get; set; } = string.Empty;

    public string? ApiClientSecret { get; set; }

    [Required]
    public string WebClientId { get; set; } = string.Empty;

    [Range(1, 300)]
    public int IntrospectionCacheMaxSeconds { get; set; } = 60;

    /// <summary>
    /// Which UserInfo fields carry the profile attributes (<c>Idam:UserInfoClaims</c>).
    /// </summary>
    public IdamUserInfoClaimOptions UserInfoClaims { get; set; } = new();

    /// <summary>
    /// The metadata document's path relative to <see cref="Authority"/>.
    /// </summary>
    public string MetadataPath => this.MetadataAddress[this.Authority.Length..];
}
