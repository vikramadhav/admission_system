using System.Buffers.Text;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using DAHC.Service.Results;

namespace DAHC.Service.Paging;

/// <summary>
/// Encodes and validates opaque page cursors. A cursor is bound to the query context it was issued for
/// (operation, filters and sort), so a cursor from another query is refused rather than misread.
/// </summary>
public static class CursorCodec
{
    private const int MaxOffset = 100_000;

    public static string Encode(int offset, string context)
    {
        ArgumentOutOfRangeException.ThrowIfNegative(offset);
        ArgumentException.ThrowIfNullOrWhiteSpace(context);

        CursorPayload payload = new(offset, Fingerprint(context));
        byte[] json = JsonSerializer.SerializeToUtf8Bytes(payload);

        return Base64Url.EncodeToString(json);
    }

    /// <summary>
    /// Returns the offset the cursor points at, or zero when no cursor is given.
    /// </summary>
    public static Result<int> Decode(string? cursor, string context)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(context);

        if (string.IsNullOrEmpty(cursor))
        {
            return Result.Success(0);
        }

        CursorPayload? payload = TryRead(cursor);

        if (payload is null
            || payload.Offset < 0
            || payload.Offset > MaxOffset
            || payload.Context != Fingerprint(context))
        {
            return Result.Failure<int>(ResultStatus.BadRequest, ErrorCodes.InvalidCursor);
        }

        return Result.Success(payload.Offset);
    }

    private static CursorPayload? TryRead(string cursor)
    {
        try
        {
            byte[] json = Base64Url.DecodeFromChars(cursor);

            return JsonSerializer.Deserialize<CursorPayload>(json);
        }
        catch (Exception exception) when (exception is FormatException or JsonException)
        {
            return null;
        }
    }

    private static string Fingerprint(string context)
    {
        byte[] hash = SHA256.HashData(Encoding.UTF8.GetBytes(context));

        return Convert.ToHexString(hash, 0, 8);
    }

    private sealed record CursorPayload(int Offset, string Context);
}
