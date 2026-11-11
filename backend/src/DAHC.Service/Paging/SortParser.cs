using DAHC.Service.Results;

namespace DAHC.Service.Paging;

/// <summary>
/// Parses a comma-separated sort list (<c>-createdAt,name</c>) against an allow-list of fields.
/// </summary>
public static class SortParser
{
    private const int MaxKeys = 5;

    public static Result<IReadOnlyList<SortKey>> Parse(
        string? sort,
        string defaultSort,
        IReadOnlyCollection<string> allowedFields)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(defaultSort);
        ArgumentNullException.ThrowIfNull(allowedFields);

        string effectiveSort = string.IsNullOrWhiteSpace(sort) ? defaultSort : sort;
        string[] parts = effectiveSort.Split(',', StringSplitOptions.TrimEntries);

        if (parts.Length > MaxKeys)
        {
            return InvalidSort();
        }

        List<SortKey> keys = [];

        foreach (string part in parts)
        {
            bool isDescending = part.StartsWith('-');
            string field = isDescending ? part[1..] : part;
            bool isAllowed = allowedFields.Contains(field, StringComparer.Ordinal);
            bool isRepeated = keys.Exists(key => key.Field == field);

            if (!isAllowed
                || isRepeated)
            {
                return InvalidSort();
            }

            keys.Add(new SortKey(field, isDescending));
        }

        return Result.Success<IReadOnlyList<SortKey>>(keys);
    }

    /// <summary>
    /// A stable text form of the sort, used to bind a cursor to the sort it was issued for.
    /// </summary>
    public static string Describe(IReadOnlyList<SortKey> keys)
    {
        IEnumerable<string> parts = keys.Select(key => key.IsDescending ? "-" + key.Field : key.Field);

        return string.Join(',', parts);
    }

    private static Result<IReadOnlyList<SortKey>> InvalidSort()
    {
        return Result.Failure<IReadOnlyList<SortKey>>(ResultStatus.BadRequest, ErrorCodes.InvalidSort);
    }
}
