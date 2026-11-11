using DAHC.Identity.Core;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DAHC.Data.Configurations.Identity;

public sealed class StaffRoleAssignmentConfiguration : IEntityTypeConfiguration<StaffRoleAssignment>
{
    public void Configure(EntityTypeBuilder<StaffRoleAssignment> builder)
    {
        ArgumentNullException.ThrowIfNull(builder);

        builder.ToTable(
            "StaffRoleAssignment",
            "idn",
            table => table.HasCheckConstraint(
                "CK_StaffRoleAssignment_Dates",
                "[ValidTo] IS NULL OR [ValidTo] >= [ValidFrom]"));

        builder.HasKey(assignment => assignment.StaffRoleAssignmentId).HasName("PK_StaffRoleAssignment");

        builder.Property(assignment => assignment.RoleCode).HasMaxLength(40).IsUnicode(false);

        builder.HasIndex(assignment => new { assignment.StaffUserId, assignment.RoleCode })
            .HasDatabaseName("IX_StaffRoleAssignment_User");

        builder.HasOne<StaffUser>()
            .WithMany()
            .HasForeignKey(assignment => assignment.StaffUserId)
            .HasConstraintName("FK_StaffRoleAssignment_User")
            .OnDelete(DeleteBehavior.Restrict);
    }
}
