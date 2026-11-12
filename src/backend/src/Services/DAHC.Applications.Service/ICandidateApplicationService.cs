using DAHC.Service.Access;
using DAHC.Service.Paging;
using DAHC.Service.Results;

namespace DAHC.Applications.Service;

/// <summary>
/// The candidate's own applications (US-1.2.1, US-1.3.1, US-1.3.11). Every operation is limited to the
/// candidate in <see cref="CurrentUser"/>; another candidate's application is reported as not found.
/// </summary>
public interface ICandidateApplicationService
{
    Task<Result<Page<ApplicationView>>> ListAsync(
        CurrentUser candidate,
        Guid? cycleId,
        PageQuery pageQuery,
        CancellationToken cancellationToken);

    Task<Result<ApplicationView>> GetAsync(
        CurrentUser candidate,
        Guid applicationId,
        CancellationToken cancellationToken);

    Task<Result<ApplicationView>> CreateDraftAsync(
        CurrentUser candidate,
        CreateDraftCommand command,
        CancellationToken cancellationToken);

    Task<Result<ApplicationView>> UpdateDraftAsync(
        CurrentUser candidate,
        UpdateDraftCommand command,
        CancellationToken cancellationToken);
}
