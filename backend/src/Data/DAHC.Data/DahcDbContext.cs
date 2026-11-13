using DAHC.Applications.Core;
using DAHC.Catalog.Core;
using DAHC.Data.Configurations.Applications;
using DAHC.Data.Configurations.Catalog;
using DAHC.Data.Configurations.Identity;
using DAHC.Data.Configurations.Operations;
using DAHC.Data.Operations;
using DAHC.Identity.Core;
using Microsoft.EntityFrameworkCore;

namespace DAHC.Data;

/// <summary>
/// The one database context of the solution (D-22). Each module contributes its entity configurations; audit and
/// business writes share one save and one transaction.
/// </summary>
public sealed class DahcDbContext : DbContext
{
    public DahcDbContext(DbContextOptions<DahcDbContext> options)
        : base(options)
    {
    }

    public DbSet<Candidate> Candidates => this.Set<Candidate>();

    public DbSet<StaffUser> StaffUsers => this.Set<StaffUser>();

    public DbSet<StaffRoleAssignment> StaffRoleAssignments => this.Set<StaffRoleAssignment>();

    public DbSet<DuplicateAccountPair> DuplicateAccountPairs => this.Set<DuplicateAccountPair>();

    public DbSet<IntegrationClient> IntegrationClients => this.Set<IntegrationClient>();

    public DbSet<AdmissionCycle> AdmissionCycles => this.Set<AdmissionCycle>();

    public DbSet<CatalogProgram> Programs => this.Set<CatalogProgram>();

    public DbSet<ProgramCycle> ProgramCycles => this.Set<ProgramCycle>();

    public DbSet<Specialty> Specialties => this.Set<Specialty>();

    public DbSet<ProgramSpecialty> ProgramSpecialties => this.Set<ProgramSpecialty>();

    public DbSet<TrainingSite> TrainingSites => this.Set<TrainingSite>();

    public DbSet<SpecialtySite> SpecialtySites => this.Set<SpecialtySite>();

    public DbSet<CandidateApplication> Applications => this.Set<CandidateApplication>();

    public DbSet<ApplicationPreference> ApplicationPreferences => this.Set<ApplicationPreference>();

    public DbSet<ApplicationPreferenceSite> ApplicationPreferenceSites => this.Set<ApplicationPreferenceSite>();

    public DbSet<AuditEvent> AuditEvents => this.Set<AuditEvent>();

    public DbSet<IdempotencyKey> IdempotencyKeys => this.Set<IdempotencyKey>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        ArgumentNullException.ThrowIfNull(modelBuilder);

        // D-05: the single source of candidate numbers; it never cycles.
        modelBuilder.HasSequence<int>("CandidateNumberSeq", "idn")
            .StartsAt(1)
            .IncrementsBy(1)
            .HasMin(1)
            .HasMax(999_999_999)
            .IsCyclic(false);

        modelBuilder.ApplyConfiguration(new CandidateConfiguration());
        modelBuilder.ApplyConfiguration(new StaffUserConfiguration());
        modelBuilder.ApplyConfiguration(new StaffRoleAssignmentConfiguration());
        modelBuilder.ApplyConfiguration(new DuplicateAccountPairConfiguration());
        modelBuilder.ApplyConfiguration(new IntegrationClientConfiguration());

        modelBuilder.ApplyConfiguration(new AdmissionCycleConfiguration());
        modelBuilder.ApplyConfiguration(new CatalogProgramConfiguration());
        modelBuilder.ApplyConfiguration(new ProgramCycleConfiguration());
        modelBuilder.ApplyConfiguration(new SpecialtyConfiguration());
        modelBuilder.ApplyConfiguration(new ProgramSpecialtyConfiguration());
        modelBuilder.ApplyConfiguration(new TrainingSiteConfiguration());
        modelBuilder.ApplyConfiguration(new SpecialtySiteConfiguration());

        modelBuilder.ApplyConfiguration(new CandidateApplicationConfiguration());
        modelBuilder.ApplyConfiguration(new ApplicationPreferenceConfiguration());
        modelBuilder.ApplyConfiguration(new ApplicationPreferenceSiteConfiguration());
        modelBuilder.ApplyConfiguration(new ApplicationNumberCounterConfiguration());

        modelBuilder.ApplyConfiguration(new AuditEventConfiguration());
        modelBuilder.ApplyConfiguration(new IdempotencyKeyConfiguration());
    }
}
