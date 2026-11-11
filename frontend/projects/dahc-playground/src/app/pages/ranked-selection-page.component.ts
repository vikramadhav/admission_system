import { ChangeDetectionStrategy, Component, computed, effect, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DahcRankedSelectionComponent, DahcSelectOption } from 'dahc-ui';

import { InspectorTextComponent } from '../inspector/inspector-text.component';
import { InspectorToggleComponent } from '../inspector/inspector-toggle.component';
import { PlaygroundPageComponent } from '../layout/playground-page.component';

@Component({
  selector: 'dahc-ranked-selection-page',
  templateUrl: './ranked-selection-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcRankedSelectionComponent,
    InspectorTextComponent,
    InspectorToggleComponent,
    PlaygroundPageComponent,
    ReactiveFormsModule,
  ],
})
export class RankedSelectionPageComponent {
  protected readonly sourceFiles = [
    'ranked-selection/ranked-selection.component.ts',
    'ranked-selection/ranked-selection.component.html',
    'ranked-selection/ranked-selection.component.scss',
    'a11y/live-announcer.service.ts',
    'a11y/unique-id.ts',
  ];

  protected readonly sites: readonly DahcSelectOption[] = [
    { value: 'rashid', label: 'Rashid Hospital' },
    { value: 'dubai', label: 'Dubai Hospital' },
    { value: 'latifa', label: 'Latifa Hospital' },
    { value: 'hatta', label: 'Hatta Hospital', disabled: true },
  ];

  protected readonly label = signal<string>('Preference 1 training sites');
  protected readonly description = signal<string>('Choose one or more sites, then put them in your order of preference.');
  protected readonly errorMessage = signal<string>('Select at least one training site.');
  protected readonly orderHeading = signal<string>('Your order of preference');
  protected readonly invalid = signal<boolean>(false);
  protected readonly required = signal<boolean>(true);
  /** Drives the form control's disabled state, which reaches the component through setDisabledState. */
  protected readonly disabled = signal<boolean>(false);

  protected readonly control = new FormControl<string[]>(['dubai', 'rashid'], { nonNullable: true });
  protected readonly controlValue = toSignal(this.control.valueChanges, { initialValue: this.control.value });
  protected readonly valueText = computed<string>(() => JSON.stringify(this.controlValue()));

  protected readonly emptyControl = new FormControl<string[]>([], { nonNullable: true });
  protected readonly singleControl = new FormControl<string[]>(['latifa'], { nonNullable: true });
  protected readonly disabledControl = new FormControl<string[]>({ value: ['rashid', 'dubai'], disabled: true }, { nonNullable: true });

  constructor() {
    effect(() => {
      if (this.disabled()) {
        this.control.disable();
      } else {
        this.control.enable();
      }
    });
  }
}
