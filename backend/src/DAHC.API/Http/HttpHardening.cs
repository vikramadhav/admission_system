using DAHC.API.Configuration;
using Microsoft.AspNetCore.Http.Features;

namespace DAHC.API.Http;

/// <summary>
/// Runtime hardening (standard s.15): bounded request sizes, no <c>Server</c> header, HSTS, and CORS only for the
/// exact configured client origins, without credentials, allowing the <c>Authorization</c> header.
/// </summary>
public static class HttpHardening
{
    private const long MaxRequestBodyBytes = 256 * 1024;

    public static WebApplicationBuilder AddDahcHttpHardening(this WebApplicationBuilder builder)
    {
        ArgumentNullException.ThrowIfNull(builder);

        builder.WebHost.ConfigureKestrel(kestrel =>
        {
            kestrel.AddServerHeader = false;
            kestrel.Limits.MaxRequestBodySize = MaxRequestBodyBytes;
            kestrel.Limits.MaxRequestHeadersTotalSize = 32 * 1024;
            kestrel.Limits.MaxRequestHeaderCount = 64;
            kestrel.Limits.MaxRequestLineSize = 8 * 1024;
        });

        builder.Services.Configure<FormOptions>(form =>
        {
            form.ValueCountLimit = 64;
            form.ValueLengthLimit = 4 * 1024;
            form.KeyLengthLimit = 256;
            form.MultipartBodyLengthLimit = MaxRequestBodyBytes;
        });

        builder.Services.AddHsts(hsts =>
        {
            hsts.MaxAge = TimeSpan.FromDays(365);
            hsts.IncludeSubDomains = true;
        });

        string[] origins = builder.Configuration
            .GetSection(ClientOriginOptions.SectionName)
            .Get<ClientOriginOptions>()?.Origins ?? [];

        builder.Services.AddCors(cors => cors.AddDefaultPolicy(policy => policy
            .WithOrigins(origins)
            .WithMethods("GET", "POST", "PUT", "PATCH")
            .WithHeaders(
                "Authorization",
                "Content-Type",
                "Accept-Language",
                "Idempotency-Key",
                "If-Match",
                RequestIdMiddleware.CorrelationIdHeader)
            .WithExposedHeaders("ETag", "Location", "Retry-After", RequestIdMiddleware.RequestIdHeader)));

        builder.Services.AddDahcRateLimiting();

        return builder;
    }
}
