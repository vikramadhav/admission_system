import { FormControl, FormGroup, Validators } from '@angular/forms';

import { SectionValues } from '../../../../../api/candidate-lifecycle.models';
import { requireWhen } from '../../../../../shared/forms/form-errors';
import { OTHER } from '../../../../../shared/reference-data';
import { ResidencyInformationValues } from '../../../../../shared/section-values';
import { SectionFormDefinition } from '../../wizard-model';

type Text = FormControl<string>;

export type ResidencyInformationForm = FormGroup<{
  specialty: Text;
  trainingHospital: Text;
  otherTrainingHospital: Text;
  trainingCountry: Text;
  completionDate: Text;
}>;

const text = (validators = [Validators.required]): Text => new FormControl('', { nonNullable: true, validators });

/** Residency information, Fellowship only (US-1.3.7, SBRD:624-643; Figma 1:4456). Accepted UAE hospitals fix the country. */
export const residencyInformationDefinition: SectionFormDefinition<ResidencyInformationForm> = {
  key: 'residency-information',

  create(): ResidencyInformationForm {
    return new FormGroup({
      specialty: text(),
      trainingHospital: text(),
      otherTrainingHospital: text([Validators.maxLength(200)]),
      trainingCountry: text(),
      completionDate: text(),
    });
  },

  patch(form, values): void {
    form.patchValue(values as Partial<ResidencyInformationValues>, { emitEvent: false });
  },

  sync(form): void {
    const { trainingHospital, otherTrainingHospital, trainingCountry } = form.controls;
    const other = trainingHospital.value === OTHER;

    requireWhen(otherTrainingHospital, other);

    if (trainingHospital.value !== '' && !other && trainingCountry.value !== 'AE') {
      trainingCountry.setValue('AE', { emitEvent: false });
    }
  },

  values(form): SectionValues {
    return form.getRawValue();
  },
};
