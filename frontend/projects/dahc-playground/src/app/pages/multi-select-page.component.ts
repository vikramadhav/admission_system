import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DahcMultiSelectComponent, DahcSelectOption } from 'dahc-ui';

import { DocExampleComponent, InspectorTextComponent, InspectorToggleComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-multi-select-page',
  templateUrl: './multi-select-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcMultiSelectComponent,
    DocExampleComponent,
    InspectorTextComponent,
    InspectorToggleComponent,
    PlaygroundPageComponent,
    ReactiveFormsModule,
  ],
})
export class MultiSelectPageComponent {
  protected readonly sourceFiles = [
    'forms/multi-select/multi-select.component.ts',
    'forms/multi-select/multi-select.component.html',
    'forms/multi-select/multi-select.component.css',
  ];
  protected readonly sites: readonly DahcSelectOption[] = [
    { value: 'rashid', label: 'Rashid Hospital' },
    { value: 'dubai', label: 'Dubai Hospital' },
    { value: 'latifa', label: 'Latifa Hospital' },
    { value: 'hatta', label: 'Hatta Hospital' },
    { value: 'al-jalila', label: 'Al Jalila Children’s Hospital' },
    { value: 'mediclinic', label: 'Mediclinic City Hospital (full)', disabled: true },
    { value: 'kch', label: 'King’s College Hospital' },
  ];

  protected readonly label = signal<string>('Training sites');
  protected readonly hint = signal<string>('Choose up to three sites.');
  protected readonly searchable = signal<boolean>(true);
  protected readonly invalid = signal<boolean>(false);

  protected readonly control = new FormControl<readonly string[]>(['dubai'], { nonNullable: true });
  protected readonly controlValue = toSignal(this.control.valueChanges, { initialValue: this.control.value });
  protected readonly valueText = computed<string>(() => JSON.stringify(this.controlValue()));

  protected readonly disabledControl = new FormControl<readonly string[]>({ value: ['rashid', 'latifa'], disabled: true }, { nonNullable: true });

  protected readonly whenToUse: readonly string[] = [
    'Choose several values from a list that is too long to show as checkboxes.',
    'Keep search on for lists of more than about ten options.',
    'Use checkboxes when there are only a few options, and a ranked selection when the order of the chosen items matters.',
  ];

  protected readonly exampleLanguageOptions: readonly DahcSelectOption[] = [
    { value: 'ar', label: 'Arabic' },
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'French' },
    { value: 'hi', label: 'Hindi' },
    { value: 'ur', label: 'Urdu' },
  ];
  protected readonly exampleLanguagesSpoken = new FormControl<readonly string[]>([], { nonNullable: true });
  protected readonly exampleShiftOptions: readonly DahcSelectOption[] = [
    { value: 'morning', label: 'Morning' },
    { value: 'evening', label: 'Evening' },
    { value: 'night', label: 'Night' },
  ];
  protected readonly exampleShifts = new FormControl<readonly string[]>(['morning'], { nonNullable: true });
  protected readonly exampleInterests = new FormControl<readonly string[]>([], { nonNullable: true, validators: Validators.required });
}
