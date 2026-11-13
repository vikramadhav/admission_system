using DAHC.Catalog.Service;
using Microsoft.Extensions.DependencyInjection;

namespace DAHC.Catalog.Data;

public static class CatalogDataRegistration
{
    public static IServiceCollection AddDahcCatalogData(this IServiceCollection services)
    {
        ArgumentNullException.ThrowIfNull(services);

        services.AddScoped<ICatalogService, CatalogService>();

        return services;
    }
}
