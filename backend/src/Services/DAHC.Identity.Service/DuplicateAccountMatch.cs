namespace DAHC.Identity.Service;

/// <summary>
/// Which identity attributes of a new sign-in match an existing candidate (US-1.1.1 AC4).
/// </summary>
public sealed record DuplicateAccountMatch(bool OnEmiratesId, bool OnPassport, bool OnMobile)
{
    public bool IsMatch => this.OnEmiratesId || this.OnPassport || this.OnMobile;

    public static DuplicateAccountMatch Compare(IdentityAttributes incoming, IdentityAttributes existing)
    {
        ArgumentNullException.ThrowIfNull(incoming);
        ArgumentNullException.ThrowIfNull(existing);

        DuplicateAccountMatch match = new(
            AreEqual(incoming.EmiratesIdNumber, existing.EmiratesIdNumber),
            AreEqual(incoming.PassportNumber, existing.PassportNumber),
            AreEqual(incoming.MobileNumber, existing.MobileNumber));

        return match;
    }

    private static bool AreEqual(string? first, string? second)
    {
        return first is not null
            && string.Equals(first, second, StringComparison.Ordinal);
    }
}
