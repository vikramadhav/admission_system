using System.Globalization;
using Elastic.Ingest.Elasticsearch;
using Elastic.Ingest.Elasticsearch.DataStreams;
using Elastic.Serilog.Sinks;
using Elastic.Transport;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Serilog;
using Serilog.Events;

namespace DAHC.Logging;

/// <summary>
/// Serilog for the API: a rolling file in Development, Elasticsearch in every other environment (standard s.13).
/// </summary>
public static class DahcLoggingRegistration
{
    private const string FileTemplate =
        "{UtcTimestamp:yyyy-MM-ddTHH:mm:ss.fffZ} [{Level:u3}] {SourceContext} {Message:lj} "
        + "TraceId={TraceId} RequestId={RequestId} UserId={UserId} Machine={MachineName}{NewLine}";

    public static WebApplicationBuilder AddDahcLogging(this WebApplicationBuilder builder)
    {
        ArgumentNullException.ThrowIfNull(builder);

        bool isDevelopment = builder.Environment.IsDevelopment();
        Uri? elasticsearchEndpoint = builder.Configuration.GetValue<Uri?>("DahcLogging:ElasticsearchEndpoint");
        string? elasticsearchApiKey = builder.Configuration["DahcLogging:ElasticsearchApiKey"];

        if (!isDevelopment
            && elasticsearchEndpoint is null)
        {
            throw new InvalidOperationException(
                "The setting DahcLogging:ElasticsearchEndpoint is required outside Development.");
        }

        builder.Services.AddSerilog(configuration =>
        {
            ConfigureLevelsAndEnrichers(configuration);

            if (isDevelopment
                || elasticsearchEndpoint is null)
            {
                WriteToFile(configuration);
            }
            else
            {
                WriteToElasticsearch(configuration, elasticsearchEndpoint, elasticsearchApiKey);
            }
        });

        return builder;
    }

    /// <summary>
    /// One entry per request. The path is logged as its route template, never the raw path, so request values
    /// (identifiers, injected text) never reach the log.
    /// </summary>
    public static WebApplication UseDahcLogging(this WebApplication app)
    {
        ArgumentNullException.ThrowIfNull(app);

        app.UseSerilogRequestLogging(options =>
        {
            options.MessageTemplate = "HTTP {RequestMethod} {RouteTemplate} responded {StatusCode} in {Elapsed:0.0} ms";
            options.GetMessageTemplateProperties = (httpContext, requestPath, elapsed, statusCode) =>
            [
                new LogEventProperty("RequestMethod", new ScalarValue(httpContext.Request.Method)),
                new LogEventProperty("RouteTemplate", new ScalarValue(DescribeRoute(httpContext))),
                new LogEventProperty("StatusCode", new ScalarValue(statusCode)),
                new LogEventProperty("Elapsed", new ScalarValue(elapsed)),
            ];
        });

        return app;
    }

    private static string DescribeRoute(HttpContext httpContext)
    {
        if (httpContext.GetEndpoint() is RouteEndpoint routeEndpoint)
        {
            return routeEndpoint.RoutePattern.RawText ?? "unnamed";
        }

        return "unmatched";
    }

    private static void ConfigureLevelsAndEnrichers(LoggerConfiguration configuration)
    {
        // These categories repeat a failure the exception handler already logs once, and their messages can quote
        // stored values or identity-provider responses, so they are raised above the levels in use.
        configuration
            .MinimumLevel.Information()
            .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
            .MinimumLevel.Override("Microsoft.AspNetCore.Diagnostics", LogEventLevel.Fatal)
            .MinimumLevel.Override("Microsoft.EntityFrameworkCore", LogEventLevel.Fatal)
            .MinimumLevel.Override("Duende", LogEventLevel.Fatal)
            .MinimumLevel.Override("System.Net.Http.HttpClient", LogEventLevel.Warning)
            .Enrich.FromLogContext()
            .Enrich.With(new MachineNameEnricher())
            .Enrich.With(new UtcTimestampEnricher());
    }

    private static void WriteToFile(LoggerConfiguration configuration)
    {
        // Resolved from the application folder, not the working directory.
        string path = Path.Combine(AppContext.BaseDirectory, "logs", "dahc-local-.log");

        configuration.WriteTo.File(
            path,
            outputTemplate: FileTemplate,
            formatProvider: CultureInfo.InvariantCulture,
            rollingInterval: RollingInterval.Day);
    }

    private static void WriteToElasticsearch(
        LoggerConfiguration configuration,
        Uri endpoint,
        string? apiKey)
    {
        configuration.WriteTo.Elasticsearch(
            [endpoint],
            options =>
            {
                options.DataStream = new DataStreamName("logs", "dahc", "api");
                options.BootstrapMethod = BootstrapMethod.None;
            },
            transport =>
            {
                if (!string.IsNullOrWhiteSpace(apiKey))
                {
                    transport.Authentication(new ApiKey(apiKey));
                }
            });
    }
}
