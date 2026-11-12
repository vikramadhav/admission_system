using DAHC.Identity.Core;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DAHC.Data.Configurations.Identity;

public sealed class IntegrationClientConfiguration : IEntityTypeConfiguration<IntegrationClient>
{
    public void Configure(EntityTypeBuilder<IntegrationClient> builder)
    {
        ArgumentNullException.ThrowIfNull(builder);

        builder.ToTable("IntegrationClient", "idn");

        builder.HasKey(client => client.IntegrationClientId).HasName("PK_IntegrationClient");
        builder.HasAlternateKey(client => client.PublicId).HasName("UQ_IntegrationClient_PublicId");

        builder.Property(client => client.IdamClientId).HasMaxLength(200).IsUnicode(false);
        builder.Property(client => client.Name).HasMaxLength(200);
        builder.Property(client => client.CreatedAt).HasPrecision(3);
        builder.Property(client => client.UpdatedAt).HasPrecision(3);
        builder.Property<byte[]>("RowVersion").IsRowVersion();

        builder.HasIndex(client => client.IdamClientId).IsUnique().HasDatabaseName("UQ_IntegrationClient_IdamClientId");
    }
}
