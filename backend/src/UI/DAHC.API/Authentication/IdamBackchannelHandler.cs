namespace DAHC.API.Authentication;

/// <summary>
/// Watches calls to IDAM (metadata, introspection, UserInfo) and marks the current request when IDAM could not be
/// reached or failed on its side.
/// </summary>
public sealed class IdamBackchannelHandler : DelegatingHandler
{
    private readonly IHttpContextAccessor httpContextAccessor;

    public IdamBackchannelHandler(IHttpContextAccessor httpContextAccessor)
    {
        this.httpContextAccessor = httpContextAccessor;
    }

    protected override async Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken)
    {
        try
        {
            HttpResponseMessage response = await base.SendAsync(request, cancellationToken);

            if ((int)response.StatusCode >= StatusCodes.Status500InternalServerError)
            {
                this.MarkUnavailable();
            }

            return response;
        }
        catch (Exception exception) when (exception is HttpRequestException or TaskCanceledException)
        {
            this.MarkUnavailable();

            throw;
        }
    }

    private void MarkUnavailable()
    {
        HttpContext? httpContext = this.httpContextAccessor.HttpContext;

        if (httpContext is not null)
        {
            IdamAvailability.MarkUnavailable(httpContext);
        }
    }
}
