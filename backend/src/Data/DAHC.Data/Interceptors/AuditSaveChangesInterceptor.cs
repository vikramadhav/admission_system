using System.Diagnostics;
using System.Text.Json;
using DAHC.Data.Operations;
using DAHC.Service.Access;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace DAHC.Data.Interceptors;

/// <summary>
/// Adds one <see cref="AuditEvent"/> per created, changed or deleted record that has a public id, in the same
/// save (and so the same transaction) as the change. It records the actor, the active role, the action, the
/// outcome, the UTC time and the record's public id; never the record's values.
/// </summary>
public sealed class AuditSaveChangesInterceptor : SaveChangesInterceptor
{
    private const string PublicIdProperty = "PublicId";

    private readonly CurrentAccess currentAccess;

    private readonly TimeProvider timeProvider;

    public AuditSaveChangesInterceptor(CurrentAccess currentAccess, TimeProvider timeProvider)
    {
        ArgumentNullException.ThrowIfNull(currentAccess);
        ArgumentNullException.ThrowIfNull(timeProvider);

        this.currentAccess = currentAccess;
        this.timeProvider = timeProvider;
    }

    public override InterceptionResult<int> SavingChanges(
        DbContextEventData eventData,
        InterceptionResult<int> result)
    {
        ArgumentNullException.ThrowIfNull(eventData);

        this.AddAuditEvents(eventData.Context);

        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(eventData);

        this.AddAuditEvents(eventData.Context);

        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private static string? DescribeChange(EntityState state)
    {
        return state switch
        {
            EntityState.Added => "created",
            EntityState.Modified => "updated",
            EntityState.Deleted => "deleted",
            _ => null,
        };
    }

    private static string ToResourceType(EntityEntry entry)
    {
        string name = entry.Metadata.GetTableName() ?? entry.Metadata.ClrType.Name;

        return JsonNamingPolicy.SnakeCaseLower.ConvertName(name);
    }

    private void AddAuditEvents(DbContext? context)
    {
        if (context is null)
        {
            return;
        }

        context.ChangeTracker.DetectChanges();

        List<EntityEntry> auditedEntries = context.ChangeTracker.Entries()
            .Where(entry => entry.Entity is not AuditEvent)
            .Where(entry => entry.Metadata.FindProperty(PublicIdProperty) is not null)
            .Where(entry => DescribeChange(entry.State) is not null)
            .ToList();

        DateTimeOffset occurredAt = this.timeProvider.GetUtcNow();

        foreach (EntityEntry entry in auditedEntries)
        {
            AuditEvent auditEvent = this.CreateAuditEvent(entry, occurredAt);

            context.Add(auditEvent);
        }
    }

    private AuditEvent CreateAuditEvent(EntityEntry entry, DateTimeOffset occurredAt)
    {
        string resourceType = ToResourceType(entry);
        string change = DescribeChange(entry.State) ?? "updated";
        object? publicId = entry.Property(PublicIdProperty).CurrentValue;
        string resourceId = publicId is Guid id ? id.ToString() : string.Empty;
        CurrentUser? user = this.currentAccess.User;

        AuditEvent auditEvent = new()
        {
            PublicId = Guid.CreateVersion7(occurredAt),
            OccurredAt = occurredAt,
            ActorType = this.DescribeActorType(user),
            ActorCandidateId = user?.UserType == UserType.Candidate ? user.InternalId : null,
            ActorStaffUserId = user?.UserType == UserType.Staff ? (int)user.InternalId : null,
            ActiveRoleCode = user?.ActiveRole,
            ActionCode = resourceType + "." + change,
            ResourceType = resourceType,
            ResourceId = resourceId,
            Outcome = "SUCCESS",
            RequestId = Activity.Current?.TraceId.ToHexString(),
        };

        return auditEvent;
    }

    private string DescribeActorType(CurrentUser? user)
    {
        if (user is not null)
        {
            return user.UserType == UserType.Staff ? "STAFF" : "CANDIDATE";
        }

        // A first sign-in has no local user yet: the person signing in is the actor of their own provisioning.
        return this.currentAccess.TokenKind == TokenKind.User ? "CANDIDATE" : "SYSTEM";
    }
}
