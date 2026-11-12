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
            table => table.HasCheckConstraint(
                "CK_StaffUser_Culture",
                "[PreferredCulture] IS NULL OR [PreferredCulture] IN ('ar-AE','en-AE')"));

        builder.HasKey(staffUser => staffUser.StaffUserId).HasName("PK_StaffUser");
        builder.HasAlternateKey(staffUser => staffUser.PublicId).HasName("UQ_StaffUser_PublicId");

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
        builder.HasIndex(staffUser => staffUser.IdamUserId)
            .IsUnique()
            .HasDatabaseName("UX_StaffUser_IdamUserId")
            .HasFilter("[IdamUserId] IS NOT NULL");
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
