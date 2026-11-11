using System.Text.Json.Serialization;

namespace DAHC.API.Responses;

/// <summary>
/// The success envelope of every JSON success response (standard s.12, D-02). Errors are never wrapped: they are
/// top-level ProblemDetails.
/// </summary>
public sealed record ApiResponse<T>
{
    public required T Data { get; init; }

    /// <summary>
    /// Cursor metadata, present for collections only.
    /// </summary>
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public PageMetadata? Pagination { get; init; }

    /// <summary>
    /// A stable message code, set for an empty collection (for example <c>applications.none_active</c>).
    /// </summary>
    public string? MessageCode { get; init; }

    /// <summary>
    /// <see cref="MessageCode"/> resolved for the request culture.
    /// </summary>
    public string? Message { get; init; }
}

/// <summary>
/// The page size used and the opaque cursor of the next page (null when there is no next page).
/// </summary>
public sealed record PageMetadata(int Limit, string? NextCursor);
