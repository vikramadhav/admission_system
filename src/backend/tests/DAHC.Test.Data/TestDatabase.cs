using DAHC.Data;
using DAHC.Data.Interceptors;
using DAHC.Service.Access;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace DAHC.Test.Data;

/// <summary>
/// A new in-memory database per test (D-16), with the production interceptors. Constraints, row versions,
/// transactions and SQL translation are not exercised here; they are checked in review and on staging.
/// </summary>
internal sealed class TestDatabase
{
    private readonly string databaseName = Guid.NewGuid().ToString("N");

    public TestDatabase(DateTimeOffset now)
    {
        this.TimeProvider = new FakeTimeProvider(now);
    }

    public FakeTimeProvider TimeProvider { get; }

    public CurrentAccess Access { get; } = new();

    public DahcDbContext CreateContext()
    {
        DbContextOptions<DahcDbContext> options = new DbContextOptionsBuilder<DahcDbContext>()
            .UseInMemoryDatabase(this.databaseName)
            .ConfigureWarnings(warnings => warnings.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .AddInterceptors(
                new SoftDeleteSaveChangesInterceptor(),
                new AuditSaveChangesInterceptor(this.Access, this.TimeProvider))
            .Options;

        return new DahcDbContext(options);
    }
}
