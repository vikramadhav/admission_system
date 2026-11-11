using System.Globalization;

namespace DAHC.Applications.Service;

/// <summary>
/// Application numbers are <c>&lt;cycle start year&gt;&lt;7-digit counter&gt;</c>, for example
/// <c>20270000001</c>; the counter restarts each cycle (D-19).
/// </summary>
public static class ApplicationNumberFormat
{
    public const int MaxCounter = 9_999_999;

    public static string Format(short cycleStartYear, int counter)
    {
        ArgumentOutOfRangeException.ThrowIfLessThan(cycleStartYear, (short)1000);
        ArgumentOutOfRangeException.ThrowIfGreaterThan(cycleStartYear, (short)9999);
        ArgumentOutOfRangeException.ThrowIfLessThan(counter, 1);
        ArgumentOutOfRangeException.ThrowIfGreaterThan(counter, MaxCounter);

        string year = cycleStartYear.ToString(CultureInfo.InvariantCulture);
        string sequence = counter.ToString("D7", CultureInfo.InvariantCulture);

        return year + sequence;
    }
}
