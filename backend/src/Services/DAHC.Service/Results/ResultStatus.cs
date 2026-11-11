namespace DAHC.Service.Results;

/// <summary>
/// The outcome of a service operation. The API maps each value to one HTTP status code.
/// </summary>
public enum ResultStatus
{
    Success,
    BadRequest,
    Unauthenticated,
    Forbidden,
    NotFound,
    Conflict,
    PreconditionFailed,
    ValidationFailed,
    PreconditionRequired,
    Unavailable,
}
