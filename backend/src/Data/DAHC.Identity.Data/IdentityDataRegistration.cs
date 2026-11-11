using DAHC.Identity.Service;
using Microsoft.Extensions.DependencyInjection;

namespace DAHC.Identity.Data;

public static class IdentityDataRegistration
{
    public static IServiceCollection AddDahcIdentityData(this IServiceCollection services)
    {
        ArgumentNullException.ThrowIfNull(services);

        services.AddScoped<IdentityUsers>();
        services.AddScoped<IAuthSessionService, AuthSessionService>();
        services.AddScoped<ICurrentUserLoader, CurrentUserLoader>();
        services.AddScoped<IIntegrationClientDirectory, IntegrationClientDirectory>();
        services.AddScoped<ICandidateNumberAllocator, SqlCandidateNumberAllocator>();

        return services;
    }
}
