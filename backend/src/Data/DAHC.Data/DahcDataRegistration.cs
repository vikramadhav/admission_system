using DAHC.Data.Interceptors;
using DAHC.Data.Operations;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace DAHC.Data;

public static class DahcDataRegistration
{
    /// <summary>
    /// Registers <see cref="DahcDbContext"/> on SQL Server with the soft-delete and audit interceptors.
    /// Migrations are applied at deployment, never at startup.
    /// </summary>
    public static IServiceCollection AddDahcData(this IServiceCollection services, string connectionString)
    {
        ArgumentNullException.ThrowIfNull(services);
        ArgumentException.ThrowIfNullOrWhiteSpace(connectionString);

        services.AddScoped<SoftDeleteSaveChangesInterceptor>();
        services.AddScoped<AuditSaveChangesInterceptor>();
        services.AddScoped<AuditWriter>();

        services.AddDbContext<DahcDbContext>(
            (serviceProvider, options) =>
            {
                options.UseSqlServer(connectionString);
                AddInterceptors(serviceProvider, options);
            });

        return services;
    }

    /// <summary>
    /// Soft delete runs first, so the audit records a soft delete as the update it becomes.
    /// </summary>
    public static void AddInterceptors(IServiceProvider serviceProvider, DbContextOptionsBuilder options)
    {
        ArgumentNullException.ThrowIfNull(serviceProvider);
        ArgumentNullException.ThrowIfNull(options);

        options.AddInterceptors(
            serviceProvider.GetRequiredService<SoftDeleteSaveChangesInterceptor>(),
            serviceProvider.GetRequiredService<AuditSaveChangesInterceptor>());
    }
}
