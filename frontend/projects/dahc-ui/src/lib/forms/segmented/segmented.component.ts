import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { dahcUniqueId } from '../../core/a11y/unique-id';
import { DahcFormControl, provideDahcValueAccessor } from '../../core/forms/form-control';

export interface DahcSegmentedOption {
  readonly value: string;
  readonly label: string;
  readonly disabled?: boolean;
}

/**
 * Pick one of a few options as a segmented control (for example "Day / Week / Month"). Native
 * radio buttons in a labelled radio group: Arrow keys move the choice (mirrored in RTL by the
 * browser), Tab leaves the group. The form value is the chosen option's value.
 * PARTIAL Figma: DH Functional "Selection chip" styling (Chips and Tags 50:7519): selected navy
 * pill, the group on a navy-100 track with a navy-200 border. Unlike dahc-button-group (separate
 * chips), the options sit on one track. Ported from dubai-health-ui dh-segmented
 * (display/dh-data-display.ts).
 */
@Component({
  selector: 'dahc-segmented',
  templateUrl: './segmented.component.html',
  styleUrl: './segmented.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideDahcValueAccessor(() => DahcSegmentedComponent)],
})
export class DahcSegmentedComponent extends DahcFormControl<string> {
  /** Accessible name of the group. */
  readonly label = input.required<string>();
  readonly options = input.required<readonly DahcSegmentedOption[]>();

  protected readonly name = dahcUniqueId('dahc-segmented');

  protected emptyValue(): string {
    return '';
  }

  protected onSelect(option: DahcSegmentedOption): void {
    this.commitValue(option.value);
  }

  protected onBlur(): void {
    this.markTouched();
  }
}
