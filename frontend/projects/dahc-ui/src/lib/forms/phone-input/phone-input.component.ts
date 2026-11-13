import { ChangeDetectionStrategy, Component, computed, forwardRef, input, linkedSignal, signal } from '@angular/core';
import { NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

import { DahcFormControl, provideDahcValueAccessor } from '../../core/forms/form-control';
import { DahcFormFieldComponent } from '../form-field/form-field.component';
import { DahcInputDirective } from '../input/input.directive';

export interface DahcPhoneCountry {
  /** ISO 3166-1 alpha-2 code, shown in the selector: "AE". */
  readonly code: string;
  /** International dialling code with the plus: "+971". */
  readonly dialCode: string;
  /** Full country name, shown as the option tooltip. */
  readonly name: string;
}

/** GCC first, then countries common among GME candidates; override with [countries]. */
export const DAHC_DEFAULT_PHONE_COUNTRIES: readonly DahcPhoneCountry[] = [
  { code: 'AE', dialCode: '+971', name: 'United Arab Emirates' },
  { code: 'SA', dialCode: '+966', name: 'Saudi Arabia' },
  { code: 'KW', dialCode: '+965', name: 'Kuwait' },
  { code: 'QA', dialCode: '+974', name: 'Qatar' },
  { code: 'BH', dialCode: '+973', name: 'Bahrain' },
  { code: 'OM', dialCode: '+968', name: 'Oman' },
  { code: 'EG', dialCode: '+20', name: 'Egypt' },
  { code: 'JO', dialCode: '+962', name: 'Jordan' },
  { code: 'LB', dialCode: '+961', name: 'Lebanon' },
  { code: 'IN', dialCode: '+91', name: 'India' },
  { code: 'PK', dialCode: '+92', name: 'Pakistan' },
  { code: 'PH', dialCode: '+63', name: 'Philippines' },
  { code: 'GB', dialCode: '+44', name: 'United Kingdom' },
  { code: 'US', dialCode: '+1', name: 'United States' },
];

/**
 * Phone number with a country code selector in one field (GME "Phone number input" with a
 * country selector chevron). The form value is one international string, "+971501234567", or ''.
 * Also a validator: { dahcPhone } when the national number has non-digits or is not 6 to 12 digits.
 * The number is typed as digits; spaces and dashes are allowed while typing and removed.
 * Field: Figma Input field 50:7763; the selector is DERIVED, pending UX sign-off.
 */
@Component({
  selector: 'dahc-phone-input',
  templateUrl: './phone-input.component.html',
  styleUrl: './phone-input.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcFormFieldComponent, DahcInputDirective],
  providers: [
    provideDahcValueAccessor(() => DahcPhoneInputComponent),
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => DahcPhoneInputComponent), multi: true },
  ],
})
export class DahcPhoneInputComponent extends DahcFormControl<string> implements Validator {
  readonly label = input.required<string>();
  readonly hint = input<string>('');
  readonly errorMessage = input<string>($localize`:@@dahcUi.phone.invalid:Enter a phone number of 6 to 12 digits.`);
  readonly invalid = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly countries = input<readonly DahcPhoneCountry[]>(DAHC_DEFAULT_PHONE_COUNTRIES);
  /** Country selected when the value is empty. */
  readonly defaultCountry = input<string>('AE');
  readonly placeholder = input<string>('50 123 4567');
  readonly countryLabel = input<string>($localize`:@@dahcUi.phone.country:Country code`);

  /** The selected country, from the value when it has one. */
  protected readonly country = linkedSignal<DahcPhoneCountry | undefined>(
    () => this.split(this.value()).country ?? this.countries().find(country => country.code === this.defaultCountry()),
  );
  /** The national number as typed; follows the value until the user types. */
  protected readonly number = linkedSignal<string>(() => this.split(this.value()).number);
  private readonly touchedInvalid = signal<boolean>(false);

  protected readonly showError = computed<boolean>(() => this.invalid() || this.touchedInvalid());

  validate(): ValidationErrors | null {
    return this.isValidNumber(this.number()) ? null : { dahcPhone: true };
  }

  protected emptyValue(): string {
    return '';
  }

  protected onCountryChange(event: Event): void {
    const code = (event.target as HTMLSelectElement).value;
    this.country.set(this.countries().find(country => country.code === code));
    this.commit();
  }

  protected onNumberInput(event: Event): void {
    this.number.set((event.target as HTMLInputElement).value);
    this.commit();
  }

  protected onBlur(): void {
    this.touchedInvalid.set(!this.isValidNumber(this.number()));
    this.markTouched();
  }

  private commit(): void {
    const digits = this.digits(this.number());
    const dialCode = this.country()?.dialCode ?? '';
    this.commitValue(digits === '' ? '' : `${dialCode}${digits}`);
  }

  private digits(text: string): string {
    return text.replace(/[\s-]/g, '');
  }

  /** Empty is valid here; use Validators.required for a mandatory phone number. */
  private isValidNumber(text: string): boolean {
    const digits = this.digits(text);

    return digits === '' || /^\d{6,12}$/.test(digits);
  }

  /** Splits "+971501234567" on the longest matching dialling code. */
  private split(value: string): { country: DahcPhoneCountry | undefined; number: string } {
    const country = [...this.countries()]
      .sort((first, second) => second.dialCode.length - first.dialCode.length)
      .find(candidate => value.startsWith(candidate.dialCode));

    return { country, number: country ? value.slice(country.dialCode.length) : value.replace(/^\+/, '') };
  }
}
