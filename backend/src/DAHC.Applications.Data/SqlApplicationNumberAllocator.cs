using DAHC.Applications.Service;
using DAHC.Data;
using Microsoft.EntityFrameworkCore;

namespace DAHC.Applications.Data;

/// <summary>
/// Advances the cycle's counter with one MERGE statement. Run inside the create-application transaction, its row
/// lock serialises concurrent creators until commit, which protects the invariant that two applications never
/// receive the same number and numbers are never reused within a cycle (D-19).
/// </summary>
internal sealed class SqlApplicationNumberAllocator : IApplicationNumberAllocator
{
    private readonly DahcDbContext dbContext;

    public SqlApplicationNumberAllocator(DahcDbContext dbContext)
    {
        this.dbContext = dbContext;
    }

    public async Task<string> AllocateAsync(
        int admissionCycleId,
        short cycleStartYear,
        CancellationToken cancellationToken)
    {
        FormattableString statement = $"""
            MERGE app.ApplicationNumberCounter WITH (HOLDLOCK) AS target
            USING (SELECT {admissionCycleId} AS AdmissionCycleId, {cycleStartYear} AS CycleStartYear) AS source
            ON target.AdmissionCycleId = source.AdmissionCycleId
            WHEN MATCHED THEN UPDATE SET LastValue = target.LastValue + 1
            WHEN NOT MATCHED THEN INSERT (AdmissionCycleId, CycleStartYear, LastValue)
                VALUES (source.AdmissionCycleId, source.CycleStartYear, 1)
            OUTPUT inserted.LastValue AS [Value];
            """;

        try
        {
            List<int> values = await this.dbContext.Database
                .SqlQuery<int>(statement)
                .ToListAsync(cancellationToken);

            return ApplicationNumberFormat.Format(cycleStartYear, values.Single());
        }
        catch (Exception exception) when (DahcDataException.IsDatabaseFailure(exception))
        {
            throw new DahcDataException("SqlApplicationNumberAllocator.AllocateAsync", exception);
        }
    }
}
