using System.ComponentModel.DataAnnotations;
using DAHC.API.Authentication;

namespace DAHC.API.Configuration;

/// <summary>
/// The IDAM UserInfo field that carries each profile attribute. Configured per environment, because the names
/// depend on the IDAM definition (OQ-15); the defaults are the OpenID Connect standard names and the UAE PASS
/// Emirates ID name.
/// </summary>
public sealed class IdamUserInfoClaimOptions
{
    [Required]
    public string Name { get; set; } = IdamClaimNames.Name;

    [Required]
    public string Email { get; set; } = IdamClaimNames.Email;

    [Required]
    public string PhoneNumber { get; set; } = IdamClaimNames.PhoneNumber;

    [Required]
    public string EmiratesId { get; set; } = IdamClaimNames.EmiratesId;

    [Required]
    public string PassportNumber { get; set; } = IdamClaimNames.PassportNumber;

    public bool IsComplete()
    {
        string[] names = [this.Name, this.Email, this.PhoneNumber, this.EmiratesId, this.PassportNumber];

        return names.All(name => !string.IsNullOrWhiteSpace(name))
            && names.Distinct(StringComparer.Ordinal).Count() == names.Length;
    }
}
