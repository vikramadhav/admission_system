import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { DahcFormControl, provideDahcValueAccessor } from '../../core/forms/form-control';
import { DahcIconComponent } from '../../core/icon/icon.component';

/**
 * Checkbox with its label as content: <dahc-checkbox formControlName="terms">I accept the terms</dahc-checkbox>.
 * Figma Controls 50:7880 (Type=1. Checkbox): 24px hit area, 18px box with 2px navy border, radius 4,
 * label Dubai 16/20 with an 8px gap. Checked uses the navy box with the blue tick of the Figma
 * multi-select option (A11y fix, see control-checked tokens). Hover, focus, disabled, invalid and
 * indeterminate are DAHC additions; the label stays Regular when checked so long labels do not reflow.
 */
@Component({
  selector: 'dahc-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcIconComponent],
  providers: [provideDahcValueAccessor(() => DahcCheckboxComponent)],
})
export class DahcCheckboxComponent extends DahcFormControl<boolean> {
  /** Shows a dash instead of the tick, for example "select all" when only some are selected. */
  readonly indeterminate = input<boolean>(false);
  readonly invalid = input<boolean>(false);
  readonly required = input<boolean>(false);

  protected emptyValue(): boolean {
    return false;
  }

  protected onToggle(event: Event): void {
    this.commitValue((event.target as HTMLInputElement).checked);
  }

  protected onBlur(): void {
    this.markTouched();
  }
}
