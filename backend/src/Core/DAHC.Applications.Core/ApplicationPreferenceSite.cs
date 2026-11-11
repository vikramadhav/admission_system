namespace DAHC.Applications.Core;

/// <summary>
/// A training site chosen for a specialty preference, in the candidate's order (<c>app.ApplicationPreferenceSite</c>).
/// </summary>
public sealed class ApplicationPreferenceSite
{
    public long ApplicationPreferenceSiteId { get; set; }

    public long ApplicationPreferenceId { get; set; }

    public required int ProgramSpecialtyId { get; set; }

    public required int SpecialtySiteId { get; set; }

    public required byte SiteOrder { get; set; }
}
