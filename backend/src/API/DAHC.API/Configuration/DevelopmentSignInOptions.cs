using System.ComponentModel.DataAnnotations;

namespace DAHC.API.Configuration;

/// <summary>
/// The Development-only local sign-in (standard s.15). The signing key and password come from user secrets.
/// Startup outside Development fails if any of this is enabled or configured.
/// </summary>
public sealed class DevelopmentSignInOptions
{
    public const string SectionName = "DevelopmentSignIn";

    public const int MinSigningKeyLength = 32;

    public bool Enabled { get; set; }

    public string Issuer { get; set; } = "dahc-development";

    public string Audience { get; set; } = "dahc-api";

    public string? SigningKey { get; set; }

    public string? Password { get; set; }

    [Range(1, 60)]
    public int TokenLifetimeMinutes { get; set; } = 15;
}
