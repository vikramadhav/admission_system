using DAHC.Data;
using DAHC.Identity.Service;
using Microsoft.EntityFrameworkCore;

namespace DAHC.Identity.Data;

/// <summary>
/// Takes the next value of <c>idn.CandidateNumberSeq</c>. A number taken by a sign-in that then fails is not
/// reused; gaps are acceptable, duplicates are not.
/// </summary>
internal sealed class SqlCandidateNumberAllocator : ICandidateNumberAllocator
{
    private readonly DahcDbContext dbContext;

    public SqlCandidateNumberAllocator(DahcDbContext dbContext)
    {
        this.dbContext = dbContext;
    }

    public async Task<string> AllocateAsync(CancellationToken cancellationToken)
    {
        try
        {
            List<int> values = await this.dbContext.Database
                .SqlQuery<int>($"SELECT NEXT VALUE FOR idn.CandidateNumberSeq AS [Value]")
                .ToListAsync(cancellationToken);

            return CandidateNumberFormat.Format(values.Single());
        }
        catch (Exception exception) when (DahcDataException.IsDatabaseFailure(exception))
        {
            throw new DahcDataException("SqlCandidateNumberAllocator.AllocateAsync", exception);
        }
    }
}
