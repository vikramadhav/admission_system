using System.Net;
using System.Text.Json;

namespace DAHC.Test.API;

public sealed class ResponseContractTests
{
    [Fact]
    public async Task HealthCheckWithoutToken_IsAnonymous()
    {
        await using DahcApiFactory factory = new();
        HttpClient client = factory.CreateClientFor(null);

        HttpResponseMessage response = await client.GetAsync("/health", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task ProtectedEndpointWithoutToken_Returns401ProblemDetails()
    {
        await using DahcApiFactory factory = new();
        HttpClient client = factory.CreateClientFor(null);

        HttpResponseMessage response = await client.GetAsync(
            "/api/v1/programs?cycleId=" + Guid.NewGuid(),
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        Assert.Equal("Bearer", response.Headers.WwwAuthenticate.Single().Scheme);
        using JsonDocument problem = await ReadJsonAsync(response);
        Assert.Equal("auth.token_invalid", problem.RootElement.GetProperty("code").GetString());
        Assert.False(string.IsNullOrEmpty(problem.RootElement.GetProperty("traceId").GetString()));
        Assert.False(problem.RootElement.TryGetProperty("data", out _));
    }

    [Fact]
    public async Task ProblemWithArabicAcceptLanguage_IsLocalized()
    {
        await using DahcApiFactory factory = new();
        HttpClient client = factory.CreateClientFor(null);
        client.DefaultRequestHeaders.AcceptLanguage.ParseAdd("ar-AE");

        HttpResponseMessage response = await client.GetAsync("/api/v1/auth/me", TestContext.Current.CancellationToken);

        using JsonDocument problem = await ReadJsonAsync(response);
        Assert.Equal("جلستك غير صالحة أو منتهية. سجّل الدخول مرة أخرى.", problem.RootElement.GetProperty("detail").GetString());
    }

    [Fact]
    public async Task SignedInCandidateListingEmptyCatalog_ReceivesEnvelopeWithMessageCode()
    {
        await using DahcApiFactory factory = new();
        HttpClient client = factory.CreateClientFor("candidate-envelope");
        await client.PostAsync("/api/v1/auth/sign-in", null, TestContext.Current.CancellationToken);

        HttpResponseMessage response = await client.GetAsync(
            "/api/v1/programs?cycleId=" + Guid.NewGuid(),
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        using JsonDocument envelope = await ReadJsonAsync(response);
        JsonElement root = envelope.RootElement;
        Assert.Equal(0, root.GetProperty("data").GetArrayLength());
        Assert.Equal(25, root.GetProperty("pagination").GetProperty("limit").GetInt32());
        Assert.Equal(JsonValueKind.Null, root.GetProperty("pagination").GetProperty("nextCursor").ValueKind);
        Assert.Equal("programs.none_available", root.GetProperty("messageCode").GetString());
    }

    private static async Task<JsonDocument> ReadJsonAsync(HttpResponseMessage response)
    {
        string body = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);

        return JsonDocument.Parse(body);
    }
}
