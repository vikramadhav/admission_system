namespace DAHC.Service.Paging;

/// <summary>
/// A bounded page request: limit, the opaque cursor from the previous page and the requested sort.
/// </summary>
public sealed record PageQuery
{
    public const int DefaultLimit = 25;

    public const int MaxLimit = 100;

    public PageQuery(int? limit, string? cursor, string? sort)
    {
        int requestedLimit = limit ?? DefaultLimit;

        this.Limit = Math.Clamp(requestedLimit, 1, MaxLimit);
        this.Cursor = cursor;
        this.Sort = sort;
    }

    public int Limit { get; }

    public string? Cursor { get; }

    public string? Sort { get; }
}
