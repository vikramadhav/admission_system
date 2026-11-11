namespace DAHC.Applications.Core;

/// <summary>
/// Candidate-visible application statuses; the codes equal the contract's <c>ApplicationStatus</c> values.
/// </summary>
public enum ApplicationStatus
{
    Draft,
    Submitted,
    UnderReview,
    CorrectionRequired,
    CorrectionSubmitted,
    ScreenedOut,
    ReviewCompleted,
    AppealUnderReview,
    Withdrawn,
    Archived,
}
