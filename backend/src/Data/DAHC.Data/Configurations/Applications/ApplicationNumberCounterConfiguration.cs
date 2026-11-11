using DAHC.Applications.Core;
using DAHC.Catalog.Core;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DAHC.Data.Configurations.Applications;

public sealed class ApplicationNumberCounterConfiguration : IEntityTypeConfiguration<ApplicationNumberCounter>
{
    public void Configure(EntityTypeBuilder<ApplicationNumberCounter> builder)
    {
        ArgumentNullException.ThrowIfNull(builder);

        builder.ToTable(
            "ApplicationNumberCounter",
            "app",
            table =>
            {
                table.HasCheckConstraint("CK_ApplicationNumberCounter_Year", "[CycleStartYear] BETWEEN 1000 AND 9999");
                table.HasCheckConstraint("CK_ApplicationNumberCounter_Value", "[LastValue] BETWEEN 0 AND 9999999");
            });

        builder.HasKey(counter => counter.AdmissionCycleId).HasName("PK_ApplicationNumberCounter");

        builder.Property(counter => counter.AdmissionCycleId).ValueGeneratedNever();
        builder.Property<byte[]>("RowVersion").IsRowVersion();

        builder.HasIndex(counter => counter.CycleStartYear)
            .IsUnique()
            .HasDatabaseName("UQ_ApplicationNumberCounter_Year");

        builder.HasOne<AdmissionCycle>()
            .WithMany()
            .HasForeignKey(counter => counter.AdmissionCycleId)
            .HasConstraintName("FK_ApplicationNumberCounter_Cycle")
            .OnDelete(DeleteBehavior.Restrict);
    }
}
