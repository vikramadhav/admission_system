using System.Globalization;
using DAHC.Service.Time;

namespace DAHC.Test.Service;

public sealed class LocalTimeServiceTests
{
    private static readonly LocaleSettings defaultLocale = new("Asia/Dubai", "en-AE", ["en-AE", "ar-AE"]);

    [Theory]
    [InlineData("2026-03-28T23:30:00+00:00", "Europe/London", "2026-03-28")]
    [InlineData("2026-03-29T23:30:00+00:00", "Europe/London", "2026-03-30")]
    [InlineData("2026-10-24T23:30:00+00:00", "Europe/London", "2026-10-25")]
    [InlineData("2026-10-25T23:30:00+00:00", "Europe/London", "2026-10-25")]
    [InlineData("2026-11-11T20:30:00+00:00", "Asia/Dubai", "2026-11-12")]
    public void UtcInstantNearMidnight_ConvertsToLocalDateOfItsZone(
        string utcInstant,
        string timeZoneId,
        string expectedLocalDate)
    {
        LocalTimeService service = new(new FakeTimeProvider(DateTimeOffset.UnixEpoch), defaultLocale);
        DateTimeOffset instant = DateTimeOffset.Parse(utcInstant, CultureInfo.InvariantCulture);

        DateOnly localDate = service.GetLocalDate(instant, timeZoneId);

        Assert.Equal(DateOnly.Parse(expectedLocalDate, CultureInfo.InvariantCulture), localDate);
    }

    [Fact]
    public void TodayWithoutUserZone_UsesInjectedClockInDefaultZone()
    {
        DateTimeOffset lateEveningUtc = new(2026, 11, 11, 21, 0, 0, TimeSpan.Zero);
        LocalTimeService service = new(new FakeTimeProvider(lateEveningUtc), defaultLocale);

        DateOnly today = service.GetToday(null);

        Assert.Equal(new DateOnly(2026, 11, 12), today);
    }
}
