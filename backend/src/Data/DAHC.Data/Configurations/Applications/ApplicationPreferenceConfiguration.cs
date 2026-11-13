using DAHC.Applications.Core;
using DAHC.Catalog.Core;
using DAHC.Data.Interceptors;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DAHC.Data.Configurations.Applications;

/// <summary>
/// Preferences replaced by a draft save are kept for audit: they are soft-deleted, so the unique indexes only
/// cover rows that are not deleted.
/// </summary>
public sealed class ApplicationPreferenceConfiguration : IEntityTypeConfiguration<ApplicationPreference>
{
    private const string NotDeletedFilter = "[IsDeleted] = 0";

    public void Configure(EntityTypeBuilder<ApplicationPreference> builder)
    {
        ArgumentNullException.ThrowIfNull(builder);

        builder.ToTable(
            "ApplicationPreference",
            "app",
            table => table.HasCheckConstraint("CK_ApplicationPreference_Order", "[PreferenceOrder] BETWEEN 1 AND 2"));

        builder.HasKey(preference => preference.ApplicationPreferenceId).HasName("PK_ApplicationPreference");

        builder.Property(preference => preference.CreatedAt).HasPrecision(3);
        builder.Property<bool>(SoftDeleteSaveChangesInterceptor.IsDeletedProperty);

        builder.HasQueryFilter(
            preference => !EF.Property<bool>(preference, SoftDeleteSaveChangesInterceptor.IsDeletedProperty));

        builder.HasIndex(preference => new { preference.ApplicationId, preference.PreferenceOrder })
            .IsUnique()
            .HasDatabaseName("UQ_ApplicationPreference_Order")
            .HasFilter(NotDeletedFilter);

        // AC11: both preferences cannot be the same specialty.
        builder.HasIndex(preference => new { preference.ApplicationId, preference.ProgramSpecialtyId })
            .IsUnique()
            .HasDatabaseName("UQ_ApplicationPreference_Specialty")
            .HasFilter(NotDeletedFilter);

        builder.HasOne<ProgramSpecialty>()
            .WithMany()
            .HasForeignKey(preference => preference.ProgramSpecialtyId)
            .HasConstraintName("FK_ApplicationPreference_ProgramSpecialty")
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(preference => preference.Sites)
            .WithOne()
            .HasForeignKey(site => site.ApplicationPreferenceId)
            .HasConstraintName("FK_ApplicationPreferenceSite_Preference")
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(preference => preference.Sites).UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
