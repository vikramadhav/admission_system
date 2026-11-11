namespace DAHC.Catalog.Core;

/// <summary>
/// A program offered in a cycle, with its application window (<c>cfg.ProgramCycle</c>). The window is stored as
/// UTC instants plus the IANA time zone it was defined in (D-07).
/// </summary>
public sealed class ProgramCycle
{
    public int ProgramCycleId { get; set; }

    public required Guid PublicId { get; set; }

    public required int ProgramId { get; set; }

    public required int CycleId { get; set; }

    public DateTimeOffset? ApplicationOpensAt { get; set; }

    public DateTimeOffset? ApplicationClosesAt { get; set; }

    public required string TimeZoneId { get; set; }

    public bool IsActive { get; set; }

    /// <summary>
    /// A window is open from its opening instant until (not including) its closing instant. A window without an
    /// opening instant is not open; one without a closing instant stays open.
    /// </summary>
    public bool IsOpenAt(DateTimeOffset instant)
    {
        if (!this.IsActive
            || this.ApplicationOpensAt is null)
        {
            return false;
        }

        bool hasOpened = this.ApplicationOpensAt <= instant;
        bool hasNotClosed = this.ApplicationClosesAt is null || instant < this.ApplicationClosesAt;

        return hasOpened && hasNotClosed;
    }
}
