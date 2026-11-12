using DAHC.Applications.Service;
using Microsoft.Extensions.DependencyInjection;

namespace DAHC.Applications.Data;

public static class ApplicationsDataRegistration
{
    public static IServiceCollection AddDahcApplicationsData(this IServiceCollection services)
    {
        ArgumentNullException.ThrowIfNull(services);

        services.AddScoped<ApplicationReader>();
        services.AddScoped<ICandidateApplicationService, CandidateApplicationService>();
        services.AddScoped<ICandidateDashboardService, CandidateDashboardService>();
        services.AddScoped<IApplicationNumberAllocator, SqlApplicationNumberAllocator>();

        return services;
    }
}
