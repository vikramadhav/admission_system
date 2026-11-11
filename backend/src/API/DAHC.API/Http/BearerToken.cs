using Microsoft.Net.Http.Headers;

namespace DAHC.API.Http;

/// <summary>
/// Reads the access token from the <c>Authorization: Bearer</c> header, the only place a token is accepted.
/// </summary>
public static class BearerToken
{
    private const string Prefix = "Bearer ";

    public static string? Read(HttpRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);

        string? header = request.Headers[HeaderNames.Authorization];

        if (header is null
            || !header.StartsWith(Prefix, StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }

        string token = header[Prefix.Length..].Trim();

        return token.Length == 0 ? null : token;
    }
}
