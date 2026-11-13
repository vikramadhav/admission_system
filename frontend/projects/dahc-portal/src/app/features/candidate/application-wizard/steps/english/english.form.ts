import { FormControl, FormGroup } from '@angular/forms';

import { SectionValues } from '../../../../../api/candidate-lifecycle.models';
import { numberInRange, pastDate, requireWhen } from '../../../../../shared/forms/form-errors';
import { ENGLISH_EXEMPT_COUNTRIES } from '../../../../../shared/reference-data';
import { EnglishProficiencyValues, groupOf, valueOf } from '../../../../../shared/section-values';
import { SectionFormDefinition, WizardContext } from '../../wizard-model';

type Text = FormControl<string>;

export type EnglishProficiencyForm = FormGroup<{
  exam: Text;
  dateTaken: Text;
  result: Text;
  oetReading: Text;
  oetWriting: Text;
  oetListening: Text;
  oetSpeaking: Text;
}>;

export const OET_PARTS = ['oetReading', 'oetWriting', 'oetListening', 'oetSpeaking'] as const;

/** Accepted range of the overall result per exam (SBRD:572-590); out-of-range only warns. */
export const ENGLISH_RANGES: Readonly<Record<string, { readonly min: number; readonly max: number }>> = {
  IELTS: { min: 6, max: 9 },
  TOEFL_IBT: { min: 80, max: 120 },
  EMSAT: { min: 1252, max: 2000 },
  OET: { min: 300, max: 500 },
};

const numeric = numberInRange(0, Number.MAX_SAFE_INTEGER);
const text = (validators = [numeric]): Text => new FormControl('', { nonNullable: true, validators });

/**
 * English is optional for Fellowship and when the nationality or the university country is
 * the USA, UK, Canada, Australia, New Zealand or Ireland (SBRD:572).
 */
export function englishRequired(context: WizardContext): boolean {
  if (!context.rules.englishRequired) {
    return false;
  }

  const nationality = valueOf(groupOf(context.sectionValues('personal-information'), 'identity'), 'nationality');
  const universityCountry = valueOf(context.sectionValues('academic-information'), 'country');

  return !ENGLISH_EXEMPT_COUNTRIES.includes(nationality) && !ENGLISH_EXEMPT_COUNTRIES.includes(universityCountry);
}

/** English proficiency (US-1.3.5, SBRD:566-594; Figma 1:4064). */
export const englishProficiencyDefinition: SectionFormDefinition<EnglishProficiencyForm> = {
  key: 'english-proficiency',

  create(): EnglishProficiencyForm {
    return new FormGroup({
      exam: text([]),
      dateTaken: text([pastDate]),
      result: text(),
      oetReading: text(),
      oetWriting: text(),
      oetListening: text(),
      oetSpeaking: text(),
    });
  },

  patch(form, values): void {
    form.patchValue(values as Partial<EnglishProficiencyValues>, { emitEvent: false });
  },

  sync(form, context): void {
    const controls = form.controls;
    const exam = controls.exam.value;
    const taken = exam !== '';

    requireWhen(controls.exam, englishRequired(context));
    requireWhen(controls.dateTaken, taken);
    requireWhen(controls.result, taken && exam !== 'OET');

    for (const part of OET_PARTS) {
      requireWhen(controls[part], exam === 'OET');
    }
  },

  values(form): SectionValues {
    return form.getRawValue();
  },
};
