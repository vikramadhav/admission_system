using DAHC.Service.Access;

namespace DAHC.Test.Service;

public sealed class TokenClassifierTests
{
    private const string WebClientId = "dahc-web";

    [Fact]
    public void WebClientTokenWithUserSubject_IsUserToken()
    {
        TokenKind? kind = TokenClassifier.Classify("candidate-1", WebClientId, WebClientId, false);

        Assert.Equal(TokenKind.User, kind);
    }

    [Fact]
    public void RegisteredIntegrationClientWithoutUserSubject_IsIntegrationOnly()
    {
        TokenKind? kind = TokenClassifier.Classify("payments-middleware", "payments-middleware", WebClientId, true);

        Assert.Equal(TokenKind.IntegrationOnly, kind);
    }

    [Fact]
    public void RegisteredIntegrationClientWithUserSubject_IsUserViaIntegration()
    {
        TokenKind? kind = TokenClassifier.Classify("candidate-1", "payments-middleware", WebClientId, true);

        Assert.Equal(TokenKind.UserViaIntegration, kind);
    }

    [Theory]
    [InlineData("candidate-1", "another-application")]
    [InlineData("candidate-1", null)]
    [InlineData(null, WebClientId)]
    public void TokenNotIssuedToDahcClientForUser_IsRefused(string? subject, string? clientId)
    {
        TokenKind? kind = TokenClassifier.Classify(subject, clientId, WebClientId, false);

        Assert.Null(kind);
    }
}
