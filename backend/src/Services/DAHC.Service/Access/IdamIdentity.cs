namespace DAHC.Service.Access;

/// <summary>
/// The external identity behind a validated user token: the token's validated issuer (<c>iss</c>) and subject
/// (<c>sub</c>). Local users are matched on both together, never on the subject alone (AP-04), so the same subject
/// from a different issuer is a different identity.
/// </summary>
public sealed record IdamIdentity
{
    public IdamIdentity(string issuer, string subject)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(issuer);
        ArgumentException.ThrowIfNullOrWhiteSpace(subject);

        this.Issuer = issuer;
        this.Subject = subject;
    }

    public string Issuer { get; }

    public string Subject { get; }
}
