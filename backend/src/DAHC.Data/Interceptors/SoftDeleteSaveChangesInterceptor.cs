using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace DAHC.Data.Interceptors;

/// <summary>
/// Records that must stay auditable are never hard-deleted: a delete of an entity mapped with the
/// <see cref="IsDeletedProperty"/> shadow property becomes an update that sets it. A global query filter on the
/// same entity hides deleted rows.
/// </summary>
public sealed class SoftDeleteSaveChangesInterceptor : SaveChangesInterceptor
{
    public const string IsDeletedProperty = "IsDeleted";

    public override InterceptionResult<int> SavingChanges(
        DbContextEventData eventData,
        InterceptionResult<int> result)
    {
        ArgumentNullException.ThrowIfNull(eventData);

        MarkDeletedRows(eventData.Context);

        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(eventData);

        MarkDeletedRows(eventData.Context);

        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private static void MarkDeletedRows(DbContext? context)
    {
        if (context is null)
        {
            return;
        }

        // Removals from a collection only become deletions when changes are detected.
        context.ChangeTracker.DetectChanges();

        List<EntityEntry> deletedEntries = context.ChangeTracker.Entries()
            .Where(entry => entry.State == EntityState.Deleted)
            .Where(entry => entry.Metadata.FindProperty(IsDeletedProperty) is not null)
            .ToList();

        foreach (EntityEntry entry in deletedEntries)
        {
            entry.State = EntityState.Modified;
            entry.Property(IsDeletedProperty).CurrentValue = true;
        }
    }
}
