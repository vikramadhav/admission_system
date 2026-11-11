namespace DAHC.API.Authentication;

public static class AuthenticationErrorCodes
{
    public const string TokenInvalid = "auth.token_invalid";

    public const string IdamUnavailable = "auth.idam_unavailable";

    public const string Forbidden = "auth.forbidden";

    public const string IntegrationNotPermitted = "integration.not_permitted";
}
