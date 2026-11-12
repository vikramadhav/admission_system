namespace DAHC.Service.Paging;

/// <summary>
/// One allow-listed sort field and its direction.
/// </summary>
public sealed record SortKey(string Field, bool IsDescending);
