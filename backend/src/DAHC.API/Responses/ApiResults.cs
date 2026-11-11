using DAHC.API.Http;
using DAHC.API.Localization;
using DAHC.Service.Paging;
using DAHC.Service.Results;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;

namespace DAHC.API.Responses;

/// <summary>
/// The one translation from service results to HTTP responses (standard s.12): success into the
/// <see cref="ApiResponse{T}"/> envelope, every failure into a top-level ProblemDetails.
/// </summary>
public sealed class ApiResults
{
    private readonly ProblemFactory problemFactory;

    private readonly IStringLocalizer<Messages> localizer;

    public ApiResults(ProblemFactory problemFactory, IStringLocalizer<Messages> localizer)
    {
        this.problemFactory = problemFactory;
        this.localizer = localizer;
    }

    public static int ToStatusCode(ResultStatus status)
    {
        return status switch
        {
            ResultStatus.Success => StatusCodes.Status200OK,
            ResultStatus.BadRequest => StatusCodes.Status400BadRequest,
            ResultStatus.Unauthenticated => StatusCodes.Status401Unauthorized,
            ResultStatus.Forbidden => StatusCodes.Status403Forbidden,
            ResultStatus.NotFound => StatusCodes.Status404NotFound,
            ResultStatus.Conflict => StatusCodes.Status409Conflict,
            ResultStatus.PreconditionFailed => StatusCodes.Status412PreconditionFailed,
            ResultStatus.ValidationFailed => StatusCodes.Status422UnprocessableEntity,
            ResultStatus.PreconditionRequired => StatusCodes.Status428PreconditionRequired,
            ResultStatus.Unavailable => StatusCodes.Status503ServiceUnavailable,
            _ => StatusCodes.Status500InternalServerError,
        };
    }

    /// <summary>
    /// Translates a result: <paramref name="onSuccess"/> builds the success response; a failure always becomes
    /// the same ProblemDetails shape.
    /// </summary>
    public IActionResult Translate<T>(HttpContext httpContext, Result<T> result, Func<T, IActionResult> onSuccess)
    {
        ArgumentNullException.ThrowIfNull(httpContext);
        ArgumentNullException.ThrowIfNull(result);
        ArgumentNullException.ThrowIfNull(onSuccess);

        if (result.IsSuccess)
        {
            return onSuccess(result.Value);
        }

        ResultError error = result.Error
            ?? throw new InvalidOperationException("A failed result must carry an error.");
        int statusCode = ToStatusCode(result.Status);

        return this.problemFactory.ToActionResult(httpContext, statusCode, error.Code, error.Issues);
    }

    public IActionResult Ok<T>(HttpContext httpContext, Result<T> result)
    {
        return this.Translate(httpContext, result, value => new OkObjectResult(new ApiResponse<T> { Data = value }));
    }

    /// <summary>
    /// A single versioned resource: 200 with the envelope and its <c>ETag</c>.
    /// </summary>
    public IActionResult OkVersioned<T>(HttpContext httpContext, Result<T> result, Func<T, int> version)
    {
        return this.Translate(
            httpContext,
            result,
            value =>
            {
                httpContext.Response.Headers.ETag = EntityTags.Format(version(value));

                return new OkObjectResult(new ApiResponse<T> { Data = value });
            });
    }

    /// <summary>
    /// A created versioned resource: 201 with the envelope, its <c>Location</c> and its <c>ETag</c>.
    /// </summary>
    public IActionResult CreatedVersioned<T>(
        HttpContext httpContext,
        Result<T> result,
        Func<T, int> version,
        Func<T, string> location)
    {
        return this.Translate(
            httpContext,
            result,
            value =>
            {
                httpContext.Response.Headers.ETag = EntityTags.Format(version(value));

                return new CreatedResult(location(value), new ApiResponse<T> { Data = value });
            });
    }

    /// <summary>
    /// A page of a collection. An empty collection is a success with a localized message code, never a 404.
    /// </summary>
    public IActionResult List<T>(HttpContext httpContext, Result<Page<T>> result, string emptyMessageCode)
    {
        return this.Translate(
            httpContext,
            result,
            page => new OkObjectResult(this.CreateListResponse(page, emptyMessageCode)));
    }

    /// <summary>
    /// An object that contains a collection: <paramref name="isEmpty"/> decides whether the empty message is set.
    /// </summary>
    public IActionResult OkWithEmptyMessage<T>(
        HttpContext httpContext,
        Result<T> result,
        Func<T, bool> isEmpty,
        string emptyMessageCode)
    {
        return this.Translate(
            httpContext,
            result,
            value =>
            {
                ApiResponse<T> response = new() { Data = value };

                if (isEmpty(value))
                {
                    response = response with
                    {
                        MessageCode = emptyMessageCode,
                        Message = this.localizer[emptyMessageCode],
                    };
                }

                return new OkObjectResult(response);
            });
    }

    private ApiResponse<IReadOnlyList<T>> CreateListResponse<T>(Page<T> page, string emptyMessageCode)
    {
        ApiResponse<IReadOnlyList<T>> response = new()
        {
            Data = page.Items,
            Pagination = new PageMetadata(page.Limit, page.NextCursor),
        };

        if (page.Items.Count == 0)
        {
            response = response with
            {
                MessageCode = emptyMessageCode,
                Message = this.localizer[emptyMessageCode],
            };
        }

        return response;
    }
}
