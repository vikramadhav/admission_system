using Serilog.Core;
using Serilog.Events;

namespace DAHC.Logging;

/// <summary>
/// Adds the machine name to every entry (standard s.13).
/// </summary>
internal sealed class MachineNameEnricher : ILogEventEnricher
{
    private readonly LogEventProperty machineName = new("MachineName", new ScalarValue(Environment.MachineName));

    public void Enrich(LogEvent logEvent, ILogEventPropertyFactory propertyFactory)
    {
        ArgumentNullException.ThrowIfNull(logEvent);

        logEvent.AddPropertyIfAbsent(this.machineName);
    }
}
