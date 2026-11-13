import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DahcAutoCompleteComponent } from 'dahc-ui';

import { DocExampleComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-auto-complete-page',
  templateUrl: './auto-complete-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcAutoCompleteComponent,
    DocExampleComponent,
    PlaygroundPageComponent,
    ReactiveFormsModule,
  ],
})
export class AutoCompletePageComponent {
  protected readonly sourceFiles = [
    'forms/auto-complete/auto-complete.component.ts',
    'forms/auto-complete/auto-complete.component.html',
    'forms/auto-complete/auto-complete.component.css',
  ];
  protected readonly control = new FormControl<string>('', { nonNullable: true });
  protected readonly controlValue = toSignal(this.control.valueChanges, { initialValue: this.control.value });
  protected readonly valueText = computed<string>(() => JSON.stringify(this.controlValue()));
  protected readonly hospitals: readonly string[] = ['Rashid Hospital', 'Dubai Hospital', 'Latifa Hospital', 'Hatta Hospital', 'Al Jalila Children Hospital', 'Al Barsha Health Centre'];

  protected readonly whenToUse: readonly string[] = [
    'Help people type a value from a long list while still accepting values that are not in it, such as a hospital name.',
    'Use a select when the answer must be one of the listed options.',
    'Keep suggestions short; maxSuggestions limits how many show at once.',
  ];

  protected readonly exampleNationalities: readonly string[] = ['Emirati', 'Egyptian', 'Indian', 'Jordanian', 'Lebanese', 'Pakistani', 'Saudi', 'Syrian'];
  protected readonly exampleNationality = new FormControl<string>('', { nonNullable: true });
  protected readonly exampleUniversities: readonly string[] = [
    'Mohammed Bin Rashid University',
    'United Arab Emirates University',
    'University of Sharjah',
    'Gulf Medical University',
    'Khalifa University',
  ];
  protected readonly exampleUniversity = new FormControl<string>('', { nonNullable: true });
  protected readonly exampleEmployer = new FormControl<string>('', { nonNullable: true, validators: Validators.required });
  protected readonly exampleSpecialties: readonly string[] = ['Cardiology', 'Dermatology', 'Emergency medicine', 'Family medicine', 'Neurology', 'Paediatrics'];
  protected readonly exampleSpecialty = new FormControl<string>('', { nonNullable: true });
}
