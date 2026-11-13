using DAHC.Identity.Core;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DAHC.Data.Configurations.Identity;

public sealed class DuplicateAccountPairConfiguration : IEntityTypeConfiguration<DuplicateAccountPair>
{
    public void Configure(EntityTypeBuilder<DuplicateAccountPair> builder)
    {
        ArgumentNullException.ThrowIfNull(builder);

        builder.ToTable(
            "DuplicateAccountPair",
            "idn",
            table =>
            {
                table.HasCheckConstraint(
                    "CK_DuplicateAccountPair_Matched",
                    "[MatchedOnEmiratesId] = 1 OR [MatchedOnPassport] = 1 OR [MatchedOnMobile] = 1");
                table.HasCheckConstraint(
                    "CK_DuplicateAccountPair_Distinct",
                    "[OriginalCandidateId] <> [DuplicateCandidateId]");
            });

        builder.HasKey(pair => pair.PairId).HasName("PK_DuplicateAccountPair");
        builder.HasAlternateKey(pair => pair.PublicId).HasName("UQ_DuplicateAccountPair_PublicId");

        builder.Property(pair => pair.DetectedAt).HasPrecision(3);

        builder.HasIndex(pair => new { pair.OriginalCandidateId, pair.DuplicateCandidateId })
            .IsUnique()
            .HasDatabaseName("UQ_DuplicateAccountPair");
        builder.HasIndex(pair => pair.DetectedAt).IsDescending().HasDatabaseName("IX_DuplicateAccountPair_DetectedAt");

        builder.HasOne<Candidate>()
            .WithMany()
            .HasForeignKey(pair => pair.OriginalCandidateId)
            .HasConstraintName("FK_DuplicateAccountPair_Original")
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(pair => pair.DuplicateCandidate)
            .WithMany()
            .HasForeignKey(pair => pair.DuplicateCandidateId)
            .HasConstraintName("FK_DuplicateAccountPair_Duplicate")
            .OnDelete(DeleteBehavior.Restrict);
    }
}
