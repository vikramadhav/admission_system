import { FormControl, FormGroup, Validators } from '@angular/forms';

import { SectionValues } from '../../../../../api/candidate-lifecycle.models';
import { numberInRange, pastDate, requireWhen } from '../../../../../shared/forms/form-errors';
import { EntranceExamValues } from '../../../../../shared/section-values';
import { SectionFormDefinition } from '../../wizard-model';

type Text = FormControl<string>;

export type EntranceExamForm = FormGroup<{
  examType: Text;
  attempt: Text;
  examDate: Text;
  percentileRank: Text;
  score: Text;
}>;

/** Exams with an attempt and a percentile rank (SBRD:696-712). */
export const RANKED_EXAMS: readonly string[] = ['EMREE', 'EDREE', 'EPREE'];

/** Accepted score range per exam; out-of-range only warns (SBRD:700). */
export const EXAM_SCORE_RANGES: Readonly<Record<string, { readonly min: number; readonly max: number }>> = {
  EMREE: { min: 60, max: 100 },
  EPREE: { min: 55, max: 100 },
  EDREE: { min: 65, max: 100 },
  SMLE: { min: 560, max: 800 },
  SDLE: { min: 560, max: 800 },
};

/** Entrance exam, Residency programs (US-1.3.9, SBRD:691-718). No Figma screen exists. */
export const entranceExamDefinition: SectionFormDefinition<EntranceExamForm> = {
  key: 'residency-entrance-exam',

  create(): EntranceExamForm {
    return new FormGroup({
      examType: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      attempt: new FormControl('', { nonNullable: true }),
      examDate: new FormControl('', { nonNullable: true, validators: [Validators.required, pastDate] }),
      percentileRank: new FormControl('', { nonNullable: true, validators: [numberInRange(0, 100)] }),
      score: new FormControl('', { nonNullable: true, validators: [Validators.required, numberInRange(0, Number.MAX_SAFE_INTEGER)] }),
    });
  },

  patch(form, values): void {
    form.patchValue(values as Partial<EntranceExamValues>, { emitEvent: false });
  },

  sync(form): void {
    const ranked = RANKED_EXAMS.includes(form.controls.examType.value);

    requireWhen(form.controls.attempt, ranked);
    requireWhen(form.controls.percentileRank, ranked);
  },

  values(form): SectionValues {
    return form.getRawValue();
  },
};
