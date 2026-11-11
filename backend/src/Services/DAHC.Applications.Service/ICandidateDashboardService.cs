using DAHC.Service.Access;
using DAHC.Service.Paging;
using DAHC.Service.Results;

namespace DAHC.Applications.Service;

/// <summary>
/// The candidate dashboard (US-1.2.1), limited to the candidate in <see cref="CurrentUser"/>.
/// </summary>
public interface ICandidateDashboardService
{
    Task<Result<CandidateDashboard>> GetAsync(
        CurrentUser candidate,
        Guid? cycleId,
        PageQuery pageQuery,
        CancellationToken cancellationToken);
}
