using DAHC.Applications.Service;
using DAHC.Service.Results;

namespace DAHC.Test.Service;

public sealed class PreferenceRulesTests
{
    private static readonly Guid cardiology = Guid.Parse("10000000-0000-0000-0000-000000000001");

    private static readonly Guid surgery = Guid.Parse("10000000-0000-0000-0000-000000000002");

    private static readonly Guid rashidHospital = Guid.Parse("20000000-0000-0000-0000-000000000001");

    private static readonly Guid dubaiHospital = Guid.Parse("20000000-0000-0000-0000-000000000002");

    private static readonly Dictionary<Guid, OfferedSpecialty> offered = new()
    {
        [cardiology] = new OfferedSpecialty(1, new Dictionary<Guid, int> { [rashidHospital] = 11, [dubaiHospital] = 12 }),
        [surgery] = new OfferedSpecialty(2, new Dictionary<Guid, int> { [rashidHospital] = 21 }),
    };

    [Fact]
    public void OfferedSpecialtiesWithOrderedSites_AreValid()
    {
        PreferenceInput[] preferences =
        [
            new(cardiology, 1, [new(dubaiHospital, 1), new(rashidHospital, 2)]),
            new(surgery, 2, [new(rashidHospital, 1)]),
        ];

        IReadOnlyList<ValidationIssue> issues = PreferenceRules.Validate(preferences, 2, offered);

        Assert.Empty(issues);
    }

    [Fact]
    public void BothPreferencesSameSpecialty_IsRefused()
    {
        PreferenceInput[] preferences =
        [
            new(cardiology, 1, [new(rashidHospital, 1)]),
            new(cardiology, 2, [new(dubaiHospital, 1)]),
        ];

        IReadOnlyList<ValidationIssue> issues = PreferenceRules.Validate(preferences, 2, offered);

        ValidationIssue issue = Assert.Single(issues);
        Assert.Equal(ApplicationErrorCodes.DuplicateSpecialty, issue.Code);
        Assert.Equal("/preferences/1/specialtyId", issue.Pointer);
    }

    [Fact]
    public void SameSiteTwiceForOneSpecialty_IsRefused()
    {
        PreferenceInput[] preferences =
        [
            new(cardiology, 1, [new(rashidHospital, 1), new(rashidHospital, 2)]),
        ];

        IReadOnlyList<ValidationIssue> issues = PreferenceRules.Validate(preferences, 2, offered);

        ValidationIssue issue = Assert.Single(issues);
        Assert.Equal(ApplicationErrorCodes.DuplicateSite, issue.Code);
    }

    [Fact]
    public void SecondPreferenceForSinglePreferenceProgram_IsRefused()
    {
        PreferenceInput[] preferences =
        [
            new(cardiology, 1, [new(rashidHospital, 1)]),
            new(surgery, 2, [new(rashidHospital, 1)]),
        ];

        IReadOnlyList<ValidationIssue> issues = PreferenceRules.Validate(preferences, 1, offered);

        ValidationIssue issue = Assert.Single(issues);
        Assert.Equal(ApplicationErrorCodes.PreferenceCountInvalid, issue.Code);
    }

    [Fact]
    public void SiteNotOfferedForChosenSpecialty_IsRefused()
    {
        PreferenceInput[] preferences =
        [
            new(surgery, 1, [new(dubaiHospital, 1)]),
        ];

        IReadOnlyList<ValidationIssue> issues = PreferenceRules.Validate(preferences, 2, offered);

        ValidationIssue issue = Assert.Single(issues);
        Assert.Equal(ApplicationErrorCodes.SiteUnavailable, issue.Code);
    }
}
