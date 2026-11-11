namespace DAHC.API.Authentication;

public static class AuthenticationSchemes
{
    /// <summary>
    /// IDAM opaque access tokens, validated by introspection. The default scheme outside Development.
    /// </summary>
    public const string Idam = "IdamIntrospection";

    /// <summary>
    /// Development only: tokens issued by the local development sign-in.
    /// </summary>
    public const string DevelopmentJwt = "DevelopmentJwt";

    /// <summary>
    /// Development only: sends development tokens (JWTs) to <see cref="DevelopmentJwt"/> and every other token to
    /// <see cref="Idam"/>.
    /// </summary>
    public const string DevelopmentSelector = "DevelopmentSelector";
}
