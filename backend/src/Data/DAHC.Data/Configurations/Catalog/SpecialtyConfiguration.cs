using DAHC.Catalog.Core;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DAHC.Data.Configurations.Catalog;

public sealed class SpecialtyConfiguration : IEntityTypeConfiguration<Specialty>
{
    public void Configure(EntityTypeBuilder<Specialty> builder)
    {
        ArgumentNullException.ThrowIfNull(builder);

        builder.ToTable("Specialty", "cfg");

        builder.HasKey(specialty => specialty.SpecialtyId).HasName("PK_Specialty");
        builder.HasAlternateKey(specialty => specialty.PublicId).HasName("UQ_Specialty_PublicId");

        builder.Property(specialty => specialty.SpecialtyCode).HasMaxLength(30).IsUnicode(false);
        builder.Property(specialty => specialty.SpecialtyName).HasMaxLength(200);

        builder.HasIndex(specialty => specialty.SpecialtyCode).IsUnique().HasDatabaseName("UQ_Specialty_Code");
    }
}
