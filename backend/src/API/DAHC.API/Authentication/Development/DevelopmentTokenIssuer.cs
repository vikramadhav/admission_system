using System.Text;
using DAHC.API.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace DAHC.API.Authentication.Development;

/// <summary>
/// Development only: issues short-lived tokens from the development issuer, signed with the key from user
/// secrets. They are validated by the development JWT scheme and then follow the same authorization path as
/// IDAM tokens.
/// </summary>
public sealed class DevelopmentTokenIssuer
{
    private readonly DevelopmentSignInOptions options;

    private readonly IdamOptions idamOptions;

    private readonly TimeProvider timeProvider;

    public DevelopmentTokenIssuer(
        IOptions<DevelopmentSignInOptions> options,
        IOptions<IdamOptions> idamOptions,
        TimeProvider timeProvider)
    {
        ArgumentNullException.ThrowIfNull(options);
        ArgumentNullException.ThrowIfNull(idamOptions);

        this.options = options.Value;
        this.idamOptions = idamOptions.Value;
        this.timeProvider = timeProvider;
    }

    public static SymmetricSecurityKey CreateSigningKey(DevelopmentSignInOptions options)
    {
        ArgumentNullException.ThrowIfNull(options);

        string signingKey = options.SigningKey
            ?? throw new InvalidOperationException("DevelopmentSignIn:SigningKey is not configured.");

        return new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey));
    }

    public DevelopmentToken Issue(DevelopmentSignInRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);

        DateTimeOffset issuedAt = this.timeProvider.GetUtcNow();
        DateTimeOffset expiresAt = issuedAt.AddMinutes(this.options.TokenLifetimeMinutes);

        Dictionary<string, object> claims = new()
        {
            [IdamClaimNames.ClientId] = request.ClientId ?? this.idamOptions.WebClientId,
        };

        AddIfPresent(claims, IdamClaimNames.Subject, request.Subject);
        AddIfPresent(claims, IdamClaimNames.Name, request.DisplayName);
        AddIfPresent(claims, IdamClaimNames.Email, request.Email);
        AddIfPresent(claims, IdamClaimNames.PhoneNumber, request.MobileNumber);
        AddIfPresent(claims, IdamClaimNames.EmiratesId, request.EmiratesId);
        AddIfPresent(claims, IdamClaimNames.PassportNumber, request.PassportNumber);

        SecurityTokenDescriptor descriptor = new()
        {
            Issuer = this.options.Issuer,
            Audience = this.options.Audience,
            Claims = claims,
            IssuedAt = issuedAt.UtcDateTime,
            NotBefore = issuedAt.UtcDateTime,
            Expires = expiresAt.UtcDateTime,
            SigningCredentials = new SigningCredentials(
                CreateSigningKey(this.options),
                SecurityAlgorithms.HmacSha256),
        };

        string accessToken = new JsonWebTokenHandler().CreateToken(descriptor);

        return new DevelopmentToken(accessToken, expiresAt);
    }

    private static void AddIfPresent(Dictionary<string, object> claims, string name, string? value)
    {
        if (!string.IsNullOrWhiteSpace(value))
        {
            claims[name] = value;
        }
    }
}
