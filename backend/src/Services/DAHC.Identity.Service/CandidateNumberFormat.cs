using System.Globalization;

namespace DAHC.Identity.Service;

/// <summary>
/// Candidate numbers are 9 digits from <c>000000001</c>, stored and exchanged as text so leading zeros are kept
/// (D-05, D-13).
/// </summary>
public static class CandidateNumberFormat
{
    public const int MaxValue = 999_999_999;

    public static string Format(long sequenceValue)
    {
        ArgumentOutOfRangeException.ThrowIfLessThan(sequenceValue, 1);
        ArgumentOutOfRangeException.ThrowIfGreaterThan(sequenceValue, MaxValue);

        return sequenceValue.ToString("D9", CultureInfo.InvariantCulture);
    }
}
