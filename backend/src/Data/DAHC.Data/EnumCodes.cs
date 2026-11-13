using System.Text.Json;

namespace DAHC.Data;

/// <summary>
/// Stores enums as the upper snake-case codes used by the reference data and the API contract
/// (<c>CorrectionRequired</c> is stored as <c>CORRECTION_REQUIRED</c>).
/// </summary>
public static class EnumCodes
{
    public static string ToCode<TEnum>(TEnum value)
        where TEnum : struct, Enum
    {
        return JsonNamingPolicy.SnakeCaseUpper.ConvertName(value.ToString());
    }

    public static TEnum FromCode<TEnum>(string code)
        where TEnum : struct, Enum
    {
        foreach (TEnum value in Enum.GetValues<TEnum>())
        {
            if (ToCode(value) == code)
            {
                return value;
            }
        }

        throw new InvalidOperationException($"The stored code is not a known {typeof(TEnum).Name} value.");
    }
}
