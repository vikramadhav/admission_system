namespace DAHC.Service.Time;

/// <summary>
/// The one conversion between UTC instants and local calendar values. Computation, comparison and storage
/// always use UTC; this service is used only where a business rule is defined in local terms.
/// </summary>
public sealed class LocalTimeService
{
    private readonly TimeProvider timeProvider;

    private readonly TimeZoneInfo defaultTimeZone;

    public LocalTimeService(TimeProvider timeProvider, LocaleSettings localeSettings)
    {
        ArgumentNullException.ThrowIfNull(timeProvider);
        ArgumentNullException.ThrowIfNull(localeSettings);

        this.timeProvider = timeProvider;
        this.defaultTimeZone = TimeZoneInfo.FindSystemTimeZoneById(localeSettings.DefaultTimeZoneId);
    }

    /// <summary>
    /// The calendar date of the instant in the given IANA time zone, or in the default zone when none is given
    /// or the id is unknown.
    /// </summary>
    public DateOnly GetLocalDate(DateTimeOffset instant, string? timeZoneId)
    {
        TimeZoneInfo timeZone = this.ResolveTimeZone(timeZoneId);
        DateTimeOffset localTime = TimeZoneInfo.ConvertTime(instant, timeZone);

        return DateOnly.FromDateTime(localTime.DateTime);
    }

    /// <summary>
    /// Today's date in the given IANA time zone (or the default zone).
    /// </summary>
    public DateOnly GetToday(string? timeZoneId)
    {
        DateTimeOffset now = this.timeProvider.GetUtcNow();

        return this.GetLocalDate(now, timeZoneId);
    }

    private TimeZoneInfo ResolveTimeZone(string? timeZoneId)
    {
        if (string.IsNullOrWhiteSpace(timeZoneId))
        {
            return this.defaultTimeZone;
        }

        bool isKnown = TimeZoneInfo.TryFindSystemTimeZoneById(timeZoneId, out TimeZoneInfo? timeZone);

        if (!isKnown
            || timeZone is null)
        {
            return this.defaultTimeZone;
        }

        return timeZone;
    }
}
