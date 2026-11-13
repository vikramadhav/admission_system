namespace DAHC.API.Authentication;

/// <summary>
/// Field names of the IDAM introspection and UserInfo responses. The protocol names are fixed; the profile names
/// are defaults for <c>Idam:UserInfoClaims</c> and the names inside development tokens. Read only by the authentication components;
/// endpoints never inspect raw claims. The <c>role</c> claim is deliberately absent: it is never read.
/// </summary>
public static class IdamClaimNames
{
    public const string Subject = "sub";

    public const string ClientId = "client_id";

    public const string Issuer = "iss";

    public const string Expiry = "exp";

    public const string Name = "name";

    public const string Email = "email";

    public const string PhoneNumber = "phone_number";

    /// <summary>
    /// Default for <c>Idam:UserInfoClaims:EmiratesId</c> (UAE PASS <c>idn</c>); the IDAM name is configured.
    /// </summary>
    public const string EmiratesId = "idn";

    /// <summary>
    /// Default for <c>Idam:UserInfoClaims:PassportNumber</c>; the IDAM name is configured.
    /// </summary>
    public const string PassportNumber = "passport_number";
}
