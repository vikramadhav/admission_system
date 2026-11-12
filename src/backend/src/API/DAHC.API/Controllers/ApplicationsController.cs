using System.ComponentModel.DataAnnotations;
using DAHC.API.Authorization;
using DAHC.API.Contracts;
using DAHC.API.Http;
using DAHC.API.Responses;
using DAHC.Applications.Service;
using DAHC.Service.Access;
using DAHC.Service.Paging;
using DAHC.Service.Results;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DAHC.API.Controllers;

/// <summary>
/// The signed-in candidate's own applications (US-1.2.1, US-1.3.1, US-1.3.11 core save). Candidate ids are never
/// accepted from the request; another candidate's application is reported as not found.
/// </summary>
[ApiController]
[Route("api/v1/applications")]
[Authorize(Policy = Policies.Candidate)]
public sealed class ApplicationsController : ControllerBase
{
    private readonly ICandidateApplicationService applicationService;

    private readonly CurrentAccess currentAccess;

    private readonly ApiResults apiResults;

    public ApplicationsController(
        ICandidateApplicationService applicationService,
        CurrentAccess currentAccess,
        ApiResults apiResults)
    {
        this.applicationService = applicationService;
        this.currentAccess = currentAccess;
        this.apiResults = apiResults;
    }

    /// <summary>
    /// <c>listCandidateApplications</c>.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> ListAsync(
        [FromQuery] Guid? cycleId,
        [FromQuery] PageParameters page,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(page);

        Result<Page<ApplicationView>> applications = await this.applicationService.ListAsync(
            this.RequireCandidate(),
            cycleId,
            page.ToPageQuery(),
            cancellationToken);

        return this.apiResults.List(this.HttpContext, applications, ApplicationErrorCodes.NoneActive);
    }

    /// <summary>
    /// <c>createCandidateDraftApplication</c>: 201 with the draft and its ETag. Replaying the same
    /// <c>Idempotency-Key</c> and request returns the same draft.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateAsync(
        [FromHeader(Name = "Idempotency-Key"), Required, StringLength(128, MinimumLength = 16)] string idempotencyKey,
        [FromQuery, Required] Guid? cycleId,
        [FromBody] CreateApplicationRequest request,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        // cycleId is required by model validation before the action runs.
        CreateDraftCommand command = request.ToCommand(cycleId!.Value, idempotencyKey);
        Result<ApplicationView> created = await this.applicationService.CreateDraftAsync(
            this.RequireCandidate(),
            command,
            cancellationToken);

        return this.apiResults.CreatedVersioned(
            this.HttpContext,
            created,
            application => application.Version,
            application => $"/api/v1/applications/{application.Id}");
    }

    /// <summary>
    /// <c>getCandidateApplication</c>: 200 with the application and its ETag.
    /// </summary>
    [HttpGet("{applicationId:guid}")]
    public async Task<IActionResult> GetAsync(Guid applicationId, CancellationToken cancellationToken)
    {
        Result<ApplicationView> application = await this.applicationService.GetAsync(
            this.RequireCandidate(),
            applicationId,
            cancellationToken);

        return this.apiResults.OkVersioned(this.HttpContext, application, view => view.Version);
    }

    /// <summary>
    /// <c>updateCandidateDraftApplication</c>: needs <c>If-Match</c> with the ETag of the latest read or write;
    /// 428 without it and 412 when it is stale.
    /// </summary>
    [HttpPatch("{applicationId:guid}")]
    [Consumes("application/merge-patch+json", "application/json")]
    public async Task<IActionResult> UpdateAsync(
        Guid applicationId,
        [FromHeader(Name = "If-Match")] string? ifMatch,
        [FromBody] UpdateDraftRequest request,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        Result<ApplicationView> updated;

        if (string.IsNullOrWhiteSpace(ifMatch))
        {
            updated = Result.Failure<ApplicationView>(
                ResultStatus.PreconditionRequired,
                ErrorCodes.PreconditionRequired);
        }
        else if (!EntityTags.TryParse(ifMatch, out int expectedVersion))
        {
            updated = Result.Failure<ApplicationView>(ResultStatus.PreconditionFailed, ErrorCodes.PreconditionFailed);
        }
        else
        {
            updated = await this.applicationService.UpdateDraftAsync(
                this.RequireCandidate(),
                request.ToCommand(applicationId, expectedVersion),
                cancellationToken);
        }

        return this.apiResults.OkVersioned(this.HttpContext, updated, view => view.Version);
    }

    private CurrentUser RequireCandidate()
    {
        return this.currentAccess.User
            ?? throw new InvalidOperationException("The authorization policy admitted a request without an active user.");
    }
}
