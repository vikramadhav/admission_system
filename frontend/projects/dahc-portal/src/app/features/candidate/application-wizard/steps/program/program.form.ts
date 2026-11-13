import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

import { Preference } from '../../../../../api/application.models';

export type PreferenceForm = FormGroup<{
  specialtyId: FormControl<string>;
  siteIds: FormControl<string[]>;
}>;

export type ProgramForm = FormGroup<{
  programId: FormControl<string>;
  preference1: PreferenceForm;
  preference2: PreferenceForm;
}>;

/** A chosen specialty needs at least one training site (US-1.3.1 AC7). */
const sitesRequiredForSpecialty: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const group = control as PreferenceForm;
  const hasSpecialty = group.controls.specialtyId.value !== '';

  return hasSpecialty && group.controls.siteIds.value.length === 0 ? { sitesRequired: true } : null;
};

/** Both preferences cannot name the same specialty (US-1.3.1 AC11). */
const distinctPreferences: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const form = control as ProgramForm;
  const first = form.controls.preference1.controls.specialtyId.value;

  return first !== '' && first === form.controls.preference2.controls.specialtyId.value ? { samePreference: true } : null;
};

function preferenceForm(required: boolean): PreferenceForm {
  return new FormGroup(
    {
      specialtyId: new FormControl('', { nonNullable: true, validators: required ? [Validators.required] : [] }),
      siteIds: new FormControl<string[]>([], { nonNullable: true }),
    },
    { validators: sitesRequiredForSpecialty },
  );
}

export function createProgramForm(): ProgramForm {
  return new FormGroup(
    {
      programId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      preference1: preferenceForm(true),
      preference2: preferenceForm(false),
    },
    { validators: distinctPreferences },
  );
}

export function patchProgramForm(form: ProgramForm, programId: string, preferences: readonly Preference[] | undefined): void {
  const byOrder = (order: number): Preference | undefined => preferences?.find(item => item.preferenceOrder === order);
  form.reset({ programId, preference1: toPreferenceValue(byOrder(1)), preference2: toPreferenceValue(byOrder(2)) });
}

/** The contract's preferences from the form; sites keep the candidate's order. */
export function programPreferences(form: ProgramForm, maxPreferences: number): Preference[] {
  return [form.controls.preference1, form.controls.preference2]
    .slice(0, maxPreferences)
    .map((group, index) => toPreference(group, index + 1))
    .filter((preference): preference is Preference => preference !== null);
}

function toPreference(group: PreferenceForm, preferenceOrder: number): Preference | null {
  const specialtyId = group.controls.specialtyId.value;

  if (specialtyId === '') {
    return null;
  }

  return {
    specialtyId,
    preferenceOrder,
    trainingSites: group.controls.siteIds.value.map((siteId, index) => ({ siteId, siteOrder: index + 1 })),
  };
}

function toPreferenceValue(preference: Preference | undefined): { specialtyId: string; siteIds: string[] } {
  if (!preference) {
    return { specialtyId: '', siteIds: [] };
  }

  const siteIds = [...preference.trainingSites].sort((first, second) => first.siteOrder - second.siteOrder).map(site => site.siteId);

  return { specialtyId: preference.specialtyId, siteIds };
}
