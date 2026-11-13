import { ChangeDetectionStrategy, Component, computed, effect, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DahcSelectComponent, DahcSelectOption } from 'dahc-ui';

import { DocExampleComponent, InspectorTextComponent, InspectorToggleComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-select-page',
  templateUrl: './select-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcSelectComponent,
    DocExampleComponent,
    InspectorTextComponent,
    InspectorToggleComponent,
    PlaygroundPageComponent,
    ReactiveFormsModule,
  ],
})
export class SelectPageComponent {
  protected readonly sourceFiles = [
    'forms/select/select.component.ts',
    'forms/select/select.component.html',
    'forms/select/select.component.css',
    'forms/select/select-option.ts',
    'core/a11y/unique-id.ts',
  ];

  protected readonly programs: readonly DahcSelectOption[] = [
    { value: 'internship', label: 'Internship' },
    { value: 'medical-residency', label: 'Medical Residency' },
    { value: 'dental-residency', label: 'Dental Residency' },
    { value: 'pharmacy-residency', label: 'Pharmacy Residency' },
    { value: 'fellowship', label: 'Fellowship' },
    { value: 'certificate', label: 'Certificate (closed)', disabled: true },
  ];

  protected readonly label = signal<string>('Program');
  protected readonly placeholder = signal<string>('Select an option');
  protected readonly description = signal<string>('Only programs open in this cycle are listed.');
  protected readonly errorMessage = signal<string>('Select a program.');
  protected readonly invalid = signal<boolean>(false);
  protected readonly required = signal<boolean>(true);
  /** Drives the form control's disabled state, which reaches the component through setDisabledState. */
  protected readonly disabled = signal<boolean>(false);

  protected readonly control = new FormControl<string>('', { nonNullable: true, validators: Validators.required });
  protected readonly controlValue = toSignal(this.control.valueChanges, { initialValue: this.control.value });
  protected readonly valueText = computed<string>(() => JSON.stringify(this.controlValue()));

  protected readonly filledControl = new FormControl<string>('fellowship', { nonNullable: true });
  protected readonly invalidControl = new FormControl<string>('', { nonNullable: true });
  protected readonly disabledControl = new FormControl<string>({ value: 'internship', disabled: true }, { nonNullable: true });

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
    'Choose one option from a list of about five or more, where showing every option at once would take too much space.',
    'Use a radio group for fewer options, an auto-complete for very long lists that people type into, and a multi-select for several values.',
    'The native select keeps the platform picker on phones and full keyboard and screen reader support.',
  ];

  protected readonly exampleEmirates: readonly DahcSelectOption[] = [
    { value: 'abu-dhabi', label: 'Abu Dhabi' },
    { value: 'dubai', label: 'Dubai' },
    { value: 'sharjah', label: 'Sharjah' },
    { value: 'ajman', label: 'Ajman' },
    { value: 'umm-al-quwain', label: 'Umm Al Quwain' },
    { value: 'ras-al-khaimah', label: 'Ras Al Khaimah' },
    { value: 'fujairah', label: 'Fujairah' },
  ];
  protected readonly exampleEmirate = new FormControl<string>('', { nonNullable: true });
  protected readonly exampleCampus = new FormControl<string>('', { nonNullable: true });
  protected readonly exampleIntake = new FormControl<string>('', { nonNullable: true, validators: Validators.required });
  protected readonly exampleIntakes: readonly DahcSelectOption[] = [
    { value: '2026-09', label: 'September 2026' },
    { value: '2027-01', label: 'January 2027' },
    { value: '2027-09', label: 'September 2027 (not open yet)', disabled: true },
  ];
}
