namespace DAHC.Identity.Service;

/// <summary>
/// Allocates the next candidate number from the database sequence (D-05). A separate boundary because the
/// sequence is a SQL Server object the in-memory test provider cannot run.
/// </summary>
public interface ICandidateNumberAllocator
{
    Task<string> AllocateAsync(CancellationToken cancellationToken);
}
