using DAHC.Catalog.Core;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DAHC.Data.Configurations.Catalog;

public sealed class TrainingSiteConfiguration : IEntityTypeConfiguration<TrainingSite>
{
    public void Configure(EntityTypeBuilder<TrainingSite> builder)
    {
        ArgumentNullException.ThrowIfNull(builder);

        builder.ToTable("TrainingSite", "cfg");

        builder.HasKey(site => site.SiteId).HasName("PK_TrainingSite");
        builder.HasAlternateKey(site => site.PublicId).HasName("UQ_TrainingSite_PublicId");

        builder.Property(site => site.SiteCode).HasMaxLength(30).IsUnicode(false);
        builder.Property(site => site.SiteName).HasMaxLength(200);

        builder.HasIndex(site => site.SiteCode).IsUnique().HasDatabaseName("UQ_TrainingSite_Code");
    }
}
