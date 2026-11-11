using System.Globalization;
using System.Text;

namespace DAHC.API.Http;

/// <summary>
/// Describes an exception chain by type, HResult and stack trace only. Messages are left out on purpose:
/// database and identity-provider messages can quote stored values (standard s.13).
/// </summary>
public static class ExceptionChain
{
    public static string Describe(Exception exception)
    {
        ArgumentNullException.ThrowIfNull(exception);

        StringBuilder description = new();
        Exception? current = exception;
        int depth = 0;

        while (current is not null)
        {
            description.Append(CultureInfo.InvariantCulture, $"[{depth}] {current.GetType().FullName}");
            description.Append(CultureInfo.InvariantCulture, $" (HResult 0x{current.HResult:X8})");
            description.AppendLine();
            description.AppendLine(current.StackTrace);

            current = current.InnerException;
            depth++;
        }

        return description.ToString();
    }
}
