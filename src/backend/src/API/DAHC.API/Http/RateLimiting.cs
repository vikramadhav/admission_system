using System.Globalization;
using System.Threading.RateLimiting;
using DAHC.API.Authentication;
using DAHC.API.Responses;
using Microsoft.AspNetCore.RateLimiting;

namespace DAHC.API.Http;

/// <summary>
/// Fixed-window limits partitioned by user, by integration client or by client address, with a tighter policy on
/// authentication endpoints (standard s.15).
/// </summary>
public static class RateLimiting
{
    public const string AuthenticationPolicy = "authentication";

    private const string RateLimitedCode = "request.rate_limited";

    private static readonly TimeSpan window = TimeSpan.FromMinutes(1);

    public static IServiceCollection AddDahcRateLimiting(this IServiceCollection services)
    {
        ArgumentNullException.ThrowIfNull(services);

        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(
                httpContext => CreatePartition(httpContext, permitLimit: 300));
            options.AddPolicy(
                AuthenticationPolicy,
                httpContext => CreatePartition(httpContext, permitLimit: 20));
            options.OnRejected = WriteRejectionAsync;
        });

        return services;
    }

    private static RateLimitPartition<string> CreatePartition(HttpContext httpContext, int permitLimit)
    {
        string partitionKey = DescribeCaller(httpContext);

        return RateLimitPartition.GetFixedWindowLimiter(
            partitionKey,
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = permitLimit,
                Window = window,
                QueueLimit = 0,
            });
    }

    /// <summary>
    /// A user token is limited per user, an integration-only token per integration client, and an anonymous
    /// request per client address.
    /// </summary>
    private static string DescribeCaller(HttpContext httpContext)
    {
        if (httpContext.User.Identity?.IsAuthenticated == true)
        {
            TokenClaims claims = TokenClaims.From(httpContext.User);

            return claims.Subject is not null
                ? "user:" + claims.Subject
                : "client:" + claims.ClientId;
        }

        return "address:" + httpContext.Connection.RemoteIpAddress;
    }

    private static async ValueTask WriteRejectionAsync(OnRejectedContext context, CancellationToken cancellationToken)
    {
        HttpContext httpContext = context.HttpContext;

        if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out TimeSpan retryAfter))
        {
            string seconds = ((int)Math.Ceiling(retryAfter.TotalSeconds)).ToString(CultureInfo.InvariantCulture);
            httpContext.Response.Headers.RetryAfter = seconds;
        }

        ProblemFactory problemFactory = httpContext.RequestServices.GetRequiredService<ProblemFactory>();

        await problemFactory.WriteAsync(httpContext, StatusCodes.Status429TooManyRequests, RateLimitedCode);
    }
}
