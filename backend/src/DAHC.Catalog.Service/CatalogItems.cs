using DAHC.Catalog.Core;

namespace DAHC.Catalog.Service;

/// <summary>
/// A program offered in a cycle (contract <c>Program</c>). The window is returned in UTC with the IANA time zone
/// it was defined in.
/// </summary>
public sealed record ProgramItem(
    Guid Id,
    string Code,
    string Name,
    ProgramCategory Category,
    Guid CycleId,
    DateTimeOffset? ApplicationOpensAt,
    DateTimeOffset? ApplicationClosesAt,
    string TimeZoneId);

/// <summary>
/// An active specialty of a program (contract <c>Specialty</c>).
/// </summary>
public sealed record SpecialtyItem(Guid Id, string Code, string Name);

/// <summary>
/// An active training site of a specialty (contract <c>TrainingSite</c>).
/// </summary>
public sealed record TrainingSiteItem(Guid Id, string Code, string Name);
