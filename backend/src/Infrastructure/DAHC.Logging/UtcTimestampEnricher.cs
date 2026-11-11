using Serilog.Core;
using Serilog.Events;

namespace DAHC.Logging;

/// <summary>
/// Adds the event time in UTC, so file entries never show server-local time.
/// </summary>
internal sealed class UtcTimestampEnricher : ILogEventEnricher
{
    public void Enrich(LogEvent logEvent, ILogEventPropertyFactory propertyFactory)
    {
        ArgumentNullException.ThrowIfNull(logEvent);
        ArgumentNullException.ThrowIfNull(propertyFactory);

        LogEventProperty property = propertyFactory.CreateProperty("UtcTimestamp", logEvent.Timestamp.UtcDateTime);

        logEvent.AddPropertyIfAbsent(property);
    }
}
