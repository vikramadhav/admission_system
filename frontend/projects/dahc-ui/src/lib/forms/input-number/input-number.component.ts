import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

import { DahcFormControl, provideDahcValueAccessor } from '../../core/forms/form-control';
import { DahcFormFieldComponent } from '../form-field/form-field.component';
import { DahcInputDirective } from '../input/input.directive';

/**
 * Number field with decrease and increase buttons. The form value is a number, or null when
 * empty. The native number input keeps its spinbutton role, so ArrowUp / ArrowDown step and
 * screen readers announce the value; typed values are clamped to min / max when committed
 * (change or blur). The buttons are not in the tab order (the keyboard steps from the field).
 * DERIVED design on the DH Input field (50:7763): 32px round navy-100 steppers inside the box.
 * Ported from dubai-health-ui dh-input-number (form/dh-form-controls.ts).
 */
@Component({
  selector: 'dahc-input-number',
  templateUrl: './input-number.component.html',
  styleUrl: './input-number.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcFormFieldComponent, DahcInputDirective],
  providers: [provideDahcValueAccessor(() => DahcInputNumberComponent)],
})
export class DahcInputNumberComponent extends DahcFormControl<number | null> {
  readonly label = input.required<string>();
  readonly hint = input<string>('');
  readonly errorMessage = input<string>('');
  readonly invalid = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly placeholder = input<string>('');
  readonly min = input<number | null>(null);
  readonly max = input<number | null>(null);
  readonly step = input<number>(1);
  readonly decreaseLabel = input<string>($localize`:@@dahcUi.inputNumber.decrease:Decrease`);
  readonly increaseLabel = input<string>($localize`:@@dahcUi.inputNumber.increase:Increase`);

  /** Text written into the field: changes only on outside writes and steps, never while typing. */
  protected readonly display = signal<string>('');

  protected readonly atMin = computed<boolean>(() => {
    const min = this.min();
    const value = this.value();

    return min !== null && value !== null && value <= min;
  });

  protected readonly atMax = computed<boolean>(() => {
    const max = this.max();
    const value = this.value();

    return max !== null && value !== null && value >= max;
  });

  protected emptyValue(): number | null {
    return null;
  }

  override writeValue(value: number | null | undefined): void {
    super.writeValue(typeof value === 'number' && Number.isFinite(value) ? value : null);
    this.display.set(this.format(this.value()));
  }

  protected onInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const number = raw === '' ? null : Number(raw);
    this.commitValue(number === null || Number.isNaN(number) ? null : number);
  }

  /** Commits a typed value: clamped and rounded to the step's decimals. */
  protected onCommit(event: Event): void {
    const current = this.value();

    if (current !== null) {
      const clamped = this.clamp(current);
      this.commitValue(clamped);
      (event.target as HTMLInputElement).value = this.format(clamped);
      this.display.set(this.format(clamped));
    }
  }

  protected stepBy(direction: 1 | -1): void {
    if (this.isDisabled()) {
      return;
    }

    const base = this.value() ?? this.min() ?? 0;
    const next = this.clamp(base + direction * this.step());
    this.commitValue(next);
    this.display.set(this.format(next));
    this.markTouched();
  }

  protected onBlur(): void {
    this.markTouched();
  }

  private clamp(value: number): number {
    const min = this.min();
    const max = this.max();
    let next = value;

    if (min !== null) {
      next = Math.max(min, next);
    }

    if (max !== null) {
      next = Math.min(max, next);
    }

    const decimals = (String(this.step()).split('.')[1] ?? '').length;

    return Number(next.toFixed(decimals));
  }

  private format(value: number | null): string {
    return value === null ? '' : String(value);
  }
}
