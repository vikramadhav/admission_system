using DAHC.Service.Paging;
using DAHC.Service.Results;

namespace DAHC.Catalog.Service;

/// <summary>
/// Program, specialty and training-site discovery (US-1.3.1). Only active, configured items are returned: a
/// program without an available specialty and a specialty without an active site are omitted (AC2, AC5).
/// </summary>
public interface ICatalogService
{
    Task<Result<Page<ProgramItem>>> ListProgramsAsync(
        Guid cycleId,
        PageQuery pageQuery,
        CancellationToken cancellationToken);

    Task<Result<Page<SpecialtyItem>>> ListSpecialtiesAsync(
        Guid programId,
        PageQuery pageQuery,
        CancellationToken cancellationToken);

    Task<Result<Page<TrainingSiteItem>>> ListTrainingSitesAsync(
        Guid specialtyId,
        PageQuery pageQuery,
        CancellationToken cancellationToken);
}
