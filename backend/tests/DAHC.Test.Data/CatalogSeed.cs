using DAHC.Catalog.Core;
using DAHC.Data;
using DAHC.Identity.Core;
using DAHC.Service.Access;

namespace DAHC.Test.Data;

/// <summary>
/// A residency program open in the 2027 cycle with two specialties and two sites, and candidates to apply.
/// </summary>
internal sealed class CatalogSeed
{
    public Guid CycleId { get; } = Guid.NewGuid();

    public Guid ProgramId { get; } = Guid.NewGuid();

    public Guid Cardiology { get; } = Guid.NewGuid();

    public Guid Surgery { get; } = Guid.NewGuid();

    public Guid RashidHospital { get; } = Guid.NewGuid();

    public Guid DubaiHospital { get; } = Guid.NewGuid();

    public async Task AddToAsync(DahcDbContext context, DateTimeOffset now)
    {
        AdmissionCycle cycle = new()
        {
            PublicId = this.CycleId,
            CycleCode = "2027/2028",
            StartDate = new DateOnly(2027, 1, 1),
            EndDate = new DateOnly(2027, 12, 31),
            IsActive = true,
        };
        CatalogProgram program = new()
        {
            PublicId = this.ProgramId,
            ProgramCode = "MED-RES",
            ProgramName = "Medical Residency",
            Category = ProgramCategory.Residency,
            DisciplineCode = "MEDICAL",
            MaxPreferences = 2,
            IsActive = true,
        };
        Specialty cardiology = new() { PublicId = this.Cardiology, SpecialtyCode = "CARD", SpecialtyName = "Cardiology", IsActive = true };
        Specialty surgery = new() { PublicId = this.Surgery, SpecialtyCode = "SURG", SpecialtyName = "Surgery", IsActive = true };
        TrainingSite rashid = new() { PublicId = this.RashidHospital, SiteCode = "RH", SiteName = "Rashid Hospital", IsActive = true };
        TrainingSite dubai = new() { PublicId = this.DubaiHospital, SiteCode = "DH", SiteName = "Dubai Hospital", IsActive = true };

        context.AddRange(cycle, program, cardiology, surgery, rashid, dubai);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        context.ProgramCycles.Add(new ProgramCycle
        {
            PublicId = Guid.NewGuid(),
            ProgramId = program.ProgramId,
            CycleId = cycle.CycleId,
            ApplicationOpensAt = now.AddDays(-5),
            ApplicationClosesAt = now.AddDays(30),
            TimeZoneId = "Asia/Dubai",
            IsActive = true,
        });
        ProgramSpecialty cardiologyInProgram = new() { ProgramId = program.ProgramId, SpecialtyId = cardiology.SpecialtyId, IsActive = true };
        ProgramSpecialty surgeryInProgram = new() { ProgramId = program.ProgramId, SpecialtyId = surgery.SpecialtyId, IsActive = true };
        context.ProgramSpecialties.AddRange(cardiologyInProgram, surgeryInProgram);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        context.SpecialtySites.AddRange(
            new SpecialtySite { ProgramSpecialtyId = cardiologyInProgram.ProgramSpecialtyId, SiteId = rashid.SiteId, IsActive = true },
            new SpecialtySite { ProgramSpecialtyId = cardiologyInProgram.ProgramSpecialtyId, SiteId = dubai.SiteId, IsActive = true },
            new SpecialtySite { ProgramSpecialtyId = surgeryInProgram.ProgramSpecialtyId, SiteId = rashid.SiteId, IsActive = true });
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);
    }

    public static async Task<CurrentUser> AddCandidateAsync(
        DahcDbContext context,
        string idamUserId,
        string candidateNumber,
        DateTimeOffset now)
    {
        Candidate candidate = new()
        {
            PublicId = Guid.NewGuid(),
            CandidateNumber = candidateNumber,
            IdamUserId = idamUserId,
            DisplayName = "Test Candidate",
            IsActive = true,
            CreatedAt = now.AddDays(-1),
        };

        context.Candidates.Add(candidate);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        CurrentUser user = new()
        {
            UserType = UserType.Candidate,
            PublicId = candidate.PublicId,
            InternalId = candidate.CandidateId,
            CandidateNumber = candidate.CandidateNumber,
            DisplayName = candidate.DisplayName,
            Roles = [RoleCodes.Candidate],
            ActiveRole = RoleCodes.Candidate,
            Culture = "en-AE",
            TimeZoneId = "Asia/Dubai",
        };

        return user;
    }
}
