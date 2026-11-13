import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

/**
 * Error text for a control, shown once the control was touched or the step was checked
 * (showAll). One place for every validation message keeps wording consistent across the wizard.
 */
export function fieldError(control: AbstractControl | null | undefined, showAll: boolean): string {
  if (!control || control.disabled || !control.errors || !(control.touched || showAll)) {
    return '';
  }

  return errorText(control.errors);
}

export function errorText(errors: ValidationErrors): string {
  if (errors['required']) {
    return $localize`:@@portal.error.required:This field is required.`;
  }

  if (errors['requiredTrue']) {
    return $localize`:@@portal.error.requiredTrue:Please confirm to continue.`;
  }

  if (errors['email']) {
    return $localize`:@@portal.error.email:Enter an e-mail address like name@example.com.`;
  }

  if (errors['emailMismatch']) {
    return $localize`:@@portal.error.emailMismatch:The e-mail addresses do not match.`;
  }

  if (errors['englishName']) {
    return $localize`:@@portal.error.englishName:Use English letters only.`;
  }

  if (errors['arabicText']) {
    return $localize`:@@portal.error.arabicText:Use Arabic letters only.`;
  }

  if (errors['pastDate']) {
    return $localize`:@@portal.error.pastDate:Enter a date in the past.`;
  }

  if (errors['futureDate']) {
    return $localize`:@@portal.error.futureDate:Enter a date in the future.`;
  }

  if (errors['dateOrder']) {
    return $localize`:@@portal.error.dateOrder:The end date must be after the start date.`;
  }

  if (errors['dahcDate']) {
    return $localize`:@@portal.error.date:Enter a date as DD/MM/YYYY.`;
  }

  if (errors['number']) {
    return $localize`:@@portal.error.number:Enter a number.`;
  }

  if (errors['min'] || errors['max']) {
    const min = (errors['min'] as { min: number } | undefined)?.min;
    const max = (errors['max'] as { max: number } | undefined)?.max;

    return min !== undefined
      ? $localize`:@@portal.error.min:Enter ${min}:min: or more.`
      : $localize`:@@portal.error.max:Enter ${max}:max: or less.`;
  }

  if (errors['minlength']) {
    const length = (errors['minlength'] as { requiredLength: number }).requiredLength;

    return $localize`:@@portal.error.minlength:Enter at least ${length}:length: characters.`;
  }

  if (errors['maxlength']) {
    const length = (errors['maxlength'] as { requiredLength: number }).requiredLength;

    return $localize`:@@portal.error.maxlength:Enter no more than ${length}:length: characters.`;
  }

  if (errors['url']) {
    return $localize`:@@portal.error.url:Enter a link that starts with https://.`;
  }

  if (errors['pattern'] || errors['dahcPhone']) {
    return $localize`:@@portal.error.format:Check the format of this value.`;
  }

  return $localize`:@@portal.error.invalid:Check this value.`;
}

const ENGLISH_NAME = /^[A-Za-z][A-Za-z '.-]*$/;
const ARABIC_TEXT = /^[؀-ۿ\s]+$/;

/** English letters, spaces and name punctuation (SBRD:458-463). */
export const englishName: ValidatorFn = control =>
  typeof control.value === 'string' && control.value !== '' && !ENGLISH_NAME.test(control.value.trim()) ? { englishName: true } : null;

/** Arabic letters only (SBRD:458-463). */
export const arabicText: ValidatorFn = control =>
  typeof control.value === 'string' && control.value !== '' && !ARABIC_TEXT.test(control.value.trim()) ? { arabicText: true } : null;

function today(): string {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/** ISO dates compare as text. */
export const pastDate: ValidatorFn = control =>
  typeof control.value === 'string' && control.value !== '' && control.value >= today() ? { pastDate: true } : null;

export const futureDate: ValidatorFn = control =>
  typeof control.value === 'string' && control.value !== '' && control.value <= today() ? { futureDate: true } : null;

/** A decimal number in a range; the field stays text so candidates can type freely. */
export function numberInRange(min: number, max: number): ValidatorFn {
  return control => {
    const value = typeof control.value === 'string' ? control.value.trim() : '';

    if (value === '') {
      return null;
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return { number: true };
    }

    if (number < min) {
      return { min: { min, actual: number } };
    }

    return number > max ? { max: { max, actual: number } } : null;
  };
}

export const httpsUrl: ValidatorFn = control =>
  typeof control.value === 'string' && control.value !== '' && !/^https:\/\/\S+\.\S+/.test(control.value.trim()) ? { url: true } : null;

export const email: ValidatorFn = control => (control.value === '' ? null : Validators.email(control));

/**
 * Adds or removes "required" on a control as a condition changes, without emitting, so
 * conditional fields (shown only for some answers) are required only while they apply.
 */
export function requireWhen(control: AbstractControl, condition: boolean, validator: ValidatorFn = Validators.required): void {
  const has = control.hasValidator(validator);

  if (condition && !has) {
    control.addValidators(validator);
    control.updateValueAndValidity({ emitEvent: false });
  } else if (!condition && has) {
    control.removeValidators(validator);
    control.updateValueAndValidity({ emitEvent: false });
  }
}

/** Marks every control of a step as touched so their errors show. */
export function revealErrors(control: AbstractControl): void {
  control.markAllAsTouched();
}
