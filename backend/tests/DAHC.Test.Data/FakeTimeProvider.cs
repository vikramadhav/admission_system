namespace DAHC.Test.Data;

/// <summary>
/// A clock fixed at a chosen UTC instant.
/// </summary>
internal sealed class FakeTimeProvider : TimeProvider
{
    private readonly DateTimeOffset utcNow;

    public FakeTimeProvider(DateTimeOffset utcNow)
    {
        this.utcNow = utcNow;
    }

    public override DateTimeOffset GetUtcNow()
    {
        return this.utcNow;
    }
}
