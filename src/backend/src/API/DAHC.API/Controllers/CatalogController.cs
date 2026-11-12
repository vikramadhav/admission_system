using System.ComponentModel.DataAnnotations;
using DAHC.API.Contracts;
using DAHC.API.Responses;
using DAHC.Catalog.Service;
using DAHC.Service.Paging;
using DAHC.Service.Results;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DAHC.API.Controllers;

/// <summary>
/// Program, specialty and training-site discovery (US-1.3.1). Any active signed-in user.
/// </summary>
[ApiController]
[Route("api/v1")]
[Authorize]
public sealed class CatalogController : ControllerBase
{
    private readonly ICatalogService catalogService;

    private readonly ApiResults apiResults;

    public CatalogController(ICatalogService catalogService, ApiResults apiResults)
    {
        this.catalogService = catalogService;
        this.apiResults = apiResults;
    }

    /// <summary>
    /// <c>listPrograms</c>.
    /// </summary>
    [HttpGet("programs")]
    public async Task<IActionResult> ListProgramsAsync(
        [FromQuery, Required] Guid? cycleId,
        [FromQuery] PageParameters page,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(page);

        // cycleId is required by model validation before the action runs.
        Result<Page<ProgramItem>> programs = await this.catalogService.ListProgramsAsync(
            cycleId!.Value,
            page.ToPageQuery(),
            cancellationToken);

        return this.apiResults.List(this.HttpContext, programs, "programs.none_available");
    }

    /// <summary>
    /// <c>listProgramSpecialties</c>.
    /// </summary>
    [HttpGet("programs/{programId:guid}/specialties")]
    public async Task<IActionResult> ListSpecialtiesAsync(
        Guid programId,
        [FromQuery] PageParameters page,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(page);

        Result<Page<SpecialtyItem>> specialties = await this.catalogService.ListSpecialtiesAsync(
            programId,
            page.ToPageQuery(),
            cancellationToken);

        return this.apiResults.List(this.HttpContext, specialties, "specialties.none_available");
    }

    /// <summary>
    /// <c>listSpecialtyTrainingSites</c>.
    /// </summary>
    [HttpGet("specialties/{specialtyId:guid}/sites")]
    public async Task<IActionResult> ListTrainingSitesAsync(
        Guid specialtyId,
        [FromQuery] PageParameters page,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(page);

        Result<Page<TrainingSiteItem>> sites = await this.catalogService.ListTrainingSitesAsync(
            specialtyId,
            page.ToPageQuery(),
            cancellationToken);

        return this.apiResults.List(this.HttpContext, sites, "sites.none_available");
    }
}
