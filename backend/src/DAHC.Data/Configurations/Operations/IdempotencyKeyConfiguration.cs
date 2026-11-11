using DAHC.Data.Operations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DAHC.Data.Configurations.Operations;

public sealed class IdempotencyKeyConfiguration : IEntityTypeConfiguration<IdempotencyKey>
{
    public void Configure(EntityTypeBuilder<IdempotencyKey> builder)
    {
        ArgumentNullException.ThrowIfNull(builder);

        builder.ToTable(
            "IdempotencyKey",
            "ops",
            table => table.HasCheckConstraint("CK_IdempotencyKey_Length", "LEN([KeyValue]) >= 16"));

        builder.HasKey(key => key.IdempotencyKeyId).HasName("PK_IdempotencyKey");

        builder.Property(key => key.KeyScope).HasMaxLength(200).IsUnicode(false);
        builder.Property(key => key.KeyValue).HasMaxLength(128).IsUnicode(false);
        builder.Property(key => key.RequestHash).HasMaxLength(32).IsFixedLength();
        builder.Property(key => key.ResourceId).HasMaxLength(64).IsUnicode(false);
        builder.Property(key => key.CreatedAt).HasPrecision(3);
        builder.Property(key => key.ExpiresAt).HasPrecision(3);

        // Resolves two concurrent requests with the same key: the second insert fails and replays the first.
        builder.HasIndex(key => new { key.KeyScope, key.KeyValue })
            .IsUnique()
            .HasDatabaseName("UQ_IdempotencyKey");
        builder.HasIndex(key => key.ExpiresAt).HasDatabaseName("IX_IdempotencyKey_Expires");
    }
}
