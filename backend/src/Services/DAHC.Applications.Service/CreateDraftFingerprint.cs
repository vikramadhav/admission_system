using System.Globalization;
using System.Security.Cryptography;
using System.Text;

namespace DAHC.Applications.Service;

/// <summary>
/// A hash of a create-draft request, stored with its <c>Idempotency-Key</c>: replaying the key with the same
/// request returns the original outcome; with a different request it is refused.
/// </summary>
public static class CreateDraftFingerprint
{
    public static byte[] Compute(CreateDraftCommand command)
    {
        ArgumentNullException.ThrowIfNull(command);

        StringBuilder canonical = new();
        canonical.Append(command.CycleId.ToString("N")).Append('|');
        canonical.Append(command.ProgramId.ToString("N"));

        IEnumerable<PreferenceInput> orderedPreferences = command.Preferences
            .OrderBy(preference => preference.PreferenceOrder)
            .ThenBy(preference => preference.SpecialtyId);

        foreach (PreferenceInput preference in orderedPreferences)
        {
            canonical.Append('|').Append(preference.PreferenceOrder.ToString(CultureInfo.InvariantCulture));
            canonical.Append(':').Append(preference.SpecialtyId.ToString("N"));

            IEnumerable<TrainingSitePreferenceInput> orderedSites = preference.TrainingSites
                .OrderBy(site => site.SiteOrder)
                .ThenBy(site => site.SiteId);

            foreach (TrainingSitePreferenceInput site in orderedSites)
            {
                canonical.Append(';').Append(site.SiteOrder.ToString(CultureInfo.InvariantCulture));
                canonical.Append(':').Append(site.SiteId.ToString("N"));
            }
        }

        return SHA256.HashData(Encoding.UTF8.GetBytes(canonical.ToString()));
    }
}
