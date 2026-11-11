using DAHC.Catalog.Core;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DAHC.Data.Configurations.Catalog;

public sealed class CatalogProgramConfiguration : IEntityTypeConfiguration<CatalogProgram>
{
    public void Configure(EntityTypeBuilder<CatalogProgram> builder)
    {
        ArgumentNullException.ThrowIfNull(builder);

        builder.ToTable(
            "Program",
            "cfg",
            table => table.HasCheckConstraint("CK_Program_MaxPreferences", "[MaxPreferences] BETWEEN 1 AND 2"));

        builder.HasKey(program => program.ProgramId).HasName("PK_Program");
        builder.HasAlternateKey(program => program.PublicId).HasName("UQ_Program_PublicId");

        builder.Property(program => program.ProgramCode).HasMaxLength(30).IsUnicode(false);
        builder.Property(program => program.ProgramName).HasMaxLength(200);
        builder.Property(program => program.Category)
            .HasColumnName("CategoryCode")
            .HasMaxLength(30)
            .IsUnicode(false)
            .HasConversion(new EnumCodeConverter<ProgramCategory>());
        builder.Property(program => program.DisciplineCode).HasMaxLength(30).IsUnicode(false);

        builder.HasIndex(program => program.ProgramCode).IsUnique().HasDatabaseName("UQ_Program_ProgramCode");
    }
}
