using DAHC.Applications.Service;
using DAHC.Identity.Service;

namespace DAHC.Test.Service;

public sealed class IdentifierFormatTests
{
    [Theory]
    [InlineData(1, "000000001")]
    [InlineData(123, "000000123")]
    [InlineData(999_999_999, "999999999")]
    public void CandidateSequenceValue_IsNineDigitTextWithLeadingZeros(long sequenceValue, string expected)
    {
        string candidateNumber = CandidateNumberFormat.Format(sequenceValue);

        Assert.Equal(expected, candidateNumber);
    }

    [Fact]
    public void CandidateSequenceBeyondNineDigits_IsRefused()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => CandidateNumberFormat.Format(1_000_000_000));
    }

    [Theory]
    [InlineData(2027, 1, "20270000001")]
    [InlineData(2027, 9_999_999, "20279999999")]
    public void ApplicationCounter_IsPrefixedWithCycleStartYear(short cycleStartYear, int counter, string expected)
    {
        string applicationNumber = ApplicationNumberFormat.Format(cycleStartYear, counter);

        Assert.Equal(expected, applicationNumber);
    }

    [Theory]
    [InlineData("784-1990-1234567-1")]
    [InlineData("784199012345671")]
    public void EmiratesIdWithAndWithoutSeparators_NormalizeEqually(string emiratesId)
    {
        Assert.Equal("784199012345671", IdentityAttributes.NormalizeEmiratesId(emiratesId));
    }

    [Theory]
    [InlineData("+971 50 123 4567")]
    [InlineData("00971501234567")]
    public void MobileInEitherInternationalForm_NormalizesEqually(string mobileNumber)
    {
        Assert.Equal("+971501234567", IdentityAttributes.NormalizeMobile(mobileNumber));
    }

    [Fact]
    public void MissingAttributes_NeverMatch()
    {
        IdentityAttributes empty = new(null, null, null);

        DuplicateAccountMatch match = DuplicateAccountMatch.Compare(empty, empty);

        Assert.False(match.IsMatch);
    }
}
