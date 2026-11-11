using DAHC.Applications.Core;
using DAHC.Applications.Service;
using DAHC.Catalog.Core;
using DAHC.Data;
using DAHC.Data.Querying;
using DAHC.Service.Access;
using DAHC.Service.Paging;
using DAHC.Service.Results;
using Microsoft.EntityFrameworkCore;

namespace DAHC.Applications.Data;

/// <summary>
/// The candidate dashboard (US-1.2.1), limited to the candidate's own applications.
/// </summary>
internal sealed class CandidateDashboardService : ICandidateDashboardService
{
    private readonly DahcDbContext dbContext;

    private readonly ApplicationReader applicationReader;

    private readonly TimeProvider timeProvider;

    public CandidateDashboardService(
        DahcDbContext dbContext,
        ApplicationReader applicationReader,
        TimeProvider timeProvider)
    {
        this.dbContext = dbContext;
        this.applicationReader = applicationReader;
        this.timeProvider = timeProvider;
    }

    public async Task<Result<CandidateDashboard>> GetAsync(
        CurrentUser candidate,
        Guid? cycleId,
        PageQuery pageQuery,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(candidate);
        ArgumentNullException.ThrowIfNull(pageQuery);

        try
        {
            Result<Page<ApplicationView>> applications = await this.applicationReader.ReadPageAsync(
                candidate.InternalId,
                cycleId,
                pageQuery,
                cancellationToken);

            if (!applications.IsSuccess)
            {
                return applications.ToFailure<CandidateDashboard>();
            }

            StartNewApplicationState startNew = await this.EvaluateStartNewAsync(candidate, cancellationToken);
            Page<CandidateDashboardItem> items = applications.Value.Map(ToDashboardItem);

            return Result.Success(new CandidateDashboard(startNew, items));
        }
        catch (Exception exception) when (DahcDataException.IsDatabaseFailure(exception))
        {
            throw new DahcDataException("CandidateDashboardService.GetAsync", exception);
        }
    }

    private static CandidateDashboardItem ToDashboardItem(ApplicationView application)
    {
        IReadOnlyList<CandidateApplicationAction> allowedActions = DashboardRules.AllowedActions(application.Status);

        return new CandidateDashboardItem(application, application.Program.ApplicationClosesAt, allowedActions);
    }

    private async Task<StartNewApplicationState> EvaluateStartNewAsync(
        CurrentUser candidate,
        CancellationToken cancellationToken)
    {
        DateTimeOffset now = this.timeProvider.GetUtcNow();
        IQueryable<ProgramSpecialty> availableProgramSpecialties =
            CatalogAvailability.AvailableProgramSpecialties(this.dbContext);

        // Active program cycles are a small configuration set; the window rule is applied in memory by the
        // domain method so it is evaluated exactly as the create rule does.
        List<ProgramCycle> programCycles = await (
            from programCycle in this.dbContext.ProgramCycles
            join program in this.dbContext.Programs on programCycle.ProgramId equals program.ProgramId
            join cycle in this.dbContext.AdmissionCycles on programCycle.CycleId equals cycle.CycleId
            where programCycle.IsActive
                && program.IsActive
                && cycle.IsActive
                && availableProgramSpecialties.Any(
                    programSpecialty => programSpecialty.ProgramId == program.ProgramId)
            select programCycle)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        List<int> cyclesWithOpenProgram = programCycles
            .Where(programCycle => programCycle.IsOpenAt(now))
            .Select(programCycle => programCycle.CycleId)
            .Distinct()
            .ToList();

        DateTimeOffset? nextOpeningAt = programCycles
            .Where(programCycle => programCycle.ApplicationOpensAt > now)
            .Min(programCycle => programCycle.ApplicationOpensAt);

        List<int> cyclesWithActiveApplication = await this.dbContext.Applications
            .AsNoTracking()
            .Where(application => application.CandidateId == candidate.InternalId
                && application.Status != ApplicationStatus.Withdrawn
                && application.Status != ApplicationStatus.Archived)
            .Select(application => application.AdmissionCycleId)
            .Distinct()
            .ToListAsync(cancellationToken);

        return DashboardRules.EvaluateStartNew(cyclesWithOpenProgram, cyclesWithActiveApplication, nextOpeningAt);
    }
}
