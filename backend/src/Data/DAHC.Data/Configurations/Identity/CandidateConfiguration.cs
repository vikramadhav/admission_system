using DAHC.Identity.Core;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DAHC.Data.Configurations.Identity;

public sealed class CandidateConfiguration : IEntityTypeConfiguration<Candidate>
{
    public void Configure(EntityTypeBuilder<Candidate> builder)
    {
        ArgumentNullException.ThrowIfNull(builder);

        builder.ToTable(
            "Candidate",
            "idn",
            table =>
            {
                table.HasCheckConstraint(
                    "CK_Candidate_Number",
                    "[CandidateNumber] LIKE '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'");
                table.HasCheckConstraint(
                    "CK_Candidate_Culture",
                    "[PreferredCulture] IS NULL OR [PreferredCulture] IN ('ar-AE','en-AE')");
            });

        builder.HasKey(candidate => candidate.CandidateId).HasName("PK_Candidate");
        builder.HasAlternateKey(candidate => candidate.PublicId).HasName("UQ_Candidate_PublicId");

        builder.Property(candidate => candidate.CandidateNumber).HasMaxLength(9).IsFixedLength().IsUnicode(false);
        builder.Property(candidate => candidate.IdamIssuer).HasMaxLength(400).IsUnicode(false);
        builder.Property(candidate => candidate.IdamUserId).HasMaxLength(200).IsUnicode(false);
        builder.Property(candidate => candidate.DisplayName).HasMaxLength(200);
        builder.Property(candidate => candidate.Email).HasMaxLength(320);
        builder.Property(candidate => candidate.MobileNumber).HasMaxLength(25).IsUnicode(false);
        builder.Property(candidate => candidate.PreferredCulture).HasMaxLength(10).IsUnicode(false);
        builder.Property(candidate => candidate.PreferredTimeZoneId).HasMaxLength(64).IsUnicode(false);
        builder.Property(candidate => candidate.EmiratesIdNumber).HasMaxLength(20).IsUnicode(false);
        builder.Property(candidate => candidate.PassportNumber).HasMaxLength(20).IsUnicode(false);
        builder.Property(candidate => candidate.CreatedAt).HasPrecision(3);
        builder.Property(candidate => candidate.UpdatedAt).HasPrecision(3);
        builder.Property<byte[]>("RowVersion").IsRowVersion();

        builder.HasIndex(candidate => candidate.CandidateNumber).IsUnique().HasDatabaseName("UQ_Candidate_Number");

        // The only match key at sign-in: issuer and subject together, never the subject alone (AP-04, DEC-01).
        // Also resolves concurrent first sign-ins (standard s.15).
        builder.HasIndex(candidate => new { candidate.IdamIssuer, candidate.IdamUserId })
            .IsUnique()
            .HasDatabaseName("UQ_Candidate_IdamIdentity");

        // Deliberately not unique: a duplicate account must be insertable so the pair can be recorded (US-1.1.1).
        builder.HasIndex(candidate => candidate.EmiratesIdNumber)
            .HasDatabaseName("IX_Candidate_EmiratesIdNumber")
            .HasFilter("[EmiratesIdNumber] IS NOT NULL");
        builder.HasIndex(candidate => candidate.PassportNumber)
            .HasDatabaseName("IX_Candidate_PassportNumber")
            .HasFilter("[PassportNumber] IS NOT NULL");
        builder.HasIndex(candidate => candidate.MobileNumber)
            .HasDatabaseName("IX_Candidate_MobileNumber")
            .HasFilter("[MobileNumber] IS NOT NULL");
    }
}
