import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

import { SectionValues } from '../../../../../api/candidate-lifecycle.models';
import { arabicText, email, englishName, futureDate, pastDate, requireWhen } from '../../../../../shared/forms/form-errors';
import { GCC_COUNTRIES } from '../../../../../shared/reference-data';
import { YesNo, groupOf } from '../../../../../shared/section-values';
import { SectionFormDefinition } from '../../wizard-model';

type Text = FormControl<string>;
type Answer = FormControl<YesNo>;

export type IdentityForm = FormGroup<{
  firstNameEn: Text;
  middleNameEn: Text;
  lastNameEn: Text;
  firstNameAr: Text;
  middleNameAr: Text;
  lastNameAr: Text;
  dateOfBirth: Text;
  gender: Text;
  maritalStatus: Text;
  nationality: Text;
  countryOfBirth: Text;
  childOfUaeMother: Answer;
  hasMarsoom: Answer;
  countryOfResidence: Text;
  cityOfResidence: Text;
  hasEmiratesId: Answer;
  emiratesIdNumber: Text;
  emiratesIdExpiry: Text;
  visaUnifiedNumber: Text;
  visaFileNumber: Text;
  visaPlaceOfIssue: Text;
  visaExpiry: Text;
  passportNumber: Text;
  passportCountry: Text;
  passportIssueDate: Text;
  passportExpiry: Text;
  passportCity: Text;
  familyBookCityNumber: Text;
  familyId: Text;
  passportUnifiedNumber: Text;
}>;

export type ContactForm = FormGroup<{
  registeredEmail: Text;
  registeredMobile: Text;
  contactEmail: Text;
  contactMobile: Text;
}>;

export type NextOfKinForm = FormGroup<{
  firstName: Text;
  middleName: Text;
  surname: Text;
  relationship: Text;
  phone: Text;
  email: Text;
  confirmEmail: Text;
  areaOfResidence: Text;
}>;

export type PersonalInformationForm = FormGroup<{
  identity: IdentityForm;
  contact: ContactForm;
  nextOfKin: NextOfKinForm;
}>;

/** Emirates ID format 784-YYYY-NNNNNNN-N. */
export const EMIRATES_ID_PATTERN = /^784-\d{4}-\d{7}-\d$/;

const text = (...validators: ValidatorFn[]): Text => new FormControl('', { nonNullable: true, validators });
const answer = (): Answer => new FormControl<YesNo>('', { nonNullable: true });

/** Puts { emailMismatch } on confirmEmail when it differs from email (and keeps its other errors). */
const emailsMatch: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const group = control as NextOfKinForm;
  const confirm = group.controls.confirmEmail;
  const mismatch = confirm.value !== '' && confirm.value.trim().toLowerCase() !== group.controls.email.value.trim().toLowerCase();
  const errors: ValidationErrors = { ...(confirm.errors ?? {}) };
  delete errors['emailMismatch'];

  if (mismatch) {
    errors['emailMismatch'] = true;
  }

  confirm.setErrors(Object.keys(errors).length > 0 ? errors : null, { emitEvent: false });

  return null;
};

function patchGroup(group: FormGroup, values: SectionValues): void {
  group.patchValue(values as Record<string, unknown>, { emitEvent: false });
}

/**
 * Personal information (US-1.3.3, SBRD:443-526; Figma 1:2781-1:3604): the candidate profile shared
 * by every application (D-10), edited as identity, contact and next-of-kin sub-steps. Read-only
 * ICP and IDAM fields are disabled by the wizard from the section's field states.
 */
