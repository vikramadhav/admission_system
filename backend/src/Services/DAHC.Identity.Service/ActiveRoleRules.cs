namespace DAHC.Identity.Service;

/// <summary>
/// Active-role rules (standard s.15): authorization uses one active role, always one the user holds.
/// </summary>
public static class ActiveRoleRules
{
    /// <summary>
    /// The stored active role while it is still held; otherwise the first held role in the configured order;
    /// null when no role is left.
    /// </summary>
    public static string? ResolveActiveRole(
        IReadOnlyCollection<string> heldRoles,
        string? storedActiveRole,
        IReadOnlyList<string> roleOrder)
    {
        ArgumentNullException.ThrowIfNull(heldRoles);
        ArgumentNullException.ThrowIfNull(roleOrder);

        if (storedActiveRole is not null
            && heldRoles.Contains(storedActiveRole, StringComparer.Ordinal))
        {
            return storedActiveRole;
        }

        string? defaultRole = roleOrder.FirstOrDefault(role => heldRoles.Contains(role, StringComparer.Ordinal));

        return defaultRole;
    }

    public static bool CanSwitchTo(IReadOnlyCollection<string> heldRoles, string requestedRole)
    {
        ArgumentNullException.ThrowIfNull(heldRoles);

        return heldRoles.Contains(requestedRole, StringComparer.Ordinal);
    }

    /// <summary>
    /// Held roles in the configured order, so every response lists them the same way.
    /// </summary>
    public static IReadOnlyList<string> OrderRoles(
        IEnumerable<string> heldRoles,
        IReadOnlyList<string> roleOrder)
    {
        ArgumentNullException.ThrowIfNull(heldRoles);
        ArgumentNullException.ThrowIfNull(roleOrder);

        HashSet<string> distinctRoles = new(heldRoles, StringComparer.Ordinal);
        List<string> orderedRoles = roleOrder.Where(distinctRoles.Contains).ToList();

        return orderedRoles;
    }
}
