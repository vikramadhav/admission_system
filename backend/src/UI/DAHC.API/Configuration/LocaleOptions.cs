using System.ComponentModel.DataAnnotations;
using DAHC.Service.Time;

namespace DAHC.API.Configuration;

/// <summary>
/// Default time zone and cultures (standard s.30: <c>Asia/Dubai</c>; <c>en-AE</c> default, <c>ar-AE</c>).
/// </summary>
public sealed class LocaleOptions
{
    public const string SectionName = "Locale";

    [Required]
    public string DefaultTimeZoneId { get; set; } = string.Empty;

    [Required]
    public string DefaultCulture { get; set; } = string.Empty;

    [Required]
    [MinLength(1)]
    public string[] SupportedCultures { get; set; } = [];

    public bool IsConsistent()
    {
        bool isKnownTimeZone = TimeZoneInfo.TryFindSystemTimeZoneById(this.DefaultTimeZoneId, out _);
        bool isDefaultSupported = this.SupportedCultures.Contains(this.DefaultCulture, StringComparer.Ordinal);

        return isKnownTimeZone && isDefaultSupported;
    }

    public LocaleSettings ToSettings()
    {
        return new LocaleSettings(this.DefaultTimeZoneId, this.DefaultCulture, this.SupportedCultures);
    }
}
