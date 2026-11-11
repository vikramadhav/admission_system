namespace DAHC.Data.Operations;

/// <summary>
/// A client-supplied <c>Idempotency-Key</c> of a create operation (<c>ops.IdempotencyKey</c>), with the hash of
/// the request it was first used with and the resource that request created.
/// </summary>
public sealed class IdempotencyKey
{
    public long IdempotencyKeyId { get; set; }

    /// <summary>
    /// The operation and the actor, so two users can never collide on the same key.
    /// </summary>
    public required string KeyScope { get; set; }

    public required string KeyValue { get; set; }

    public required byte[] RequestHash { get; set; }

    public short? ResponseStatus { get; set; }

    public string? ResourceId { get; set; }

    public required DateTimeOffset CreatedAt { get; set; }

    public required DateTimeOffset ExpiresAt { get; set; }
}
