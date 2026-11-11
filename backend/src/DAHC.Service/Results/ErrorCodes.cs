namespace DAHC.Service.Results;

/// <summary>
/// Error codes shared by more than one module. Module-specific codes live with the module's rules.
/// </summary>
public static class ErrorCodes
{
    public const string NotFound = "resource.not_found";

    public const string ValidationFailed = "request.validation_failed";

    public const string InvalidSort = "request.invalid_sort";

    public const string InvalidCursor = "request.invalid_cursor";

    public const string IdempotencyKeyReused = "request.idempotency_key_reused";

    public const string PreconditionRequired = "request.precondition_required";

    public const string PreconditionFailed = "request.precondition_failed";
}
