using System.Data.Common;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace DAHC.Data;

/// <summary>
/// The one exception type data services throw for a database failure. It names the operation
/// (<c>"&lt;Service&gt;.&lt;Method&gt;"</c>), keeps the original as the inner exception and carries only safe
/// facts. Lower layers wrap and rethrow; the API's exception handler is the only place that logs it.
/// </summary>
public sealed class DahcDataException : Exception
{
    public DahcDataException(string operation, Exception innerException)
        : base($"Database operation {operation} failed.", innerException)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(operation);

        this.Operation = operation;
        this.SqlErrorNumber = FindSqlErrorNumber(innerException);
    }

    public string Operation { get; }

    public int? SqlErrorNumber { get; }

    public static bool IsDatabaseFailure(Exception exception)
    {
        return exception is DbException or DbUpdateException;
    }

    /// <summary>
    /// A unique index or constraint rejected the write (SQL Server errors 2601 and 2627).
    /// </summary>
    public static bool IsUniqueViolation(Exception exception)
    {
        int? errorNumber = FindSqlErrorNumber(exception);

        return errorNumber is 2601 or 2627;
    }

    private static int? FindSqlErrorNumber(Exception? exception)
    {
        while (exception is not null)
        {
            if (exception is SqlException sqlException)
            {
                return sqlException.Number;
            }

            exception = exception.InnerException;
        }

        return null;
    }
}
