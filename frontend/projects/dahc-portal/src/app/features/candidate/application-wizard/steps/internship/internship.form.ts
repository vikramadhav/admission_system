import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

import { SectionValues } from '../../../../../api/candidate-lifecycle.models';
import { pastDate, requireWhen } from '../../../../../shared/forms/form-errors';
import { OTHER } from '../../../../../shared/reference-data';
import { InternshipInformationValues } from '../../../../../shared/section-values';
import { SectionFormDefinition } from '../../wizard-model';

type Text = FormControl<string>;

export type InternshipInformationForm = FormGroup<{
  organization: Text;
  otherOrganization: Text;
  location: Text;
  fromDate: Text;
  toDate: Text;
}>;

/** The To date must follow the From date; the error sits on toDate so it shows there. */
const dateOrder: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const form = control as InternshipInformationForm;
  const { fromDate, toDate } = form.controls;
  const wrong = fromDate.value !== '' && toDate.value !== '' && toDate.value <= fromDate.value;
  const errors = { ...(toDate.errors ?? {}) };

  if (wrong) {
    errors['dateOrder'] = true;
  } else {
    delete errors['dateOrder'];
  }

  toDate.setErrors(Object.keys(errors).length > 0 ? errors : null);

  return null;
};

const text = (validators = [Validators.required]): Text => new FormControl('', { nonNullable: true, validators });

/** Internship information (US-1.3.6, SBRD:596-622; Figma 1:4255). Known UAE organizations fix the location to the UAE. */
export const internshipInformationDefinition: SectionFormDefinition<InternshipInformationForm> = {
  key: 'internship-information',

  create(): InternshipInformationForm {
    return new FormGroup(
      {
        organization: text(),
        otherOrganization: text([Validators.maxLength(200)]),
        location: text(),
        fromDate: text([Validators.required, pastDate]),
        toDate: text(),
      },
      { validators: dateOrder },
    );
  },

  patch(form, values): void {
    form.patchValue(values as Partial<InternshipInformationValues>, { emitEvent: false });
  },

  sync(form): void {
    const { organization, otherOrganization, location } = form.controls;
    const other = organization.value === OTHER;

    requireWhen(otherOrganization, other);

    if (organization.value !== '' && !other && location.value !== 'AE') {
      location.setValue('AE', { emitEvent: false });
    }
  },

  values(form): SectionValues {
    return form.getRawValue();
  },
};
