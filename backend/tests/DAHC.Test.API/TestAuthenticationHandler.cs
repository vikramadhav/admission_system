using System.Security.Claims;
using System.Text.Encodings.Web;
using DAHC.Service.Access;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace DAHC.Test.API;

/// <summary>
/// Replaces IDAM introspection in tests: <c>Authorization: Bearer test:&lt;subject&gt;</c> authenticates as that
/// subject on the web client. Every token also carries an IDAM-style <c>role</c> claim of Administrator, which
/// the API must ignore. Production startup refuses this handler.
/// </summary>
internal sealed class TestAuthenticationHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public const string SchemeName = "Test";

    public const string WebClientId = "dahc-web-test";

    public const string Issuer = "https://idam.test/";

    private const string TokenPrefix = "Bearer test:";

    public TestAuthenticationHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder)
        : base(options, logger, encoder)
    {
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        string? header = this.Request.Headers.Authorization;

        if (header is null
            || !header.StartsWith(TokenPrefix, StringComparison.Ordinal))
        {
            return Task.FromResult(AuthenticateResult.NoResult());
        }

        string subject = header[TokenPrefix.Length..];
        Claim[] claims =
        [
            new("sub", subject),
            new("client_id", WebClientId),
            new("iss", Issuer),
            new("role", RoleCodes.Administrator),
        ];

        ClaimsPrincipal principal = new(new ClaimsIdentity(claims, SchemeName));
        AuthenticationTicket ticket = new(principal, SchemeName);

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}
