using DAHC.Service.Access;
using DAHC.Service.Time;
using Microsoft.Extensions.Options;

namespace DAHC.API.Configuration;

/// <summary>
/// Strongly typed options, validated at startup. A bad value stops the application with a message naming the
/// setting, never its value (standard s.13).
/// </summary>
public static class OptionsRegistration
{
    public static WebApplicationBuilder AddDahcOptions(this WebApplicationBuilder builder)
    {
        ArgumentNullException.ThrowIfNull(builder);

        IServiceCollection services = builder.Services;
        IConfiguration configuration = builder.Configuration;
        bool isDevelopment = builder.Environment.IsDevelopment();

        services.AddOptions<IdamOptions>()
            .Bind(configuration.GetSection(IdamOptions.SectionName))
            .ValidateDataAnnotations()
            .Validate(
                options => options.MetadataAddress.StartsWith(options.Authority, StringComparison.Ordinal),
                "Idam:MetadataAddress must be under Idam:Authority.")
            .Validate(
                options => options.Authority.StartsWith("https://", StringComparison.Ordinal),
                "Idam:Authority must use HTTPS.")
            .Validate(
                options => isDevelopment || !string.IsNullOrWhiteSpace(options.ApiClientSecret),
                "Idam:ApiClientSecret is required outside Development.")
            .Validate(
                options => options.UserInfoClaims.IsComplete(),
                "Idam:UserInfoClaims must name a distinct field for every profile attribute.")
            .ValidateOnStart();

        services.AddOptions<LocaleOptions>()
            .Bind(configuration.GetSection(LocaleOptions.SectionName))
            .ValidateDataAnnotations()
            .Validate(
                options => options.IsConsistent(),
                "Locale:DefaultTimeZoneId must be a known IANA zone and Locale:DefaultCulture a supported culture.")
            .ValidateOnStart();

        services.AddOptions<AccessOptions>()
            .Bind(configuration.GetSection(AccessOptions.SectionName))
            .ValidateDataAnnotations()
            .Validate(
                options => options.IsConsistent(),
                "Access:StaffRoleOrder must list every staff role and nothing else.")
            .ValidateOnStart();

        services.AddOptions<ClientOriginOptions>()
            .Bind(configuration.GetSection(ClientOriginOptions.SectionName))
            .Validate(options => options.IsConsistent(), "ClientOrigins:Origins must be exact origins.")
            .ValidateOnStart();

        services.AddOptions<DevelopmentSignInOptions>()
            .Bind(configuration.GetSection(DevelopmentSignInOptions.SectionName))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddSingleton<LocaleSettings>(
            provider => provider.GetRequiredService<IOptions<LocaleOptions>>().Value.ToSettings());
        services.AddSingleton<AccessSettings>(
            provider => provider.GetRequiredService<IOptions<AccessOptions>>().Value.ToSettings());
        services.AddSingleton<LocalTimeService>();

        EnsureNonWildcardAllowedHosts(configuration);

        return builder;
    }

    private static void EnsureNonWildcardAllowedHosts(IConfiguration configuration)
    {
        string? allowedHosts = configuration["AllowedHosts"];

        if (string.IsNullOrWhiteSpace(allowedHosts)
            || allowedHosts.Contains('*', StringComparison.Ordinal))
        {
            throw new InvalidOperationException("The setting AllowedHosts must list exact host names.");
        }
    }
}
