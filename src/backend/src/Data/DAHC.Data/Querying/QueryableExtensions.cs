using System.Linq.Expressions;
using DAHC.Service.Paging;
using DAHC.Service.Results;
using Microsoft.EntityFrameworkCore;

namespace DAHC.Data.Querying;

/// <summary>
/// Allow-listed sorting and bounded cursor paging for EF Core queries.
/// </summary>
public static class QueryableExtensions
{
    /// <summary>
    /// Orders by the parsed sort keys, each mapped to a selector from the allow-list, then by a unique tie-breaker
    /// so pages are stable.
    /// </summary>
    public static IQueryable<T> OrderBySortKeys<T>(
        this IQueryable<T> source,
        IReadOnlyList<SortKey> sortKeys,
        IReadOnlyDictionary<string, Expression<Func<T, object?>>> selectors,
        Expression<Func<T, object?>> tieBreaker)
    {
        ArgumentNullException.ThrowIfNull(source);
        ArgumentNullException.ThrowIfNull(sortKeys);
        ArgumentNullException.ThrowIfNull(selectors);
        ArgumentNullException.ThrowIfNull(tieBreaker);

        IOrderedQueryable<T>? ordered = null;

        foreach (SortKey sortKey in sortKeys)
        {
            Expression<Func<T, object?>> selector = selectors[sortKey.Field];

            ordered = ThenOrder(source, ordered, selector, sortKey.IsDescending);
        }

        return ThenOrder(source, ordered, tieBreaker, false);
    }

    /// <summary>
    /// Reads one page at the cursor's offset. The cursor is bound to <paramref name="context"/>, which names the
    /// query, its filters and its sort.
    /// </summary>
    public static async Task<Result<Page<T>>> ReadPageAsync<T>(
        this IQueryable<T> orderedQuery,
        PageQuery pageQuery,
        string context,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(orderedQuery);
        ArgumentNullException.ThrowIfNull(pageQuery);

        Result<int> offset = CursorCodec.Decode(pageQuery.Cursor, context);

        if (!offset.IsSuccess)
        {
            return offset.ToFailure<Page<T>>();
        }

        List<T> rows = await orderedQuery
            .Skip(offset.Value)
            .Take(pageQuery.Limit + 1)
            .ToListAsync(cancellationToken);

        string? nextCursor = null;

        if (rows.Count > pageQuery.Limit)
        {
            rows.RemoveAt(pageQuery.Limit);
            nextCursor = CursorCodec.Encode(offset.Value + pageQuery.Limit, context);
        }

        Page<T> page = new(rows, pageQuery.Limit, nextCursor);

        return Result.Success(page);
    }

    private static IOrderedQueryable<T> ThenOrder<T>(
        IQueryable<T> source,
        IOrderedQueryable<T>? ordered,
        Expression<Func<T, object?>> selector,
        bool isDescending)
    {
        if (ordered is null)
        {
            return isDescending ? source.OrderByDescending(selector) : source.OrderBy(selector);
        }

        return isDescending ? ordered.ThenByDescending(selector) : ordered.ThenBy(selector);
    }
}
