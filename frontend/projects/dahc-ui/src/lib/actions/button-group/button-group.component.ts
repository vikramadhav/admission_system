import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';

import { dahcUniqueId } from '../../core/a11y/unique-id';
import { DahcFormControl, provideDahcValueAccessor } from '../../core/forms/form-control';

export interface DahcButtonGroupOption {
  readonly value: string;
  readonly label: string;
  readonly disabled?: boolean;
}

/** md 36px, sm 30px (Figma Functional chip "Medium" / "Small"). */
export type DahcButtonGroupSize = 'sm' | 'md';

/**
 * Single-choice segmented control, for example "All / Individual / Corporate" on Figma
 * Form Components (50:21128), styled as Selection chips (Chips and Tags 50:7519).
 * Built on native radio buttons inside a fieldset: arrow keys move the choice, Tab leaves the
 * group, and the legend names it. Works with reactive forms or through value / valueChange.
 */
@Component({
  selector: 'dahc-button-group',
  templateUrl: './button-group.component.html',
  styleUrl: './button-group.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideDahcValueAccessor(() => DahcButtonGroupComponent)],
  host: {
    '[class.dahc-button-group--sm]': "size() === 'sm'",
  },
})
export class DahcButtonGroupComponent extends DahcFormControl<string> {
  /** Group name shown as the legend. */
  readonly label = input.required<string>();
  readonly options = input.required<readonly DahcButtonGroupOption[]>();
  /** Hides the legend visually; it stays the group's accessible name. */
  readonly hideLabel = input<boolean>(false);
  readonly size = input<DahcButtonGroupSize>('md');
  /** Two-way selected value when the control is not bound to a form: [(selected)]. */
  readonly selected = model<string>('');

  protected readonly groupName = dahcUniqueId('dahc-button-group');
  /** The form value when a form writes one, otherwise the standalone selection. */
  protected readonly current = computed<string>(() => this.value() || this.selected());

  protected emptyValue(): string {
    return '';
  }

  protected select(option: DahcButtonGroupOption): void {
    this.commitValue(option.value);
    this.selected.set(option.value);
  }

  protected onBlur(): void {
    this.markTouched();
  }
}
