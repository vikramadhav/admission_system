import { ChangeDetectionStrategy, Component, Signal, computed, input, signal } from '@angular/core';

import { dahcUniqueId } from '../../core/a11y/unique-id';
import { DahcIconComponent } from '../../core/icon/icon.component';
import { DAHC_FORM_FIELD, DahcFormFieldContext } from './form-field-context';

/** success: Figma Input field State=5. Success (50:7796), also used for GME "Verified via ICP". */
export type DahcFormFieldStatus = 'none' | 'success';

/**
 * Label, field box, hint and error around one native control:
 *
 *   <dahc-form-field label="Email" hint="We send the receipt here." error="Enter a valid email.">
 *     <input dahcInput type="email" formControlName="email" />
 *   </dahc-form-field>
 *
 * Figma Input field 50:7763 (label Regular 14/18, field 48px with 14/16 padding, radius 12,
 * hint Medium 12/16, 6px gaps). The error replaces the hint and shows when the projected form
 * control is invalid and touched, or when [invalid] is set. Optional start / end adornments:
 * elements with the dahcFieldStart / dahcFieldEnd attribute (icons, buttons).
 * Focus ring, error icon and the required marker are DAHC additions (Figma has none). With
 * showCount the field shows "length / maxlength" under the control, like dubai-health-ui
 * dh-textarea show-count (the control's native maxlength sets the limit).
 */
@Component({
  selector: 'dahc-form-field',
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcIconComponent],
  providers: [{ provide: DAHC_FORM_FIELD, useExisting: DahcFormFieldComponent }],
  host: {
    '[class.dahc-form-field--error]': 'showError()',
    '[class.dahc-form-field--success]': "status() === 'success' && !showError()",
  },
})
export class DahcFormFieldComponent implements DahcFormFieldContext {
  readonly label = input.required<string>();
  readonly hint = input<string>('');
  /** Message shown when the control is invalid. */
  readonly error = input<string>('');
  /** Forces the error state, for controls not bound to a form or validated elsewhere. */
  readonly invalid = input<boolean>(false);
  /** Shows the required marker and sets aria-required on the control. */
  readonly required = input<boolean>(false);
  readonly status = input<DahcFormFieldStatus>('none');
  /** Hides the label visually; it remains the control's accessible name. */
  readonly hideLabel = input<boolean>(false);
  /** Shows a character counter (dubai-health-ui show-count); the limit is the control's maxlength. */
  readonly showCount = input<boolean>(false);

  readonly controlId = dahcUniqueId('dahc-field');
  protected readonly hintId = `${this.controlId}-hint`;
  protected readonly errorId = `${this.controlId}-error`;
  protected readonly countId = `${this.controlId}-count`;

  private readonly controlInvalid = signal<Signal<boolean>>(signal(false));
  private readonly controlLength = signal<Signal<number>>(signal(0));
  private readonly controlMaxLength = signal<Signal<number>>(signal(-1));

  /** "12 / 200", or "12" when the control has no maxlength. */
  protected readonly countText = computed<string>(() => {
    const length = this.controlLength()();
    const max = this.controlMaxLength()();

    return max > 0 ? `${length} / ${max}` : `${length}`;
  });

  readonly showError: Signal<boolean> = computed(
    () => this.error() !== '' && (this.invalid() || this.controlInvalid()()),
  );

  readonly describedBy: Signal<string | null> = computed(() => {
    const ids: string[] = [];

    if (this.hint() !== '' && !this.showError()) {
      ids.push(this.hintId);
    }

    if (this.showError()) {
      ids.push(this.errorId);
    }

    if (this.showCount()) {
      ids.push(this.countId);
    }

    return ids.length > 0 ? ids.join(' ') : null;
  });

  registerControlInvalid(invalid: Signal<boolean>): void {
    this.controlInvalid.set(invalid);
  }

  registerControlLength(length: Signal<number>, maxLength: Signal<number>): void {
    this.controlLength.set(length);
    this.controlMaxLength.set(maxLength);
  }
}
