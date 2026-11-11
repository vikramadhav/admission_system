using System.Globalization;

namespace DAHC.API.Http;

/// <summary>
/// The resource version as a strong <c>ETag</c> (<c>"3"</c>) and its <c>If-Match</c> form. A weak or malformed
/// <c>If-Match</c> never matches.
/// </summary>
public static class EntityTags
{
    public static string Format(int version)
    {
        return "\"" + version.ToString(CultureInfo.InvariantCulture) + "\"";
    }

    public static bool TryParse(string? ifMatch, out int version)
    {
        version = 0;

        if (string.IsNullOrWhiteSpace(ifMatch))
        {
            return false;
        }

        string value = ifMatch.Trim();
        bool isQuoted = value.Length > 2 && value.StartsWith('"') && value.EndsWith('"');

        if (!isQuoted)
        {
            return false;
        }

        string digits = value[1..^1];

        return int.TryParse(digits, NumberStyles.None, CultureInfo.InvariantCulture, out version) && version >= 1;
    }
}
