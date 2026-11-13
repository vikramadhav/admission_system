import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  DahcDatePickerComponent,
  DahcFormFieldComponent,
  DahcFormLayoutComponent,
  DahcInputDirective,
  DahcInputNumberComponent,
  DahcSelectComponent,
  DahcSelectOption,
  DahcTimePickerComponent,
} from 'dahc-ui';

import { DocExampleComponent, InspectorToggleComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-form-layout-page',
  templateUrl: './form-layout-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcDatePickerComponent,
    DahcFormFieldComponent,
    DahcFormLayoutComponent,
    DahcInputDirective,
    DahcInputNumberComponent,
    DahcSelectComponent,
    DahcTimePickerComponent,
    DocExampleComponent,
    InspectorToggleComponent,
    PlaygroundPageComponent,
    ReactiveFormsModule,
  ],
})
export class FormLayoutPageComponent {
  protected readonly sourceFiles = [
    'forms/form-layout/form-layout.component.ts',
    'forms/form-layout/form-layout.component.css',
  ];
  protected readonly two = signal<boolean>(true);

  protected readonly whenToUse: readonly string[] = [
    'Arrange the fields of a form consistently: one column on phones, one or two on larger screens.',
    'Use two columns for short, related fields (first and family name); give long fields the dahc-form-layout__full class.',
    'Keep validation and submission in Angular forms; the layout only places the fields.',
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
  protected readonly exampleContact = new FormGroup({
    givenName: new FormControl<string>('', { nonNullable: true }),
    familyName: new FormControl<string>('', { nonNullable: true }),
  });
  protected readonly exampleAddress = new FormGroup({
    street: new FormControl<string>('', { nonNullable: true }),
    emirate: new FormControl<string>('', { nonNullable: true }),
    poBox: new FormControl<string>('', { nonNullable: true }),
  });
  protected readonly exampleJoining = new FormGroup({
    startDate: new FormControl<string>('', { nonNullable: true }),
    department: new FormControl<string>('', { nonNullable: true }),
  });
}
