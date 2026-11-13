import { ChangeDetectionStrategy, Component } from '@angular/core';

import { DahcFormControl, provideDahcValueAccessor } from '../../core/forms/form-control';

/**
 * On / off switch for a setting that takes effect immediately; use a checkbox for choices that
 * are submitted with a form. Label as content: <dahc-switch formControlName="sms">SMS reminders</dahc-switch>.
 * A native checkbox with role="switch", so Space toggles it and screen readers say "on" / "off".
 * DERIVED design (DH has no switch): 44 x 24px track, 18px thumb, navy-700 off, navy on.
 * Pending UX sign-off. Ported from dubai-health-ui (packages/components/src/switch/dh-switch.ts).
 */
@Component({
  selector: 'dahc-switch',
  templateUrl: './switch.component.html',
  styleUrl: './switch.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideDahcValueAccessor(() => DahcSwitchComponent)],
})
export class DahcSwitchComponent extends DahcFormControl<boolean> {
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
