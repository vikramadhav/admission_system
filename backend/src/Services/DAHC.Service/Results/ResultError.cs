namespace DAHC.Service.Results;

/// <summary>
/// A stable, dotted business error code (for example <c>account.not_registered</c>) and any field issues.
/// Codes are resolved to localized messages by the API; they never carry stored values.
/// </summary>
public sealed record ResultError(string Code, IReadOnlyList<ValidationIssue> Issues);

/// <summary>
/// One invalid field: a stable code and an optional JSON Pointer to the field in the request.
/// </summary>
public sealed record ValidationIssue(string Code, string? Pointer);
