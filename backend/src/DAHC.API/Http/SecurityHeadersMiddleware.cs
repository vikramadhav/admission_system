namespace DAHC.API.Http;

/// <summary>
/// Response headers for a JSON-only API: no content sniffing, no framing, no referrer, and no caching of
/// responses that can hold personal data.
/// </summary>
public sealed class SecurityHeadersMiddleware
{
    private readonly RequestDelegate next;

    public SecurityHeadersMiddleware(RequestDelegate next)
    {
        this.next = next;
    }

    public async Task InvokeAsync(HttpContext httpContext)
    {
        ArgumentNullException.ThrowIfNull(httpContext);

        // Set when the response starts, so error responses written after a reset carry them too.
        httpContext.Response.OnStarting(() =>
        {
            AddHeaders(httpContext.Response.Headers);

            return Task.CompletedTask;
        });

        await this.next(httpContext);
    }

    private static void AddHeaders(IHeaderDictionary headers)
    {
        headers.XContentTypeOptions = "nosniff";
        headers.XFrameOptions = "DENY";
        headers.ContentSecurityPolicy = "default-src 'none'; frame-ancestors 'none'";
        headers["Referrer-Policy"] = "no-referrer";
        headers.CacheControl = "no-store";
    }
}
