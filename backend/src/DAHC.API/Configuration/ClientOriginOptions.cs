namespace DAHC.API.Configuration;

/// <summary>
/// The exact origins of the DAHC clients allowed by CORS. Never a wildcard.
/// </summary>
public sealed class ClientOriginOptions
{
    public const string SectionName = "ClientOrigins";

    public string[] Origins { get; set; } = [];

    public bool IsConsistent()
    {
        return this.Origins.All(IsExactOrigin);
    }

    private static bool IsExactOrigin(string origin)
    {
        bool isAbsolute = Uri.TryCreate(origin, UriKind.Absolute, out Uri? uri);

        return isAbsolute
            && uri is not null
            && uri.Scheme is "https" or "http"
            && uri.AbsolutePath == "/"
            && !origin.EndsWith('/')
            && !origin.Contains('*', StringComparison.Ordinal);
    }
}
