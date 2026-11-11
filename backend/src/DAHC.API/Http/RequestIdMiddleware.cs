using System.Text.RegularExpressions;
using DAHC.API.Responses;

namespace DAHC.API.Http;

/// <summary>
/// Returns the request's W3C trace id as <c>X-Request-ID</c> and adds it, with a validated optional
/// <c>X-Correlation-ID</c>, to the logging scope. The correlation id is never treated as identity.
/// </summary>
public sealed partial class RequestIdMiddleware
{
    public const string RequestIdHeader = "X-Request-ID";

    public const string CorrelationIdHeader = "X-Correlation-ID";

    private readonly RequestDelegate next;

    private readonly ILogger<RequestIdMiddleware> logger;

    public RequestIdMiddleware(RequestDelegate next, ILogger<RequestIdMiddleware> logger)
    {
        this.next = next;
        this.logger = logger;
    }

    public async Task InvokeAsync(HttpContext httpContext)
    {
        ArgumentNullException.ThrowIfNull(httpContext);

        string requestId = ProblemFactory.CurrentTraceId(httpContext);
        string? correlationId = ReadCorrelationId(httpContext);

        httpContext.Response.OnStarting(() =>
        {
            httpContext.Response.Headers[RequestIdHeader] = requestId;

            return Task.CompletedTask;
        });

        Dictionary<string, object?> scope = new()
        {
            ["RequestId"] = requestId,
            ["CorrelationId"] = correlationId,
        };

        using (this.logger.BeginScope(scope))
        {
            await this.next(httpContext);
        }
    }

    private static string? ReadCorrelationId(HttpContext httpContext)
    {
        string? value = httpContext.Request.Headers[CorrelationIdHeader];

        if (value is null
            || !SafeCorrelationId().IsMatch(value))
        {
            return null;
        }

        return value;
    }

    [GeneratedRegex("^[A-Za-z0-9._-]{1,64}$", RegexOptions.CultureInvariant)]
    private static partial Regex SafeCorrelationId();
}
