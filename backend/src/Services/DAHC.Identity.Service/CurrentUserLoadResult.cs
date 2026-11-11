using DAHC.Service.Access;

namespace DAHC.Identity.Service;

/// <summary>
/// The access status of the IDAM identity and, when it is <see cref="AccessStatus.Active"/>, the user.
/// </summary>
public sealed record CurrentUserLoadResult(AccessStatus Status, CurrentUser? User);
