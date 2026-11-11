using DAHC.Service.Access;
using DAHC.Service.Results;

namespace DAHC.Identity.Service;

/// <summary>
/// Sign-in provisioning and the active-role switch (US-1.1.1, US-1.1.2, standard s.15).
/// </summary>
public interface IAuthSessionService
{
    /// <summary>
    /// Matches a pre-registered staff user or an existing candidate by the IDAM user identifier, or provisions a
    /// new candidate with the Candidate role only; refreshes the profile attributes from <paramref name="profile"/>.
    /// </summary>
    Task<Result<AuthSession>> SignInAsync(
        string idamUserId,
        IdentityProfile profile,
        CancellationToken cancellationToken);

    Task<Result<AuthSession>> SwitchActiveRoleAsync(
        CurrentUser user,
        string roleCode,
        CancellationToken cancellationToken);
}
