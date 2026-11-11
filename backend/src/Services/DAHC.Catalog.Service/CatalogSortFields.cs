namespace DAHC.Catalog.Service;

/// <summary>
/// The allow-listed sort fields of the catalog lists.
/// </summary>
public static class CatalogSortFields
{
    public const string Name = "name";

    public const string Code = "code";

    public const string ApplicationOpensAt = "applicationOpensAt";

    public static IReadOnlyList<string> Programs { get; } = [Name, Code, ApplicationOpensAt];

    public static IReadOnlyList<string> SpecialtiesAndSites { get; } = [Name, Code];
}
