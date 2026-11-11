namespace DAHC.Applications.Service;

/// <summary>
/// Actions a candidate may take on an application now (contract <c>CandidateApplicationAction</c>). Only the
/// actions this release implements are evaluated; discard, withdraw, reinstate, preference edits, site exclusion
/// and appeal are added with their stories.
/// </summary>
public enum CandidateApplicationAction
{
    View,
    Resume,
}
