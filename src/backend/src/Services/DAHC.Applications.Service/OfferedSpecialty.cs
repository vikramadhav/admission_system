namespace DAHC.Applications.Service;

/// <summary>
/// A specialty a program offers in the cycle, with the internal ids of its active training sites keyed by the
/// site's public id.
/// </summary>
public sealed record OfferedSpecialty(int ProgramSpecialtyId, IReadOnlyDictionary<Guid, int> SpecialtySiteIds);
