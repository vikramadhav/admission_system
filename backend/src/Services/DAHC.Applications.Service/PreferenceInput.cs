namespace DAHC.Applications.Service;

/// <summary>
/// A specialty preference with its ordered training sites, addressed by catalog UUIDs (contract
/// <c>PreferenceInput</c>).
/// </summary>
public sealed record PreferenceInput(
    Guid SpecialtyId,
    int PreferenceOrder,
    IReadOnlyList<TrainingSitePreferenceInput> TrainingSites);

/// <summary>
/// A training site and its order within one preference (contract <c>TrainingSitePreferenceInput</c>).
/// </summary>
public sealed record TrainingSitePreferenceInput(Guid SiteId, int SiteOrder);