export const personalInformationDefinition: SectionFormDefinition<PersonalInformationForm> = {
  key: 'personal-information',

  create(): PersonalInformationForm {
    return new FormGroup({
      identity: new FormGroup({
        firstNameEn: text(Validators.required, englishName, Validators.maxLength(100)),
        middleNameEn: text(englishName, Validators.maxLength(100)),
        lastNameEn: text(Validators.required, englishName, Validators.maxLength(100)),
        firstNameAr: text(arabicText, Validators.maxLength(100)),
        middleNameAr: text(arabicText, Validators.maxLength(100)),
        lastNameAr: text(arabicText, Validators.maxLength(100)),
        dateOfBirth: text(Validators.required, pastDate),
        gender: text(Validators.required),
        maritalStatus: text(Validators.required),
        nationality: text(Validators.required),
        countryOfBirth: text(Validators.required),
        childOfUaeMother: answer(),
        hasMarsoom: answer(),
        countryOfResidence: text(Validators.required),
        cityOfResidence: text(),
        hasEmiratesId: answer(),
        emiratesIdNumber: text(Validators.pattern(EMIRATES_ID_PATTERN)),
        emiratesIdExpiry: text(),
        visaUnifiedNumber: text(Validators.maxLength(20)),
        visaFileNumber: text(Validators.maxLength(30)),
        visaPlaceOfIssue: text(),
        visaExpiry: text(),
        passportNumber: text(Validators.required, Validators.maxLength(20)),
        passportCountry: text(Validators.required),
        passportIssueDate: text(Validators.required, pastDate),
        passportExpiry: text(Validators.required, futureDate),
        passportCity: text(Validators.required, Validators.maxLength(100)),
        familyBookCityNumber: text(Validators.maxLength(10)),
        familyId: text(Validators.maxLength(20)),
        passportUnifiedNumber: text(Validators.maxLength(20)),
      }),
      contact: new FormGroup({
        registeredEmail: text(),
        registeredMobile: text(),
        contactEmail: text(Validators.required, email),
        contactMobile: text(Validators.required),
      }),
      nextOfKin: new FormGroup(
        {
          firstName: text(Validators.required, englishName, Validators.maxLength(100)),
          middleName: text(englishName, Validators.maxLength(100)),
          surname: text(Validators.required, englishName, Validators.maxLength(100)),
          relationship: text(Validators.required),
          phone: text(Validators.required),
          email: text(Validators.required, email),
          confirmEmail: text(Validators.required, email),
          areaOfResidence: text(Validators.required, Validators.maxLength(200)),
        },
        { validators: emailsMatch },
      ),
    });
  },

  patch(form, values): void {
    patchGroup(form.controls.identity, groupOf(values, 'identity'));
    patchGroup(form.controls.contact, groupOf(values, 'contact'));
    patchGroup(form.controls.nextOfKin, groupOf(values, 'nextOfKin'));
    form.controls.nextOfKin.updateValueAndValidity({ emitEvent: false });
  },

  sync(form): void {
    const identity = form.controls.identity.controls;
    const { nonEmirati, emirati, residentInUae, hasEmiratesId, needsVisa } = identityConditions(identity);

    requireWhen(identity.childOfUaeMother, nonEmirati);
    requireWhen(identity.hasMarsoom, nonEmirati);
    requireWhen(identity.cityOfResidence, residentInUae);
    requireWhen(identity.hasEmiratesId, residentInUae);
    requireWhen(identity.emiratesIdNumber, hasEmiratesId);
    requireWhen(identity.emiratesIdExpiry, hasEmiratesId);
    requireWhen(identity.visaUnifiedNumber, needsVisa);
    requireWhen(identity.visaFileNumber, needsVisa);
    requireWhen(identity.visaPlaceOfIssue, needsVisa);
    requireWhen(identity.visaExpiry, needsVisa);
    requireWhen(identity.familyBookCityNumber, emirati);
    requireWhen(identity.familyId, emirati);
  },

  values(form): SectionValues {
    return form.getRawValue();
  },
};

/** Which conditional identity fields apply, shared by the form rules and the identity step. */
export function identityConditions(identity: IdentityForm['controls']): {
  nonEmirati: boolean;
  emirati: boolean;
  residentInUae: boolean;
  hasEmiratesId: boolean;
  needsVisa: boolean;
} {
  const nationality = identity.nationality.value;
  const residentInUae = identity.countryOfResidence.value === 'AE';
  const hasEmiratesId = residentInUae && identity.hasEmiratesId.value === 'YES';

  return {
    nonEmirati: nationality !== '' && nationality !== 'AE',
    emirati: nationality === 'AE',
    residentInUae,
    hasEmiratesId,
    needsVisa: hasEmiratesId && nationality !== '' && !GCC_COUNTRIES.includes(nationality),
  };
}
