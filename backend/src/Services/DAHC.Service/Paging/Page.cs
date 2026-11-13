namespace DAHC.Service.Paging;

/// <summary>
/// One page of items and the cursor of the next page (null when there is none).
/// </summary>
public sealed record Page<T>(IReadOnlyList<T> Items, int Limit, string? NextCursor)
{
    public Page<TOther> Map<TOther>(Func<T, TOther> map)
    {
        ArgumentNullException.ThrowIfNull(map);

        List<TOther> mappedItems = this.Items.Select(map).ToList();

        return new Page<TOther>(mappedItems, this.Limit, this.NextCursor);
    }
}
