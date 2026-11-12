import { ChangeDetectionStrategy, Component, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { dahcUniqueId } from '../a11y/unique-id';
import { DahcSelectOption } from './select-option';

/**
 * Single-choice drop-down built on the native <select>, which gives the platform's own
 * accessible list on every device. The empty string means "nothing selected".
 */
@Component({
  selector: 'dahc-select',
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DahcSelectComponent),
      multi: true,
    },
  ],
})
export class DahcSelectComponent implements ControlValueAccessor {
  readonly label = input.required<string>();
  readonly options = input<readonly DahcSelectOption[]>([]);
  readonly placeholder = input<string>($localize`:@@dahcUi.select.placeholder:Select an option`);
  readonly description = input<string>('');
  readonly errorMessage = input<string>('');
  readonly invalid = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly disabled = input<boolean>(false);

  protected readonly controlId = dahcUniqueId('dahc-select');
  protected readonly descriptionId = `${this.controlId}-description`;
  protected readonly errorId = `${this.controlId}-error`;
  protected readonly value = signal<string>('');
  protected readonly showError = computed<boolean>(() => this.invalid() && this.errorMessage() !== '');
  protected readonly isDisabled = computed<boolean>(() => this.disabled() || this.formDisabled());
  protected readonly describedBy = computed<string | null>(() => {
    const ids: string[] = [];

    if (this.description() !== '') {
      ids.push(this.descriptionId);
    }

    if (this.showError()) {
      ids.push(this.errorId);
    }

    return ids.length > 0 ? ids.join(' ') : null;
  });

  private readonly formDisabled = signal<boolean>(false);
  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(onChange: (value: string) => void): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void): void {
    this.onTouched = onTouched;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  protected onSelectionChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.value.set(selectedValue);
    this.onChange(selectedValue);
  }

  protected onBlur(): void {
    this.onTouched();
  }
}
