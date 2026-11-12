using DAHC.Data.Operations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DAHC.Data.Configurations.Operations;

/// <summary>
/// No foreign keys on purpose: audit rows must outlive, and never block, the records they describe.
/// </summary>
public sealed class AuditEventConfiguration : IEntityTypeConfiguration<AuditEvent>
{
    public void Configure(EntityTypeBuilder<AuditEvent> builder)
    {
        ArgumentNullException.ThrowIfNull(builder);

        builder.ToTable(
            "AuditEvent",
            "ops",
            table =>
            {
                table.HasCheckConstraint(
                    "CK_AuditEvent_ActorType",
                    "[ActorType] IN ('CANDIDATE','STAFF','SERVICE','SYSTEM')");
                table.HasCheckConstraint("CK_AuditEvent_Outcome", "[Outcome] IN ('SUCCESS','DENIED','FAILED')");
            });

        builder.HasKey(auditEvent => auditEvent.AuditEventId).HasName("PK_AuditEvent");
        builder.HasAlternateKey(auditEvent => auditEvent.PublicId).HasName("UQ_AuditEvent_PublicId");

        builder.Property(auditEvent => auditEvent.OccurredAt).HasPrecision(3);
        builder.Property(auditEvent => auditEvent.ActorType).HasMaxLength(20).IsUnicode(false);
        builder.Property(auditEvent => auditEvent.ActiveRoleCode).HasMaxLength(40).IsUnicode(false);
        builder.Property(auditEvent => auditEvent.ActionCode).HasMaxLength(100).IsUnicode(false);
        builder.Property(auditEvent => auditEvent.ResourceType).HasMaxLength(60).IsUnicode(false);
        builder.Property(auditEvent => auditEvent.ResourceId).HasMaxLength(64).IsUnicode(false);
        builder.Property(auditEvent => auditEvent.Outcome).HasMaxLength(20).IsUnicode(false);
        builder.Property(auditEvent => auditEvent.ReasonCode).HasMaxLength(100).IsUnicode(false);
        builder.Property(auditEvent => auditEvent.RequestId).HasMaxLength(64).IsUnicode(false);

        builder.HasIndex(auditEvent => new { auditEvent.ResourceType, auditEvent.ResourceId, auditEvent.OccurredAt })
            .HasDatabaseName("IX_AuditEvent_Resource");
        builder.HasIndex(auditEvent => new { auditEvent.ActorStaffUserId, auditEvent.OccurredAt })
            .HasDatabaseName("IX_AuditEvent_Staff")
            .HasFilter("[ActorStaffUserId] IS NOT NULL");
    }
}
