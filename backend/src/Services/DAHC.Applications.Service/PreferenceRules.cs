using DAHC.Service.Results;

namespace DAHC.Applications.Service;

/// <summary>
/// Preference and training-site rules of US-1.3.1, checked against what the program offers in the cycle.
/// </summary>
public static class PreferenceRules
{
    public static IReadOnlyList<ValidationIssue> Validate(
        IReadOnlyList<PreferenceInput> preferences,
        int maxPreferences,
        IReadOnlyDictionary<Guid, OfferedSpecialty> offeredSpecialties)
    {
        ArgumentNullException.ThrowIfNull(preferences);
        ArgumentNullException.ThrowIfNull(offeredSpecialties);

        List<ValidationIssue> issues = [];

        if (preferences.Count < 1
            || preferences.Count > maxPreferences)
        {
            issues.Add(new ValidationIssue(ApplicationErrorCodes.PreferenceCountInvalid, "/preferences"));

            return issues;
        }

        if (!IsSequenceFromOne(preferences.Select(preference => preference.PreferenceOrder)))
        {
            issues.Add(new ValidationIssue(ApplicationErrorCodes.PreferenceOrderInvalid, "/preferences"));
        }

        HashSet<Guid> seenSpecialties = [];

        for (int index = 0; index < preferences.Count; index++)
        {
            PreferenceInput preference = preferences[index];
            string pointer = $"/preferences/{index}";

            if (!seenSpecialties.Add(preference.SpecialtyId))
            {
                // AC11: both preferences cannot be the same specialty.
                issues.Add(new ValidationIssue(ApplicationErrorCodes.DuplicateSpecialty, pointer + "/specialtyId"));

                continue;
            }

            bool isOffered = offeredSpecialties.TryGetValue(preference.SpecialtyId, out OfferedSpecialty? offered);

            if (!isOffered
                || offered is null)
            {
                issues.Add(new ValidationIssue(ApplicationErrorCodes.SpecialtyUnavailable, pointer + "/specialtyId"));

                continue;
            }

            AddSiteIssues(preference.TrainingSites, offered, pointer, issues);
        }

        return issues;
    }

    private static void AddSiteIssues(
        IReadOnlyList<TrainingSitePreferenceInput> sites,
        OfferedSpecialty offered,
        string preferencePointer,
        List<ValidationIssue> issues)
    {
        string sitesPointer = preferencePointer + "/trainingSites";

        if (sites.Count == 0)
        {
            // AC7: at least one site per selected specialty.
            issues.Add(new ValidationIssue(ApplicationErrorCodes.SitesRequired, sitesPointer));

            return;
        }

        if (!IsSequenceFromOne(sites.Select(site => site.SiteOrder)))
        {
            issues.Add(new ValidationIssue(ApplicationErrorCodes.SiteOrderInvalid, sitesPointer));
        }

        HashSet<Guid> seenSites = [];

        for (int index = 0; index < sites.Count; index++)
        {
            TrainingSitePreferenceInput site = sites[index];
            string sitePointer = $"{sitesPointer}/{index}/siteId";

            if (!seenSites.Add(site.SiteId))
            {
                // AC10: a site cannot be chosen twice for the same specialty.
                issues.Add(new ValidationIssue(ApplicationErrorCodes.DuplicateSite, sitePointer));
            }
            else if (!offered.SpecialtySiteIds.ContainsKey(site.SiteId))
            {
                issues.Add(new ValidationIssue(ApplicationErrorCodes.SiteUnavailable, sitePointer));
            }
        }
    }

    private static bool IsSequenceFromOne(IEnumerable<int> orders)
    {
        List<int> sortedOrders = orders.Order().ToList();

        for (int index = 0; index < sortedOrders.Count; index++)
        {
            if (sortedOrders[index] != index + 1)
            {
                return false;
            }
        }

        return true;
    }
}
