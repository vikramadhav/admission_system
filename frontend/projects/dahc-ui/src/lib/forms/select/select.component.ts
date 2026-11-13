import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { DahcFormControl, provideDahcValueAccessor } from '../../core/forms/form-control';
import { DahcIconComponent } from '../../core/icon/icon.component';
import { DahcFormFieldComponent } from '../form-field/form-field.component';
import { DahcInputDirective } from '../input/input.directive';
import { DahcSelectOption } from './select-option';

/**
 * Single-choice drop-down built on the native <select>, which gives the platform's own
 * accessible list on every device, inside a dahc-form-field (Figma Dropdown 50:13303).
 * The empty string means "nothing selected".
 */
@Component({
  selector: 'dahc-select',
  templateUrl: './select.component.html',
  styleUrl: './select.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcFormFieldComponent, DahcIconComponent, DahcInputDirective],
  providers: [provideDahcValueAccessor(() => DahcSelectComponent)],
})
export class DahcSelectComponent extends DahcFormControl<string> {
  readonly label = input.required<string>();
  readonly options = input<readonly DahcSelectOption[]>([]);
  readonly placeholder = input<string>($localize`:@@dahcUi.select.placeholder:Select an option`);
  readonly description = input<string>('');
  readonly errorMessage = input<string>('');
  readonly invalid = input<boolean>(false);
  readonly required = input<boolean>(false);

  protected emptyValue(): string {
    return '';
  }

  protected onSelectionChange(event: Event): void {
    this.commitValue((event.target as HTMLSelectElement).value);
  }

  protected onBlur(): void {
    this.markTouched();
  }
}
