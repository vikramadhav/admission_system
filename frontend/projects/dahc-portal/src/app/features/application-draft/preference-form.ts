import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

import { Preference } from '../../api/application.models';

export type PreferenceForm = FormGroup<{
  specialtyId: FormControl<string>;
  siteIds: FormControl<string[]>;
}>;

export type ApplicationDraftForm = FormGroup<{
  programId: FormControl<string>;
  preference1: PreferenceForm;
  preference2: PreferenceForm;
}>;

/** A chosen specialty needs at least one training site (US-1.3.1 AC7). */
export const sitesRequiredForSpecialty: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const group = control as PreferenceForm;
  const hasSpecialty = group.controls.specialtyId.value !== '';
  const hasSites = group.controls.siteIds.value.length > 0;

  return hasSpecialty && !hasSites ? { sitesRequired: true } : null;
};

/** Both preferences cannot name the same specialty (US-1.3.1 AC11). */
export const distinctPreferences: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const form = control as ApplicationDraftForm;
  const first = form.controls.preference1.controls.specialtyId.value;
  const second = form.controls.preference2.controls.specialtyId.value;

  return first !== '' && first === second ? { samePreference: true } : null;
};

/** Converts one preference group to the contract's PreferenceInput; sites keep the order the candidate chose. */
export function toPreference(group: PreferenceForm, preferenceOrder: number): Preference | null {
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

/** Converts a stored preference back to form values, with sites in their saved order. */
export function toPreferenceValue(preference: Preference | undefined): { specialtyId: string; siteIds: string[] } {
  if (!preference) {
    return { specialtyId: '', siteIds: [] };
  }

  const siteIds = [...preference.trainingSites]
    .sort((first, second) => first.siteOrder - second.siteOrder)
    .map(site => site.siteId);

  return { specialtyId: preference.specialtyId, siteIds };
}
