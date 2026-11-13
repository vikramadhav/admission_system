import { FormControl, FormGroup, Validators } from '@angular/forms';

import { SectionValues } from '../../../../../api/candidate-lifecycle.models';
import { numberInRange, requireWhen } from '../../../../../shared/forms/form-errors';
import { OTHER } from '../../../../../shared/reference-data';
import { AcademicInformationValues } from '../../../../../shared/section-values';
import { SectionFormDefinition } from '../../wizard-model';

type Text = FormControl<string>;

export type AcademicInformationForm = FormGroup<{
  country: Text;
  university: Text;
  otherUniversity: Text;
  degree: Text;
  graduationYear: Text;
  graduationMonth: Text;
  gpaType: Text;
  gpaScale4: Text;
  gpaPercentage: Text;
  eceGpa: Text;
  originalGpa: Text;
}>;

/** Non-negative number; out-of-range values only warn (US-1.3.4 AC9), so no upper bound blocks. */
const numeric = numberInRange(0, Number.MAX_SAFE_INTEGER);

const text = (validators = [Validators.required]): Text => new FormControl('', { nonNullable: true, validators });

/** GPA as a percentage: scale of 4 (or ECE GPA) × 25, percentage as entered (SBRD:1847). */
export function gpaPercent(values: Pick<AcademicInformationValues, 'country' | 'gpaType' | 'gpaScale4' | 'gpaPercentage' | 'eceGpa'>): number | null {
  const parse = (value: string): number | null => (value.trim() === '' || Number.isNaN(Number(value)) ? null : Number(value));

  if (values.country === '') {
    return null;
  }

  if (values.country !== 'AE') {
    const ece = parse(values.eceGpa);

    return ece === null ? null : ece * 25;
  }

  if (values.gpaType === 'SCALE_4') {
    const scale = parse(values.gpaScale4);

    return scale === null ? null : scale * 25;
  }

  return parse(values.gpaPercentage);
}

/** University grades (US-1.3.4, SBRD:528-564; Figma 1:3827). */
export const academicInformationDefinition: SectionFormDefinition<AcademicInformationForm> = {
  key: 'academic-information',

  create(): AcademicInformationForm {
    return new FormGroup({
      country: text(),
      university: text(),
      otherUniversity: text([Validators.maxLength(200)]),
      degree: text(),
      graduationYear: text(),
      graduationMonth: text(),
      gpaType: new FormControl('PERCENTAGE', { nonNullable: true }),
      gpaScale4: text([numeric]),
      gpaPercentage: text([numeric]),
      eceGpa: text([numeric]),
      originalGpa: text([Validators.maxLength(50)]),
    });
  },

  patch(form, values): void {
    form.patchValue(values as Partial<AcademicInformationValues>, { emitEvent: false });

    if (form.controls.gpaType.value === '') {
      form.controls.gpaType.setValue('PERCENTAGE', { emitEvent: false });
    }
  },

  sync(form): void {
    const controls = form.controls;
    const uae = controls.country.value === 'AE';
    const foreign = controls.country.value !== '' && !uae;

    requireWhen(controls.otherUniversity, controls.university.value === OTHER);
    requireWhen(controls.gpaType, uae);
    requireWhen(controls.gpaScale4, uae && controls.gpaType.value === 'SCALE_4');
    requireWhen(controls.gpaPercentage, uae && controls.gpaType.value === 'PERCENTAGE');
    requireWhen(controls.eceGpa, foreign);
    requireWhen(controls.originalGpa, foreign);
  },

  values(form): SectionValues {
    return form.getRawValue();
  },
};
