import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { DahcFormControl, provideDahcValueAccessor } from '../../core/forms/form-control';
import { DahcFormFieldComponent } from '../form-field/form-field.component';
import { DahcInputDirective } from '../input/input.directive';

/**
 * Time field. The form value is "HH:MM" (24-hour, or "HH:MM:SS" with a step under a minute), or
 * '' when empty. Uses the native time input for reliable keyboard entry and mobile pickers;
 * [min], [max] and [step] (seconds) set its native constraints.
 * DERIVED design on the DH Input field (50:7763). Ported from dubai-health-ui dh-time-picker
 * (form/dh-form-controls.ts).
 */
@Component({
  selector: 'dahc-time-picker',
  templateUrl: './time-picker.component.html',
  styleUrl: './time-picker.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcFormFieldComponent, DahcInputDirective],
  providers: [provideDahcValueAccessor(() => DahcTimePickerComponent)],
})
export class DahcTimePickerComponent extends DahcFormControl<string> {
  readonly label = input.required<string>();
  readonly hint = input<string>('');
  readonly errorMessage = input<string>('');
  readonly invalid = input<boolean>(false);
  readonly required = input<boolean>(false);
  /** Earliest time, "HH:MM". */
  readonly min = input<string>('');
  /** Latest time, "HH:MM". */
  readonly max = input<string>('');
  /** Step in seconds (900 = 15 minutes). */
  readonly step = input<number>(60);

  protected emptyValue(): string {
    return '';
  }

  protected onInput(event: Event): void {
    this.commitValue((event.target as HTMLInputElement).value);
  }

  protected onBlur(): void {
    this.markTouched();
  }
}
