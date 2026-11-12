using System.Diagnostics;
using DAHC.API.Localization;
using DAHC.Service.Results;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Localization;

namespace DAHC.API.Responses;

/// <summary>
/// Builds every error response: an RFC 7807 ProblemDetails at the top level with a stable dotted code, a
/// localized safe message and the trace id. Used by controllers, middleware and the exception handler alike.
/// </summary>
public sealed class ProblemFactory
{
    public const string ContentType = "application/problem+json";

    private readonly IStringLocalizer<Messages> localizer;

    public ProblemFactory(IStringLocalizer<Messages> localizer)
    {
        this.localizer = localizer;
    }

    public static string CurrentTraceId(HttpContext httpContext)
    {
        ArgumentNullException.ThrowIfNull(httpContext);

        return Activity.Current?.TraceId.ToHexString() ?? httpContext.TraceIdentifier;
    }

    public ProblemDetails Create(
        HttpContext httpContext,
        int statusCode,
        string code,
        IReadOnlyList<ValidationIssue> issues)
    {
        ArgumentNullException.ThrowIfNull(httpContext);
        ArgumentNullException.ThrowIfNull(issues);

        ProblemDetails problem = new()
        {
            Type = "about:blank",
            Title = ReasonPhrases.GetReasonPhrase(statusCode),
            Status = statusCode,
            Detail = this.localizer[code],
        };

        problem.Extensions["code"] = code;
        problem.Extensions["traceId"] = CurrentTraceId(httpContext);

        if (issues.Count > 0)
        {
            problem.Extensions["errors"] = issues
                .Select(issue => new ProblemIssue(issue.Code, this.localizer[issue.Code], issue.Pointer))
                .ToList();
        }

        return problem;
    }

    public IActionResult ToActionResult(
        HttpContext httpContext,
        int statusCode,
        string code,
        IReadOnlyList<ValidationIssue> issues)
    {
        ProblemDetails problem = this.Create(httpContext, statusCode, code, issues);
        ObjectResult result = new(problem) { StatusCode = statusCode };

        result.ContentTypes.Add(ContentType);

        return result;
    }

    public async Task WriteAsync(HttpContext httpContext, int statusCode, string code)
    {
        ArgumentNullException.ThrowIfNull(httpContext);

        ProblemDetails problem = this.Create(httpContext, statusCode, code, []);

        httpContext.Response.StatusCode = statusCode;

        await httpContext.Response.WriteAsJsonAsync(
            problem,
            options: null,
            contentType: ContentType,
            cancellationToken: httpContext.RequestAborted);
    }

    /// <summary>
    /// One invalid field in a ProblemDetails <c>errors</c> list (contract <c>ValidationIssue</c>).
    /// </summary>
    public sealed record ProblemIssue(string Code, string Detail, string? Pointer);
}
