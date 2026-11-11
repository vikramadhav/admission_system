using DAHC.API.Authentication;
using DAHC.API.Responses;
using Microsoft.AspNetCore.Diagnostics;

namespace DAHC.API.Http;

/// <summary>
/// The one boundary that logs an unexpected failure, once, and returns a 500 ProblemDetails with the trace id and
/// a safe message. Expected outcomes never reach it: services return results for them.
/// </summary>
public sealed class GlobalExceptionHandler : IExceptionHandler
{
    private const string UnexpectedErrorCode = "server.unexpected_error";

    private readonly ProblemFactory problemFactory;

    private readonly ILogger<GlobalExceptionHandler> logger;

    public GlobalExceptionHandler(ProblemFactory problemFactory, ILogger<GlobalExceptionHandler> logger)
    {
        this.problemFactory = problemFactory;
        this.logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(httpContext);
        ArgumentNullException.ThrowIfNull(exception);

        string operation = DescribeOperation(httpContext);
        string traceId = ProblemFactory.CurrentTraceId(httpContext);

        if (exception is OperationCanceledException
            && httpContext.RequestAborted.IsCancellationRequested)
        {
            this.logger.LogInformation(
                "Request {Operation} was cancelled by the client. TraceId {TraceId}.",
                operation,
                traceId);

            return true;
        }

        if (IdamAvailability.IsUnavailable(httpContext))
        {
            // IDAM could not be reached while validating the token: fail closed with 503, not 401 or 500.
            this.logger.LogWarning(
                "Request {Operation} refused with {ReasonCode}. TraceId {TraceId}.",
                operation,
                AuthenticationErrorCodes.IdamUnavailable,
                traceId);

            await this.problemFactory.WriteAsync(
                httpContext,
                StatusCodes.Status503ServiceUnavailable,
                AuthenticationErrorCodes.IdamUnavailable);

            return true;
        }

        this.logger.LogError(
            "Unexpected failure in {Operation}. TraceId {TraceId}. Exception chain: {ExceptionChain}",
            operation,
            traceId,
            ExceptionChain.Describe(exception));

        await this.problemFactory.WriteAsync(httpContext, StatusCodes.Status500InternalServerError, UnexpectedErrorCode);

        return true;
    }

    private static string DescribeOperation(HttpContext httpContext)
    {
        // The exception handler clears the endpoint before handlers run; the feature keeps the original one.
        Endpoint? failedEndpoint = httpContext.Features.Get<IExceptionHandlerFeature>()?.Endpoint;
        string route = failedEndpoint is RouteEndpoint endpoint
            ? endpoint.RoutePattern.RawText ?? "unnamed"
            : "unmatched";

        return httpContext.Request.Method + " " + route;
    }
}
