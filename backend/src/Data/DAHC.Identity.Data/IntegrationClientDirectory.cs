using DAHC.Data;
using DAHC.Identity.Service;
using Microsoft.EntityFrameworkCore;

namespace DAHC.Identity.Data;

internal sealed class IntegrationClientDirectory : IIntegrationClientDirectory
{
    private readonly DahcDbContext dbContext;

    public IntegrationClientDirectory(DahcDbContext dbContext)
    {
        this.dbContext = dbContext;
    }

    public async Task<bool> IsActiveIntegrationClientAsync(string idamClientId, CancellationToken cancellationToken)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(idamClientId);

        try
        {
            return await this.dbContext.IntegrationClients
                .AsNoTracking()
                .AnyAsync(client => client.IdamClientId == idamClientId && client.IsActive, cancellationToken);
        }
        catch (Exception exception) when (DahcDataException.IsDatabaseFailure(exception))
        {
            throw new DahcDataException("IntegrationClientDirectory.IsActiveIntegrationClientAsync", exception);
        }
    }
}
