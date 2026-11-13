import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  DahcDatePickerComponent,
  DahcFormFieldComponent,
  DahcInputDirective,
  DahcSelectComponent,
  DahcSelectOption,
} from 'dahc-ui';

import { fieldError } from '../../../../../shared/forms/form-errors';
import { EXAM_ATTEMPTS } from '../../../../../shared/reference-data';
import { SectionAttachmentsComponent } from '../../section-attachments.component';
import { WizardStateService } from '../../wizard-state.service';
import { EXAM_SCORE_RANGES, EntranceExamForm, RANKED_EXAMS } from './entrance-exam.form';

type Field = keyof EntranceExamForm['controls'];

/**
 * Entrance Exam (US-1.3.9, Residency). Built from the BRD with the wizard's patterns; there is no
 * Figma screen. The exam shortlisting score is not calculated here: its formulas are unresolved
 * (OQ-C12) and the stories say not to infer them.
 */
@Component({
  selector: 'dahc-entrance-exam-step',
  styleUrl: '../step.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcDatePickerComponent, DahcFormFieldComponent, DahcInputDirective, DahcSelectComponent, ReactiveFormsModule, SectionAttachmentsComponent],
  template: `
    <div class="step" [formGroup]="form">
      <div class="step-grid">
        <dahc-select
          formControlName="examType"
          i18n-label="@@portal.exam.type"
          label="Exam"
          [options]="examOptions()"
          [required]="true"
          [invalid]="error('examType') !== ''"
          [errorMessage]="error('examType')" />
        @if (ranked()) {
          <dahc-select
            formControlName="attempt"
            i18n-label="@@portal.exam.attempt"
            label="Attempt"
            [options]="attempts"
            [required]="true"
            [invalid]="error('attempt') !== ''"
            [errorMessage]="error('attempt')" />
        }
        <dahc-date-picker
          formControlName="examDate"
          i18n-label="@@portal.exam.date"
          label="Examination date"
          [max]="today"
          [required]="true"
          [invalid]="error('examDate') !== ''"
          [errorMessage]="error('examDate')" />
        @if (ranked()) {
          <dahc-form-field
            i18n-label="@@portal.exam.percentile"
            label="Percentile rank"
            i18n-hint="@@portal.exam.percentileHint"
            hint="A number from 0 to 100."
            [required]="true"
            [invalid]="error('percentileRank') !== ''"
            [error]="error('percentileRank')">
            <input dahcInput type="text" inputmode="decimal" formControlName="percentileRank" />
          </dahc-form-field>
        }
        <dahc-form-field
          i18n-label="@@portal.exam.score"
          label="Score"
          [hint]="scoreWarning()"
          [required]="true"
          [invalid]="error('score') !== ''"
          [error]="error('score')">
          <input dahcInput type="text" inputmode="decimal" formControlName="score" />
        </dahc-form-field>
        <dahc-form-field
          i18n-label="@@portal.exam.shortlisting"
          label="Entrance exam shortlisting score"
          i18n-hint="@@portal.exam.shortlistingHint"
          hint="Shown on your dashboard after the scores are announced.">
          <input dahcInput type="text" [value]="calculatedLater" readonly />
        </dahc-form-field>
      </div>

      <section class="step-section" aria-labelledby="exam-documents-heading">
        <h3 id="exam-documents-heading" class="step-section-heading" i18n="@@portal.exam.documents">Documents</h3>
        <dahc-section-attachments sectionKey="residency-entrance-exam" [showRequired]="showAll()" />
      </section>
    </div>
  `,
})
export class EntranceExamStepComponent {
  protected readonly state = inject(WizardStateService);
  protected readonly form = this.state.forms['residency-entrance-exam'] as EntranceExamForm;
  protected readonly attempts = EXAM_ATTEMPTS;
  protected readonly today = new Date().toISOString().slice(0, 10);
  protected readonly calculatedLater = $localize`:@@portal.exam.calculatedLater:Calculated by the admission team`;

  protected readonly examOptions = computed<readonly DahcSelectOption[]>(() =>
    (this.state.rules()?.entranceExams ?? []).map(exam => ({ value: exam, label: exam })),
  );

  protected readonly ranked = computed<boolean>(() => {
    this.state.revision();

    return RANKED_EXAMS.includes(this.form.controls.examType.value);
  });

  /** Non-blocking warning when the score is outside the exam's range. */
  protected readonly scoreWarning = computed<string>(() => {
    this.state.revision();
    const range = EXAM_SCORE_RANGES[this.form.controls.examType.value];
    const value = this.form.controls.score.value.trim();
    const number = Number(value);

    if (!range || value === '' || Number.isNaN(number) || (number >= range.min && number <= range.max)) {
      return '';
    }

    return $localize`:@@portal.exam.rangeWarning:The expected range for this exam is ${range.min}:min: to ${range.max}:max:. Check your score.`;
  });

  protected error(name: Field): string {
    this.state.revision();

    return fieldError(this.form.controls[name], this.showAll());
  }

  protected showAll(): boolean {
    return this.state.showsAllErrors('residency-entrance-exam');
  }
}
