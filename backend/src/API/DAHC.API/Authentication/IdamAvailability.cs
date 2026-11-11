namespace DAHC.API.Authentication;

/// <summary>
/// Marks a request whose call to IDAM failed, so the refusal becomes 503 rather than 401: IDAM errors fail
/// closed, but an unreachable IDAM is not reported as an invalid token.
/// </summary>
public static class IdamAvailability
{
    private const string UnavailableKey = "dahc.idam_unavailable";

    public static void MarkUnavailable(HttpContext httpContext)
    {
        ArgumentNullException.ThrowIfNull(httpContext);

        httpContext.Items[UnavailableKey] = true;
    }

    public static bool IsUnavailable(HttpContext httpContext)
    {
        ArgumentNullException.ThrowIfNull(httpContext);

        return httpContext.Items.ContainsKey(UnavailableKey);
    }
}
