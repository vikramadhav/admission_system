namespace DAHC.Identity.Service;

/// <summary>
/// Error codes of the identity endpoints (contract <c>Problem.code</c>).
/// </summary>
public static class IdentityErrorCodes
{
    public const string NotRegistered = "account.not_registered";

    public const string Deactivated = "account.deactivated";

    public const string Duplicate = "account.duplicate";

    public const string NoRole = "account.no_role";

    public const string RoleNotHeld = "account.role_not_held";
}
