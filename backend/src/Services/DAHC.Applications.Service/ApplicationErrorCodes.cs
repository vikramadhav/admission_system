namespace DAHC.Applications.Service;

/// <summary>
/// Error and message codes of the application endpoints (contract <c>Problem.code</c>, <c>messageCode</c>).
/// </summary>
public static class ApplicationErrorCodes
{
    public const string ActiveApplicationExists = "application.active_exists";

    public const string NotEditable = "application.not_editable";

    public const string ProgramNotOpen = "application.program_not_open";

    public const string InvalidPreferences = "application.invalid_preferences";

    public const string NoneActive = "applications.none_active";

    public const string PreferenceCountInvalid = "preferences.count_invalid";

    public const string PreferenceOrderInvalid = "preferences.order_invalid";

    public const string DuplicateSpecialty = "preferences.duplicate_specialty";

    public const string SpecialtyUnavailable = "preferences.specialty_unavailable";

    public const string SitesRequired = "preferences.sites_required";

    public const string SiteOrderInvalid = "preferences.site_order_invalid";

    public const string DuplicateSite = "preferences.duplicate_site";

    public const string SiteUnavailable = "preferences.site_unavailable";
}
