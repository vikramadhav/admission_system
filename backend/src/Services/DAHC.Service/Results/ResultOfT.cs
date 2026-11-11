namespace DAHC.Service.Results;

/// <summary>
/// The result of a service operation that produces a value when it succeeds.
/// Services return expected failures as results and never throw for them.
/// </summary>
public sealed class Result<T>
{
    private readonly T? value;

    internal Result(ResultStatus status, T? value, ResultError? error)
    {
        this.Status = status;
        this.value = value;
        this.Error = error;
    }

    public ResultStatus Status { get; }

    public ResultError? Error { get; }

    public bool IsSuccess => this.Status == ResultStatus.Success;

    public T Value
    {
        get
        {
            if (!this.IsSuccess)
            {
                throw new InvalidOperationException("A failed result has no value.");
            }

            // A successful result is only created through Result.Success, which always supplies the value.
            return this.value!;
        }
    }

    /// <summary>
    /// Carries this failure over to a result of another value type.
    /// </summary>
    public Result<TOther> ToFailure<TOther>()
    {
        if (this.IsSuccess
            || this.Error is null)
        {
            throw new InvalidOperationException("Only a failed result can be converted to another failure.");
        }

        return new Result<TOther>(this.Status, default, this.Error);
    }
}
