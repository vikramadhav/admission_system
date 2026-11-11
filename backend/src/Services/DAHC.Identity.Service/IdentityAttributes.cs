namespace DAHC.Identity.Service;

/// <summary>
/// The normalised identity attributes used by the duplicate-account check (US-1.1.1 AC4), stored on the candidate
/// as plain values (D-25). They are personal data: never written to logs or audit records (standard s.8, s.13).
/// </summary>
public sealed record IdentityAttributes(string? EmiratesIdNumber, string? PassportNumber, string? MobileNumber)
{
    public static IdentityAttributes FromProfile(IdentityProfile profile)
    {
        ArgumentNullException.ThrowIfNull(profile);

        IdentityAttributes attributes = new(
            NormalizeEmiratesId(profile.EmiratesId),
            NormalizePassport(profile.PassportNumber),
            NormalizeMobile(profile.MobileNumber));

        return attributes;
    }

    /// <summary>
    /// Digits only, so <c>784-1990-1234567-1</c> and <c>784199012345671</c> match.
    /// </summary>
    public static string? NormalizeEmiratesId(string? emiratesId)
    {
        return EmptyAsNull(KeepDigits(emiratesId));
    }

    /// <summary>
    /// Letters and digits only, upper case.
    /// </summary>
    public static string? NormalizePassport(string? passportNumber)
    {
        if (passportNumber is null)
        {
            return null;
        }

        string normalized = new(passportNumber.Where(char.IsAsciiLetterOrDigit).ToArray());

        return EmptyAsNull(normalized.ToUpperInvariant());
    }

    /// <summary>
    /// International form <c>+&lt;digits&gt;</c>: <c>00971 50 123 4567</c> and <c>+971501234567</c> match.
    /// </summary>
    public static string? NormalizeMobile(string? mobileNumber)
    {
        string? digits = EmptyAsNull(KeepDigits(mobileNumber));

        if (digits is null)
        {
            return null;
        }

        if (digits.StartsWith("00", StringComparison.Ordinal))
        {
            digits = digits[2..];
        }

        return "+" + digits;
    }

    private static string? KeepDigits(string? value)
    {
        if (value is null)
        {
            return null;
        }

        return new string(value.Where(char.IsAsciiDigit).ToArray());
    }

    private static string? EmptyAsNull(string? value)
    {
        return string.IsNullOrEmpty(value) ? null : value;
    }
}
