using DAHC.Catalog.Core;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DAHC.Data.Configurations.Catalog;

public sealed class SpecialtySiteConfiguration : IEntityTypeConfiguration<SpecialtySite>
{
    public void Configure(EntityTypeBuilder<SpecialtySite> builder)
    {
        ArgumentNullException.ThrowIfNull(builder);

        builder.ToTable("SpecialtySite", "cfg");

        builder.HasKey(specialtySite => specialtySite.SpecialtySiteId).HasName("PK_SpecialtySite");

        // Target of the composite foreign key that keeps a candidate's chosen site inside the chosen specialty.
        builder.HasAlternateKey(specialtySite => new { specialtySite.SpecialtySiteId, specialtySite.ProgramSpecialtyId })
            .HasName("UQ_SpecialtySite_WithSpecialty");

        builder.HasIndex(specialtySite => new { specialtySite.ProgramSpecialtyId, specialtySite.SiteId })
            .IsUnique()
            .HasDatabaseName("UQ_SpecialtySite");

        builder.HasOne<ProgramSpecialty>()
            .WithMany()
            .HasForeignKey(specialtySite => specialtySite.ProgramSpecialtyId)
            .HasConstraintName("FK_SpecialtySite_ProgramSpecialty")
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<TrainingSite>()
            .WithMany()
            .HasForeignKey(specialtySite => specialtySite.SiteId)
            .HasConstraintName("FK_SpecialtySite_Site")
            .OnDelete(DeleteBehavior.Restrict);
    }
}
