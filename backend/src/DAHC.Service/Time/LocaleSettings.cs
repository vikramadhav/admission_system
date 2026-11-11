namespace DAHC.Service.Time;

/// <summary>
/// Default IANA time zone and culture, and the supported cultures (standard s.30).
/// </summary>
public sealed record LocaleSettings(
    string DefaultTimeZoneId,
    string DefaultCulture,
    IReadOnlyList<string> SupportedCultures);
