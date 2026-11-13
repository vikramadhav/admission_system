import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DahcRadioGroupComponent, DahcRadioGroupOrientation, DahcRadioOption } from 'dahc-ui';

import {
  DocExampleComponent,
  InspectorChoiceComponent,
  InspectorTextComponent,
  InspectorToggleComponent,
  PlaygroundPageComponent,
} from 'dahc-playground-kit';

@Component({
  selector: 'dahc-radio-group-page',
  templateUrl: './radio-group-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcRadioGroupComponent,
    DocExampleComponent,
    InspectorChoiceComponent,
    InspectorTextComponent,
    InspectorToggleComponent,
    PlaygroundPageComponent,
    ReactiveFormsModule,
  ],
})
export class RadioGroupPageComponent {
  protected readonly sourceFiles = [
    'forms/radio-group/radio-group.component.ts',
    'forms/radio-group/radio-group.component.html',
    'forms/radio-group/radio-group.component.css',
  ];
  protected readonly yesNo: readonly DahcRadioOption[] = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
  ];
  protected readonly languages: readonly DahcRadioOption[] = [
    { value: 'ielts', label: 'IELTS' },
    { value: 'toefl', label: 'TOEFL' },
    { value: 'oet', label: 'OET' },
    { value: 'none', label: 'Not required', disabled: true },
  ];
  protected readonly orientations: readonly DahcRadioGroupOrientation[] = ['horizontal', 'vertical'];

  protected readonly label = signal<string>('Have you completed an internship?');
  protected readonly hint = signal<string>('Include internships completed outside the UAE.');
  protected readonly errorMessage = signal<string>('Answer this question.');
  protected readonly orientation = signal<DahcRadioGroupOrientation>('horizontal');
  protected readonly invalid = signal<boolean>(false);
  protected readonly required = signal<boolean>(true);

  protected readonly control = new FormControl<string>('', { nonNullable: true });
  protected readonly controlValue = toSignal(this.control.valueChanges, { initialValue: this.control.value });
  protected readonly valueText = computed<string>(() => JSON.stringify(this.controlValue()));

  protected readonly languageControl = new FormControl<string>('ielts', { nonNullable: true });
  protected readonly disabledControl = new FormControl<string>({ value: 'no', disabled: true }, { nonNullable: true });

  protected readonly whenToUse: readonly string[] = [
    'Choose exactly one option when there are two to about six and all should be visible at once.',
    'Use a select for longer lists, a segmented control for switching a view, and a checkbox for a single yes / no statement.',
    'Put the question in the label: it becomes the group legend that screen readers read with each option.',
    'Arrow keys move between options; Tab moves to the next field.',
  ];

  protected readonly exampleNational = new FormControl<string>('', { nonNullable: true });
  protected readonly exampleLanguages: readonly DahcRadioOption[] = [
    { value: 'english', label: 'English' },
    { value: 'arabic', label: 'Arabic' },
    { value: 'either', label: 'Either language' },
  ];
  protected readonly exampleLanguage = new FormControl<string>('english', { nonNullable: true });
  protected readonly exampleSponsors: readonly DahcRadioOption[] = [
    { value: 'self', label: 'Self-funded' },
    { value: 'employer', label: 'Employer' },
    { value: 'government', label: 'Government' },
  ];
  protected readonly exampleSponsor = new FormControl<string>('', { nonNullable: true, validators: Validators.required });
}
