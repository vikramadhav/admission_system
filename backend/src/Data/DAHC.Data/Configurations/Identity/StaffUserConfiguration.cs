using DAHC.Identity.Core;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DAHC.Data.Configurations.Identity;

public sealed class StaffUserConfiguration : IEntityTypeConfiguration<StaffUser>
{
    public void Configure(EntityTypeBuilder<StaffUser> builder)
    {
        ArgumentNullException.ThrowIfNull(builder);

        builder.ToTable(
            "StaffUser",
            "idn",
            table =>
            {
                table.HasCheckConstraint(
                    "CK_StaffUser_Culture",
                    "[PreferredCulture] IS NULL OR [PreferredCulture] IN ('ar-AE','en-AE')");

                // An identity is the issuer and subject together, so neither is set without the other (DEC-01).
                table.HasCheckConstraint(
                    "CK_StaffUser_IdamIdentity",
                    "([IdamIssuer] IS NULL AND [IdamUserId] IS NULL) "
                    + "OR ([IdamIssuer] IS NOT NULL AND [IdamUserId] IS NOT NULL)");
            });

        builder.HasKey(staffUser => staffUser.StaffUserId).HasName("PK_StaffUser");
        builder.HasAlternateKey(staffUser => staffUser.PublicId).HasName("UQ_StaffUser_PublicId");

        builder.Property(staffUser => staffUser.IdamIssuer).HasMaxLength(400).IsUnicode(false);
        builder.Property(staffUser => staffUser.IdamUserId).HasMaxLength(200).IsUnicode(false);
        builder.Property(staffUser => staffUser.DisplayName).HasMaxLength(200);
        builder.Property(staffUser => staffUser.Email).HasMaxLength(320);
        builder.Property(staffUser => staffUser.ActiveRoleCode).HasMaxLength(40).IsUnicode(false);
        builder.Property(staffUser => staffUser.PreferredCulture).HasMaxLength(10).IsUnicode(false);
        builder.Property(staffUser => staffUser.PreferredTimeZoneId).HasMaxLength(64).IsUnicode(false);
        builder.Property(staffUser => staffUser.CreatedAt).HasPrecision(3);
        builder.Property(staffUser => staffUser.UpdatedAt).HasPrecision(3);
        builder.Property<byte[]>("RowVersion").IsRowVersion();

        builder.HasIndex(staffUser => staffUser.Email).IsUnique().HasDatabaseName("UQ_StaffUser_Email");
        // Issuer and subject together, never the subject alone (AP-04, DEC-01).
        builder.HasIndex(staffUser => new { staffUser.IdamIssuer, staffUser.IdamUserId })
            .IsUnique()
            .HasDatabaseName("UX_StaffUser_IdamIdentity")
            .HasFilter("[IdamIssuer] IS NOT NULL AND [IdamUserId] IS NOT NULL");
        builder.HasIndex(staffUser => staffUser.LinkedCandidatePublicId)
            .IsUnique()
            .HasDatabaseName("UX_StaffUser_LinkedCandidate")
            .HasFilter("[LinkedCandidatePublicId] IS NOT NULL");

        builder.HasOne<Candidate>()
            .WithMany()
            .HasForeignKey(staffUser => staffUser.LinkedCandidatePublicId)
            .HasPrincipalKey(candidate => candidate.PublicId)
            .HasConstraintName("FK_StaffUser_LinkedCandidate")
            .OnDelete(DeleteBehavior.Restrict);
    }
}
