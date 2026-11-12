using System.ComponentModel.DataAnnotations;
using DAHC.Service.Paging;

namespace DAHC.API.Contracts;

/// <summary>
/// Bounded collection query parameters: <c>limit</c> (1-100, default 25), opaque <c>cursor</c> and allow-listed
/// <c>sort</c>.
/// </summary>
public sealed record PageParameters
{
    [Range(1, PageQuery.MaxLimit)]
    public int? Limit { get; init; }

    [StringLength(2048, MinimumLength = 1)]
    public string? Cursor { get; init; }

    [StringLength(200)]
    public string? Sort { get; init; }

    public PageQuery ToPageQuery()
    {
        return new PageQuery(this.Limit, this.Cursor, this.Sort);
    }
}
