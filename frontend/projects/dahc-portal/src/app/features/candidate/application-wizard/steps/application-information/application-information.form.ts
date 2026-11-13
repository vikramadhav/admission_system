import { FormControl, FormGroup, Validators } from '@angular/forms';

import { SectionValues } from '../../../../../api/candidate-lifecycle.models';
import { requireWhen } from '../../../../../shared/forms/form-errors';
import { ApplicationInformationValues, YesNo } from '../../../../../shared/section-values';
import { SectionFormDefinition } from '../../wizard-model';

type Text = FormControl<string>;
type Answer = FormControl<YesNo>;

export type ApplicationInformationForm = FormGroup<{
  candidateStatus: Text;
  idNumber: Text;
  sponsorship: Answer;
  sponsorType: Text;
  sponsorName: Text;
  currentlyEmployed: Answer;
  registeredInMbruResidency: Answer;
  licenseDenied: Answer;
  academicProbation: Answer;
  dismissed: Answer;
  misconduct: Answer;
  termsAccepted: FormControl<boolean>;
}>;

const text = (validators = [Validators.required]): Text => new FormControl('', { nonNullable: true, validators });
const answer = (initial: YesNo = '', required = true): Answer =>
  new FormControl<YesNo>(initial, { nonNullable: true, validators: required ? [Validators.required] : [] });

/** Application information (US-1.3.2, SBRD:393-441; Figma 1:2505). */
export const applicationInformationDefinition: SectionFormDefinition<ApplicationInformationForm> = {
  key: 'application-information',

  create(): ApplicationInformationForm {
    return new FormGroup({
      candidateStatus: text(),
      idNumber: text([Validators.maxLength(20)]),
      sponsorship: answer(),
      sponsorType: text([]),
      sponsorName: text([Validators.maxLength(200)]),
      currentlyEmployed: answer('', false),
      registeredInMbruResidency: answer('', false),
      // The four declarations default to No (SBRD:435-438).
      licenseDenied: answer('NO'),
      academicProbation: answer('NO'),
      dismissed: answer('NO'),
      misconduct: answer('NO'),
      termsAccepted: new FormControl(false, { nonNullable: true, validators: [Validators.requiredTrue] }),
    });
  },

  patch(form, values): void {
    form.patchValue(values as Partial<ApplicationInformationValues>, { emitEvent: false });
  },

  sync(form, { rules }): void {
    const controls = form.controls;
    const status = rules.candidateStatuses.find(option => option.value === controls.candidateStatus.value);
    const sponsored = controls.sponsorship.value === 'YES';

    requireWhen(controls.idNumber, status?.idRequired ?? false);
    requireWhen(controls.sponsorType, sponsored);
    requireWhen(controls.sponsorName, sponsored);
    requireWhen(controls.currentlyEmployed, rules.employmentQuestions);
    requireWhen(controls.registeredInMbruResidency, rules.employmentQuestions);
  },

  values(form): SectionValues {
    return form.getRawValue();
  },
};
