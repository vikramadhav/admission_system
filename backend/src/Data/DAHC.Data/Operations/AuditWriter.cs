using System.Diagnostics;
using DAHC.Service.Access;

namespace DAHC.Data.Operations;

/// <summary>
/// Writes security and business audit events (DEC-07, BE-03), alongside the row-change events of
/// <see cref="Interceptors.AuditSaveChangesInterceptor"/>. An event carries the action, outcome, reason code,
/// actor, resource reference, time and trace id; never tokens, credentials, request bodies, IDAM subjects or
/// profile values.
/// </summary>
public sealed class AuditWriter
{
    private readonly DahcDbContext dbContext;

    private readonly CurrentAccess currentAccess;

    private readonly TimeProvider timeProvider;

    public AuditWriter(DahcDbContext dbContext, CurrentAccess currentAccess, TimeProvider timeProvider)
    {
        this.dbContext = dbContext;
        this.currentAccess = currentAccess;
        this.timeProvider = timeProvider;
    }

    /// <summary>
    /// Adds the event to the caller's pending changes, so it is saved by the caller's own save (and so in the same
    /// transaction as the change it describes) or not at all.
    /// </summary>
    public void Add(AuditRecord record)
    {
        ArgumentNullException.ThrowIfNull(record);

        this.dbContext.AuditEvents.Add(this.Create(record));
    }

    /// <summary>
    /// Saves the event on its own, for an outcome with no business change to save with it (a refusal). It refuses to
    /// run while the context holds other pending changes, so it can never commit them as a side effect.
    /// </summary>
    public async Task WriteAsync(AuditRecord record)
    {
        ArgumentNullException.ThrowIfNull(record);

        if (this.dbContext.ChangeTracker.HasChanges())
        {
            throw new InvalidOperationException(
                "A stand-alone audit event cannot be saved while other changes are pending; use Add.");
        }

        this.dbContext.AuditEvents.Add(this.Create(record));

        try
        {
            // The event records something that has already happened, so it is not cancelled with the request.
            await this.dbContext.SaveChangesAsync(CancellationToken.None);
        }
        catch (Exception exception) when (DahcDataException.IsDatabaseFailure(exception))
        {
            throw new DahcDataException("AuditWriter.WriteAsync", exception);
        }
    }

    private AuditEvent Create(AuditRecord record)
    {
        DateTimeOffset occurredAt = this.timeProvider.GetUtcNow();
        CurrentUser? user = this.currentAccess.User;
        bool hasExplicitActor = record.ActorCandidateId is not null || record.ActorStaffUserId is not null;

        AuditEvent auditEvent = new()
        {
            PublicId = Guid.CreateVersion7(occurredAt),
            OccurredAt = occurredAt,
            ActorType = hasExplicitActor ? DescribeExplicitActor(record) : this.DescribeCurrentActor(user),
            ActorCandidateId = hasExplicitActor
                ? record.ActorCandidateId
                : user?.UserType == UserType.Candidate ? user.InternalId : null,
            ActorStaffUserId = hasExplicitActor
                ? record.ActorStaffUserId
                : user?.UserType == UserType.Staff ? (int)user.InternalId : null,
            ActiveRoleCode = user?.ActiveRole,
            ActionCode = record.ActionCode,
            ResourceType = record.ResourceType,
            ResourceId = record.ResourceId,
            Outcome = record.Outcome,
            ReasonCode = record.ReasonCode,
            RequestId = Activity.Current?.TraceId.ToHexString(),
        };

        return auditEvent;
    }

    private static string DescribeExplicitActor(AuditRecord record)
    {
        return record.ActorStaffUserId is not null ? "STAFF" : "CANDIDATE";
    }

    private string DescribeCurrentActor(CurrentUser? user)
    {
        if (user is not null)
        {
            return user.UserType == UserType.Staff ? "STAFF" : "CANDIDATE";
        }

        // As in the row-change audit: a user token without a local user can only become a Candidate by signing in.
        return this.currentAccess.TokenKind switch
        {
            TokenKind.User => "CANDIDATE",
            TokenKind.IntegrationOnly or TokenKind.UserViaIntegration => "SERVICE",
            _ => "SYSTEM",
        };
    }
}
