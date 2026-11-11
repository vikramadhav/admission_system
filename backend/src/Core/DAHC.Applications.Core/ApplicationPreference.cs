namespace DAHC.Applications.Core;

/// <summary>
/// A specialty preference of an application (<c>app.ApplicationPreference</c>). Preference 1 is the reference
/// specialty; preference 2 is optional where the program allows it.
/// </summary>
public sealed class ApplicationPreference
{
    private readonly List<ApplicationPreferenceSite> sites = [];

    public long ApplicationPreferenceId { get; set; }

    public long ApplicationId { get; set; }

    public required byte PreferenceOrder { get; set; }

    public required int ProgramSpecialtyId { get; set; }

    public required DateTimeOffset CreatedAt { get; set; }

    public IReadOnlyCollection<ApplicationPreferenceSite> Sites => this.sites;

    public void AddSite(ApplicationPreferenceSite site)
    {
        ArgumentNullException.ThrowIfNull(site);

        this.sites.Add(site);
    }
}
