using DAHC.API.Authentication;
using DAHC.API.Authentication.Development;
using DAHC.API.Authorization;
using DAHC.API.Configuration;
using DAHC.API.Http;
using DAHC.API.Localization;
using DAHC.Applications.Data;
using DAHC.Catalog.Data;
using DAHC.Data;
using DAHC.Identity.Data;
using DAHC.Logging;
using DAHC.Service.Access;
using Microsoft.Extensions.Options;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.AddDahcLogging();
builder.AddDahcOptions();
builder.AddDahcHttpHardening();
builder.AddDahcAuthentication();

builder.Services.AddDahcAuthorization();
builder.Services.AddDahcLocalization();
builder.Services.AddDahcApi();

string connectionString = builder.Configuration.GetConnectionString("Dahc")
    ?? throw new InvalidOperationException("The connection string Dahc is required.");

builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddScoped<CurrentAccess>();
builder.Services.AddDahcData(connectionString);
builder.Services.AddDahcIdentityData();
builder.Services.AddDahcCatalogData();
builder.Services.AddDahcApplicationsData();

WebApplication app = builder.Build();

await app.EnsureApprovedHandlersAsync();

// Request id and request logging sit outside the exception handler, so every entry carries the request id and
// a failure is logged once, by the handler, with the status code it returned.
app.UseMiddleware<RequestIdMiddleware>();
app.UseDahcLogging();
app.UseExceptionHandler();

if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseMiddleware<SecurityHeadersMiddleware>();
app.UseRouting();
app.UseCors();
app.UseAuthentication();
app.UseMiddleware<AccessContextMiddleware>();
app.UseDahcRequestLocalization();
app.UseRateLimiter();
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health").AllowAnonymous();

bool isDevelopmentSignInEnabled = app.Services.GetRequiredService<IOptions<DevelopmentSignInOptions>>().Value.Enabled;

if (app.Environment.IsDevelopment()
    && isDevelopmentSignInEnabled)
{
    app.MapDevelopmentSignIn();
}

await app.RunAsync();
