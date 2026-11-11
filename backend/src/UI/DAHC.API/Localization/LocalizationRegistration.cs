using System.Globalization;
using DAHC.Service.Access;
using DAHC.Service.Time;
using Microsoft.AspNetCore.Localization;

namespace DAHC.API.Localization;

/// <summary>
/// Request culture from the user's stored preference, then <c>Accept-Language</c>, then the default; only the
/// supported cultures are accepted (standard s.14).
/// </summary>
public static class LocalizationRegistration
{
    public static IServiceCollection AddDahcLocalization(this IServiceCollection services)
    {
        ArgumentNullException.ThrowIfNull(services);

        services.AddLocalization();

        return services;
    }

    public static WebApplication UseDahcRequestLocalization(this WebApplication app)
    {
        ArgumentNullException.ThrowIfNull(app);

        LocaleSettings locale = app.Services.GetRequiredService<LocaleSettings>();
        CultureInfo[] cultures = locale.SupportedCultures.Select(CultureInfo.GetCultureInfo).ToArray();

        RequestLocalizationOptions options = new()
        {
            DefaultRequestCulture = new RequestCulture(locale.DefaultCulture),
            SupportedCultures = cultures,
            SupportedUICultures = cultures,
            ApplyCurrentCultureToResponseHeaders = true,
            RequestCultureProviders =
            [
                new CustomRequestCultureProvider(ReadUserPreferenceAsync),
                new AcceptLanguageHeaderRequestCultureProvider(),
            ],
        };

        app.UseRequestLocalization(options);

        return app;
    }

    private static Task<ProviderCultureResult?> ReadUserPreferenceAsync(HttpContext httpContext)
    {
        CurrentUser? user = httpContext.RequestServices.GetRequiredService<CurrentAccess>().User;
        ProviderCultureResult? result = user is null ? null : new ProviderCultureResult(user.Culture);

        return Task.FromResult(result);
    }
}
