using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace DAHC.Data;

/// <summary>
/// EF Core conversion between an enum and its stored code (<see cref="EnumCodes"/>).
/// </summary>
public sealed class EnumCodeConverter<TEnum> : ValueConverter<TEnum, string>
    where TEnum : struct, Enum
{
    public EnumCodeConverter()
        : base(
            value => EnumCodes.ToCode(value),
            code => EnumCodes.FromCode<TEnum>(code))
    {
    }
}
