using DAHC.Catalog.Core;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DAHC.Data.Configurations.Catalog;

public sealed class ProgramCycleConfiguration : IEntityTypeConfiguration<ProgramCycle>
{
    public void Configure(EntityTypeBuilder<ProgramCycle> builder)
    {
        ArgumentNullException.ThrowIfNull(builder);

        builder.ToTable(
            "ProgramCycle",
            "cfg",
            table => table.HasCheckConstraint(
                "CK_ProgramCycle_Window",
                "[ApplicationClosesAt] IS NULL OR [ApplicationOpensAt] IS NULL OR [ApplicationClosesAt] > [ApplicationOpensAt]"));

        builder.HasKey(programCycle => programCycle.ProgramCycleId).HasName("PK_ProgramCycle");
        builder.HasAlternateKey(programCycle => programCycle.PublicId).HasName("UQ_ProgramCycle_PublicId");

        builder.Property(programCycle => programCycle.ApplicationOpensAt).HasPrecision(3);
        builder.Property(programCycle => programCycle.ApplicationClosesAt).HasPrecision(3);
        builder.Property(programCycle => programCycle.TimeZoneId).HasMaxLength(64).IsUnicode(false);

        builder.HasIndex(programCycle => new { programCycle.ProgramId, programCycle.CycleId })
            .IsUnique()
            .HasDatabaseName("UQ_ProgramCycle_ProgramCycle");

        builder.HasOne<CatalogProgram>()
            .WithMany()
            .HasForeignKey(programCycle => programCycle.ProgramId)
            .HasConstraintName("FK_ProgramCycle_Program")
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<AdmissionCycle>()
            .WithMany()
            .HasForeignKey(programCycle => programCycle.CycleId)
            .HasConstraintName("FK_ProgramCycle_Cycle")
            .OnDelete(DeleteBehavior.Restrict);
    }
}
