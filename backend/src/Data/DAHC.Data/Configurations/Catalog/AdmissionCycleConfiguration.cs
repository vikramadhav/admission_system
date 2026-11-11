using DAHC.Catalog.Core;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DAHC.Data.Configurations.Catalog;

public sealed class AdmissionCycleConfiguration : IEntityTypeConfiguration<AdmissionCycle>
{
    public void Configure(EntityTypeBuilder<AdmissionCycle> builder)
    {
        ArgumentNullException.ThrowIfNull(builder);

        builder.ToTable(
            "AdmissionCycle",
            "cfg",
            table => table.HasCheckConstraint("CK_AdmissionCycle_Dates", "[EndDate] >= [StartDate]"));

        builder.HasKey(cycle => cycle.CycleId).HasName("PK_AdmissionCycle");
        builder.HasAlternateKey(cycle => cycle.PublicId).HasName("UQ_AdmissionCycle_PublicId");

        builder.Property(cycle => cycle.CycleCode).HasMaxLength(20).IsUnicode(false);

        builder.HasIndex(cycle => cycle.CycleCode).IsUnique().HasDatabaseName("UQ_AdmissionCycle_CycleCode");
    }
}
