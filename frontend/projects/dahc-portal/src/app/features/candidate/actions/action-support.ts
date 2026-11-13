import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

import { isApiProblemError } from '../../../core/api/api-problem-error';

/** Text for a failed action shown inside its dialog (the request was sent with callerHandlesProblems()). */
export function actionProblemText(error: unknown): string {
  if (isApiProblemError(error)) {
    return error.problem.detail ?? error.problem.title;
  }

  return $localize`:@@portal.problem.unexpected:Something went wrong. Please try again later.`;
}

export function actionProblemCode(error: unknown): string {
  return isApiProblemError(error) ? error.problem.code : '';
}

const MEANINGLESS = ['reason', 'na', 'n/a', 'none'];

/** Free-text reasons need at least 3 letters and cannot be a placeholder word (US-1.2.4 data dictionary). */
export const meaningfulReason: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = typeof control.value === 'string' ? control.value.trim() : '';

  if (value === '') {
    return null;
  }

  const letters = value.replace(/[^\p{L}]/gu, '');

  return letters.length < 3 || MEANINGLESS.includes(value.toLowerCase()) ? { meaningfulReason: true } : null;
};

export function reasonErrorText(control: AbstractControl, showAll: boolean): string {
  if (!(control.touched || showAll) || !control.errors) {
    return '';
  }

  if (control.errors['required']) {
    return $localize`:@@portal.error.required:This field is required.`;
  }

  if (control.errors['maxlength']) {
    const length = (control.errors['maxlength'] as { requiredLength: number }).requiredLength;

    return $localize`:@@portal.error.maxlength:Enter no more than ${length}:length: characters.`;
  }

  return $localize`:@@portal.actions.reasonInvalid:Describe the reason in at least 3 letters.`;
}

/** Seconds until an ISO instant, never negative. */
export function secondsUntil(iso: string, now = Date.now()): number {
  const target = Date.parse(iso);

  return Number.isNaN(target) ? 0 : Math.max(0, Math.ceil((target - now) / 1000));
}
