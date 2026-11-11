using DAHC.Catalog.Core;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DAHC.Data.Configurations.Catalog;

public sealed class ProgramSpecialtyConfiguration : IEntityTypeConfiguration<ProgramSpecialty>
{
    public void Configure(EntityTypeBuilder<ProgramSpecialty> builder)
    {
        ArgumentNullException.ThrowIfNull(builder);

        builder.ToTable("ProgramSpecialty", "cfg");

        builder.HasKey(programSpecialty => programSpecialty.ProgramSpecialtyId).HasName("PK_ProgramSpecialty");

        builder.HasIndex(programSpecialty => new { programSpecialty.ProgramId, programSpecialty.SpecialtyId })
            .IsUnique()
            .HasDatabaseName("UQ_ProgramSpecialty");

        builder.HasOne<CatalogProgram>()
            .WithMany()
            .HasForeignKey(programSpecialty => programSpecialty.ProgramId)
            .HasConstraintName("FK_ProgramSpecialty_Program")
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<Specialty>()
            .WithMany()
            .HasForeignKey(programSpecialty => programSpecialty.SpecialtyId)
            .HasConstraintName("FK_ProgramSpecialty_Specialty")
            .OnDelete(DeleteBehavior.Restrict);
    }
}
