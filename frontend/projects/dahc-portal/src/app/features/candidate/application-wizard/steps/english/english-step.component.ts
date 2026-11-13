import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { DahcAlertComponent, DahcDatePickerComponent, DahcFormFieldComponent, DahcInputDirective, DahcSelectComponent } from 'dahc-ui';

import { fieldError } from '../../../../../shared/forms/form-errors';
import { ENGLISH_EXAMS } from '../../../../../shared/reference-data';
import { SectionAttachmentsComponent } from '../../section-attachments.component';
import { WizardStateService } from '../../wizard-state.service';
import { ENGLISH_RANGES, EnglishProficiencyForm, OET_PARTS } from './english.form';

type Field = keyof EnglishProficiencyForm['controls'];

/** English Proficiency (Figma 1:4064, US-1.3.5): exam, date, result or OET sub-scores, certificate. */
@Component({
  selector: 'dahc-english-step',
  templateUrl: './english-step.component.html',
  styleUrl: '../step.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcAlertComponent,
    DahcDatePickerComponent,
    DahcFormFieldComponent,
    DahcInputDirective,
    DahcSelectComponent,
    ReactiveFormsModule,
    SectionAttachmentsComponent,
  ],
})
export class EnglishStepComponent {
  protected readonly state = inject(WizardStateService);
  protected readonly form = this.state.forms['english-proficiency'] as EnglishProficiencyForm;
  protected readonly exams = ENGLISH_EXAMS;
  protected readonly today = new Date().toISOString().slice(0, 10);

  protected readonly oetParts: readonly { readonly control: (typeof OET_PARTS)[number]; readonly label: string }[] = [
    { control: 'oetReading', label: $localize`:@@portal.english.oetReading:Reading score` },
    { control: 'oetWriting', label: $localize`:@@portal.english.oetWriting:Writing score` },
    { control: 'oetListening', label: $localize`:@@portal.english.oetListening:Listening score` },
    { control: 'oetSpeaking', label: $localize`:@@portal.english.oetSpeaking:Speaking score` },
  ];

  protected readonly optional = computed<boolean>(() => {
    this.state.revision();

    return !this.form.controls.exam.hasValidator(Validators.required);
  });

  protected error(name: Field): string {
    this.state.revision();

    return fieldError(this.form.controls[name], this.showAll());
  }

  protected isRequired(name: Field): boolean {
    this.state.revision();

    return this.form.controls[name].hasValidator(Validators.required);
  }

  protected showAll(): boolean {
    return this.state.showsAllErrors('english-proficiency');
  }

  /** Non-blocking warning when a score is outside the accepted range of the exam. */
  protected rangeWarning(name: Field): string {
    this.state.revision();
    const range = ENGLISH_RANGES[this.form.controls.exam.value];
    const value = this.form.controls[name].value.trim();
    const number = Number(value);

    if (!range || value === '' || Number.isNaN(number) || (number >= range.min && number <= range.max)) {
      return '';
    }

    return $localize`:@@portal.english.rangeWarning:The accepted range for this exam is ${range.min}:min: to ${range.max}:max:. Check your score.`;
  }
}
