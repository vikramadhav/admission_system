using DAHC.Applications.Core;
using DAHC.Catalog.Core;
using DAHC.Identity.Core;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DAHC.Data.Configurations.Applications;

public sealed class CandidateApplicationConfiguration : IEntityTypeConfiguration<CandidateApplication>
{
    public void Configure(EntityTypeBuilder<CandidateApplication> builder)
    {
        ArgumentNullException.ThrowIfNull(builder);

        builder.ToTable(
            "Application",
            "app",
            table =>
            {
                table.HasCheckConstraint(
                    "CK_Application_Number",
                    "[ApplicationNumber] LIKE '[1-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'");
                table.HasCheckConstraint("CK_Application_VersionNo", "[VersionNo] >= 1");
                table.HasCheckConstraint(
                    "CK_Application_Submitted",
                    "[StatusCode] IN ('DRAFT','ARCHIVED') OR [SubmittedAt] IS NOT NULL");
            });

        builder.HasKey(application => application.ApplicationId).HasName("PK_Application");
        builder.HasAlternateKey(application => application.PublicId).HasName("UQ_Application_PublicId");

        builder.Property(application => application.ApplicationNumber)
            .HasMaxLength(11)
            .IsFixedLength()
            .IsUnicode(false);
        builder.Property(application => application.Status)
            .HasColumnName("StatusCode")
            .HasMaxLength(40)
            .IsUnicode(false)
            .HasConversion(new EnumCodeConverter<ApplicationStatus>());

        // The ETag version: a stale If-Match is refused before the save, and this token catches a writer that
        // changed the draft between the read and the save.
        builder.Property(application => application.VersionNo).IsConcurrencyToken();
        builder.Property(application => application.CreatedAt).HasPrecision(3);
        builder.Property(application => application.LastSavedAt).HasPrecision(3);
        builder.Property(application => application.SubmittedAt).HasPrecision(3);
        builder.Property<byte[]>("RowVersion").IsRowVersion();

        builder.HasIndex(application => application.ApplicationNumber)
            .IsUnique()
            .HasDatabaseName("UQ_Application_Number");

        // Protects the invariant "one active application per candidate per cycle" (US-1.2.1 business rule 1)
        // against concurrent creates; the service checks it first only to return a clear conflict.
        builder.HasIndex(application => new { application.CandidateId, application.AdmissionCycleId })
            .IsUnique()
            .HasDatabaseName("UX_Application_LivePerCandidateCycle")
            .HasFilter("[StatusCode] <> 'WITHDRAWN' AND [StatusCode] <> 'ARCHIVED'");
        builder.HasIndex(application => new { application.CandidateId, application.Status })
            .HasDatabaseName("IX_Application_Candidate");

        builder.HasOne<Candidate>()
            .WithMany()
            .HasForeignKey(application => application.CandidateId)
            .HasConstraintName("FK_Application_Candidate")
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<AdmissionCycle>()
            .WithMany()
            .HasForeignKey(application => application.AdmissionCycleId)
            .HasConstraintName("FK_Application_AdmissionCycle")
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<ProgramCycle>()
            .WithMany()
            .HasForeignKey(application => application.ProgramCycleId)
            .HasConstraintName("FK_Application_ProgramCycle")
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(application => application.Preferences)
            .WithOne()
            .HasForeignKey(preference => preference.ApplicationId)
            .HasConstraintName("FK_ApplicationPreference_Application")
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(application => application.Preferences).UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
