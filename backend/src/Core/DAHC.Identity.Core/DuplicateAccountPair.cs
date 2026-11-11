namespace DAHC.Identity.Core;

/// <summary>
/// A suspected duplicate candidate account found at sign-in (US-1.1.1 AC5-AC6), kept for the supervisor report.
/// Only which attributes matched is stored, never the matched values.
/// </summary>
public sealed class DuplicateAccountPair
{
    public long PairId { get; set; }

    public required Guid PublicId { get; set; }

    public required long OriginalCandidateId { get; set; }

    public long DuplicateCandidateId { get; set; }

    /// <summary>
    /// The duplicate account, set when the pair is recorded together with the new candidate in one save.
    /// </summary>
    public Candidate? DuplicateCandidate { get; set; }

    public bool MatchedOnEmiratesId { get; set; }

    public bool MatchedOnPassport { get; set; }

    public bool MatchedOnMobile { get; set; }

    public required DateTimeOffset DetectedAt { get; set; }
}
