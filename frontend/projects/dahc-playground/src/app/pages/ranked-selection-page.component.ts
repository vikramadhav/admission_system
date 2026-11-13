import { ChangeDetectionStrategy, Component, computed, effect, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DahcRankedSelectionComponent, DahcSelectOption } from 'dahc-ui';

import { DocExampleComponent, InspectorTextComponent, InspectorToggleComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-ranked-selection-page',
  templateUrl: './ranked-selection-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcRankedSelectionComponent,
    DocExampleComponent,
    InspectorTextComponent,
    InspectorToggleComponent,
    PlaygroundPageComponent,
    ReactiveFormsModule,
  ],
})
export class RankedSelectionPageComponent {
  protected readonly sourceFiles = [
    'forms/ranked-selection/ranked-selection.component.ts',
    'forms/ranked-selection/ranked-selection.component.html',
    'forms/ranked-selection/ranked-selection.component.css',
    'core/a11y/live-announcer.service.ts',
    'core/a11y/unique-id.ts',
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

  protected readonly whenToUse: readonly string[] = [
    'Choose several items when their order matters, such as training sites in order of preference.',
    'Use a multi-select when the order does not matter.',
    'Ordering uses buttons, not drag and drop only, so it works with a keyboard and screen readers; each move is announced.',
  ];

  protected readonly exampleSpecialties: readonly DahcSelectOption[] = [
    { value: 'cardiology', label: 'Cardiology' },
    { value: 'neurology', label: 'Neurology' },
    { value: 'oncology', label: 'Oncology' },
  ];
  protected readonly exampleSpecialtyOrder = new FormControl<string[]>(['neurology', 'cardiology'], { nonNullable: true });
  protected readonly exampleLocations: readonly DahcSelectOption[] = [
    { value: 'deira', label: 'Deira clinic' },
    { value: 'marina', label: 'Marina clinic' },
    { value: 'barsha', label: 'Al Barsha clinic' },
  ];
  protected readonly exampleLocationOrder = new FormControl<string[]>([], { nonNullable: true });
  protected readonly exampleRotation = new FormControl<string[]>([], { nonNullable: true, validators: Validators.required });
}
