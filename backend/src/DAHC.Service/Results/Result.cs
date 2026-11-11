namespace DAHC.Service.Results;

/// <summary>
/// Creates <see cref="Result{T}"/> values.
/// </summary>
public static class Result
{
    public static Result<T> Success<T>(T value)
    {
        ArgumentNullException.ThrowIfNull(value);

        return new Result<T>(ResultStatus.Success, value, null);
    }

    public static Result<T> Failure<T>(ResultStatus status, string code)
    {
        return Failure<T>(status, code, []);
    }

    public static Result<T> Failure<T>(
        ResultStatus status,
        string code,
        IReadOnlyList<ValidationIssue> issues)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(code);
        ArgumentNullException.ThrowIfNull(issues);

        if (status == ResultStatus.Success)
        {
            throw new ArgumentException("A failure needs a failure status.", nameof(status));
        }

        return new Result<T>(status, default, new ResultError(code, issues));
    }

    /// <summary>
    /// The same response for a record that does not exist and one the caller may not see.
    /// </summary>
    public static Result<T> NotFound<T>()
    {
        return Failure<T>(ResultStatus.NotFound, ErrorCodes.NotFound);
    }
}
