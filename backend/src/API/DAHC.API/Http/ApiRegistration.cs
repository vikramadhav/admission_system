using System.Text.Json;
using System.Text.Json.Serialization;
using DAHC.API.Responses;
using DAHC.Service.Results;
using Microsoft.AspNetCore.Mvc;

namespace DAHC.API.Http;

/// <summary>
/// Controllers, JSON, the response contract and the exception handler.
/// </summary>
public static class ApiRegistration
{
    private const int MaxJsonDepth = 32;

    private const string InvalidFieldCode = "field.invalid";

    public static IServiceCollection AddDahcApi(this IServiceCollection services)
    {
        ArgumentNullException.ThrowIfNull(services);

        services.AddControllers()
            .AddJsonOptions(json => ConfigureJson(json.JsonSerializerOptions))
            .ConfigureApiBehaviorOptions(behavior => behavior.InvalidModelStateResponseFactory = CreateValidationProblem);

        services.ConfigureHttpJsonOptions(json => ConfigureJson(json.SerializerOptions));

        services.AddSingleton<ProblemFactory>();
        services.AddSingleton<ApiResults>();
        services.AddExceptionHandler<GlobalExceptionHandler>();
        services.AddProblemDetails();
        services.AddHealthChecks();

        return services;
    }

    /// <summary>
    /// camelCase members, enums as their upper snake-case contract codes, unknown members refused and a bounded
    /// depth.
    /// </summary>
    private static void ConfigureJson(JsonSerializerOptions options)
    {
        options.MaxDepth = MaxJsonDepth;
        options.UnmappedMemberHandling = JsonUnmappedMemberHandling.Disallow;
        options.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.SnakeCaseUpper, allowIntegerValues: false));
    }

    private static IActionResult CreateValidationProblem(ActionContext context)
    {
        ProblemFactory problemFactory = context.HttpContext.RequestServices.GetRequiredService<ProblemFactory>();

        // Only the field location is returned: framework messages can echo request values.
        List<ValidationIssue> issues = context.ModelState
            .Where(entry => entry.Value?.Errors.Count > 0)
            .Select(entry => new ValidationIssue(InvalidFieldCode, ToJsonPointer(entry.Key)))
            .ToList();

        return problemFactory.ToActionResult(
            context.HttpContext,
            StatusCodes.Status400BadRequest,
            ErrorCodes.ValidationFailed,
            issues);
    }

    private static string ToJsonPointer(string modelStateKey)
    {
        string path = modelStateKey.StartsWith("$.", StringComparison.Ordinal) ? modelStateKey[2..] : modelStateKey;
        string dotted = path.Replace("[", ".", StringComparison.Ordinal).Replace("]", string.Empty, StringComparison.Ordinal);
        IEnumerable<string> segments = dotted
            .Split('.', StringSplitOptions.RemoveEmptyEntries)
            .Select(segment => JsonNamingPolicy.CamelCase.ConvertName(segment));

        return "/" + string.Join('/', segments);
    }
}
