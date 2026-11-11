using DAHC.Applications.Core;
using DAHC.Catalog.Core;
using DAHC.Data.Interceptors;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DAHC.Data.Configurations.Applications;

public sealed class ApplicationPreferenceSiteConfiguration : IEntityTypeConfiguration<ApplicationPreferenceSite>
{
    private const string NotDeletedFilter = "[IsDeleted] = 0";

    public void Configure(EntityTypeBuilder<ApplicationPreferenceSite> builder)
    {
        ArgumentNullException.ThrowIfNull(builder);

        builder.ToTable(
            "ApplicationPreferenceSite",
            "app",
            table => table.HasCheckConstraint("CK_ApplicationPreferenceSite_Order", "[SiteOrder] >= 1"));

        builder.HasKey(site => site.ApplicationPreferenceSiteId).HasName("PK_ApplicationPreferenceSite");

        builder.Property<bool>(SoftDeleteSaveChangesInterceptor.IsDeletedProperty);

        builder.HasQueryFilter(site => !EF.Property<bool>(site, SoftDeleteSaveChangesInterceptor.IsDeletedProperty));

        // AC10: a site cannot be chosen twice for one specialty.
        builder.HasIndex(site => new { site.ApplicationPreferenceId, site.SpecialtySiteId })
            .IsUnique()
            .HasDatabaseName("UQ_ApplicationPreferenceSite_Site")
            .HasFilter(NotDeletedFilter);
        builder.HasIndex(site => new { site.ApplicationPreferenceId, site.SiteOrder })
            .IsUnique()
            .HasDatabaseName("UQ_ApplicationPreferenceSite_Order")
            .HasFilter(NotDeletedFilter);

        // The composite key guarantees the chosen site belongs to the specialty of the preference.
        builder.HasOne<SpecialtySite>()
            .WithMany()
            .HasForeignKey(site => new { site.SpecialtySiteId, site.ProgramSpecialtyId })
            .HasPrincipalKey(specialtySite => new { specialtySite.SpecialtySiteId, specialtySite.ProgramSpecialtyId })
            .HasConstraintName("FK_ApplicationPreferenceSite_SpecialtySite")
            .OnDelete(DeleteBehavior.Restrict);
    }
}
