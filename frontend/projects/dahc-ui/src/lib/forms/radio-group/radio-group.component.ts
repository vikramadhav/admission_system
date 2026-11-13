import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { dahcUniqueId } from '../../core/a11y/unique-id';
import { DahcFormControl, provideDahcValueAccessor } from '../../core/forms/form-control';
import { DahcIconComponent } from '../../core/icon/icon.component';

export interface DahcRadioOption {
  readonly value: string;
  readonly label: string;
  readonly disabled?: boolean;
}

export type DahcRadioGroupOrientation = 'horizontal' | 'vertical';

/**
 * A labelled group of radio buttons (native radios in a fieldset), for example the GME Yes / No
 * questions. Figma Controls 50:7880 (Type=2. Radio button): 24px hit area, 20px ring with a 2px
 * navy border, label Dubai 16/20 with an 8px gap. Checked: navy ring with a blue dot, the same
 * colours as the checked checkbox (A11y fix: Figma's blue dot on white is 2.42:1).
 * The legend uses the form field label style; hint and error follow dahc-form-field.
 */
@Component({
  selector: 'dahc-radio-group',
  templateUrl: './radio-group.component.html',
  styleUrl: './radio-group.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcIconComponent],
  providers: [provideDahcValueAccessor(() => DahcRadioGroupComponent)],
  host: {
    '[class.dahc-radio-group--vertical]': "orientation() === 'vertical'",
  },
})
export class DahcRadioGroupComponent extends DahcFormControl<string> {
  readonly label = input.required<string>();
  readonly options = input.required<readonly DahcRadioOption[]>();
  readonly orientation = input<DahcRadioGroupOrientation>('horizontal');
  readonly hint = input<string>('');
  readonly errorMessage = input<string>('');
  readonly invalid = input<boolean>(false);
  readonly required = input<boolean>(false);

  protected readonly groupId = dahcUniqueId('dahc-radio-group');
  protected readonly hintId = `${this.groupId}-hint`;
  protected readonly errorId = `${this.groupId}-error`;
  protected readonly showError = computed<boolean>(() => this.invalid() && this.errorMessage() !== '');
  protected readonly describedBy = computed<string | null>(() => {
    if (this.showError()) {
      return this.errorId;
    }

    return this.hint() !== '' ? this.hintId : null;
  });

  protected emptyValue(): string {
    return '';
  }

  protected select(option: DahcRadioOption): void {
    this.commitValue(option.value);
  }

  protected onBlur(): void {
    this.markTouched();
  }
}
