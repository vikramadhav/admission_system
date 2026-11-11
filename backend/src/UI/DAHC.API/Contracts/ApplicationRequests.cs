using System.ComponentModel.DataAnnotations;
using DAHC.Applications.Service;

namespace DAHC.API.Contracts;

/// <summary>
/// Body of <c>createCandidateDraftApplication</c> (contract <c>CreateApplicationRequest</c>). The candidate is
/// always the caller; no candidate id is accepted.
/// </summary>
public sealed record CreateApplicationRequest
{
    [Required]
    public Guid? ProgramId { get; init; }

    [Required]
    [MinLength(1)]
    [MaxLength(2)]
    public IReadOnlyList<PreferenceRequest>? Preferences { get; init; }

    public CreateDraftCommand ToCommand(Guid cycleId, string idempotencyKey)
    {
        // Required fields are checked by model validation before the action runs.
        CreateDraftCommand command = new(
            cycleId,
            this.ProgramId!.Value,
            PreferenceRequest.ToInputs(this.Preferences!),
            idempotencyKey);

        return command;
    }
}

/// <summary>
/// Body of <c>updateCandidateDraftApplication</c> (JSON Merge Patch). Only the preferences can be saved until the
/// program-configured sections are decided (OQ-02); other members are refused as unknown.
/// </summary>
public sealed record UpdateDraftRequest
{
    [Required]
    [MinLength(1)]
    [MaxLength(2)]
    public IReadOnlyList<PreferenceRequest>? Preferences { get; init; }

    public UpdateDraftCommand ToCommand(Guid applicationId, int expectedVersion)
    {
        // Required fields are checked by model validation before the action runs.
        return new UpdateDraftCommand(applicationId, expectedVersion, PreferenceRequest.ToInputs(this.Preferences!));
    }
}

/// <summary>
/// A specialty preference (contract <c>PreferenceInput</c>).
/// </summary>
public sealed record PreferenceRequest
{
    public const int MaxTrainingSites = 20;

    [Required]
    public Guid? SpecialtyId { get; init; }

    [Required]
    [Range(1, 2)]
    public int? PreferenceOrder { get; init; }

    [Required]
    [MinLength(1)]
    [MaxLength(MaxTrainingSites)]
    public IReadOnlyList<TrainingSiteRequest>? TrainingSites { get; init; }

    public static IReadOnlyList<PreferenceInput> ToInputs(IReadOnlyList<PreferenceRequest> preferences)
    {
        ArgumentNullException.ThrowIfNull(preferences);

        return preferences.Select(preference => preference.ToInput()).ToList();
    }

    private PreferenceInput ToInput()
    {
        // Required fields are checked by model validation before the action runs.
        List<TrainingSitePreferenceInput> sites = this.TrainingSites!
            .Select(site => new TrainingSitePreferenceInput(site.SiteId!.Value, site.SiteOrder!.Value))
            .ToList();

        return new PreferenceInput(this.SpecialtyId!.Value, this.PreferenceOrder!.Value, sites);
    }
}

/// <summary>
/// A training site and its order (contract <c>TrainingSitePreferenceInput</c>).
/// </summary>
public sealed record TrainingSiteRequest
{
    [Required]
    public Guid? SiteId { get; init; }

    [Required]
    [Range(1, PreferenceRequest.MaxTrainingSites)]
    public int? SiteOrder { get; init; }
}
