using DAHC.API.Authorization;
using DAHC.API.Contracts;
using DAHC.API.Responses;
using DAHC.Applications.Service;
using DAHC.Service.Access;
using DAHC.Service.Results;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DAHC.API.Controllers;

/// <summary>
/// The candidate dashboard (US-1.2.1): the start-new state and the candidate's own applications.
/// </summary>
[ApiController]
[Route("api/v1/me/dashboard")]
[Authorize(Policy = Policies.Candidate)]
public sealed class CandidateDashboardController : ControllerBase
{
    private readonly ICandidateDashboardService dashboardService;

    private readonly CurrentAccess currentAccess;

    private readonly ApiResults apiResults;

    public CandidateDashboardController(
        ICandidateDashboardService dashboardService,
        CurrentAccess currentAccess,
        ApiResults apiResults)
    {
        this.dashboardService = dashboardService;
        this.currentAccess = currentAccess;
        this.apiResults = apiResults;
    }

    /// <summary>
    /// <c>getCandidateDashboard</c>. With no applications the response carries an empty list, a message code and
    /// the start-new state.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAsync(
        [FromQuery] Guid? cycleId,
        [FromQuery] PageParameters page,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(page);

        CurrentUser candidate = this.currentAccess.User
            ?? throw new InvalidOperationException("The authorization policy admitted a request without an active user.");

        Result<CandidateDashboard> dashboard = await this.dashboardService.GetAsync(
            candidate,
            cycleId,
            page.ToPageQuery(),
            cancellationToken);

        Result<CandidateDashboardResponse> response = dashboard.IsSuccess
            ? Result.Success(CandidateDashboardResponse.From(dashboard.Value))
            : dashboard.ToFailure<CandidateDashboardResponse>();

        return this.apiResults.OkWithEmptyMessage(
            this.HttpContext,
            response,
            value => value.Items.Count == 0,
            ApplicationErrorCodes.NoneActive);
    }
}
