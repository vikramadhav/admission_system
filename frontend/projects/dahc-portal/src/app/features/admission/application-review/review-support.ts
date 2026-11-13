import { AbstractControl } from '@angular/forms';

import { isApiProblemError } from '../../../core/api/api-problem-error';

/** Raised by a review dialog when its action succeeded. */
export interface ReviewActionDone {
  /** Success message for the toast. */
  readonly message: string;
  /** True when the application left the user's queue, so the page returns to the dashboard. */
  readonly leave: boolean;
}

/** Notes and justifications accept up to 500 characters (contract maxLength). */
export const NOTE_MAX_LENGTH = 500;

/** The API's message for a failed action, shown inside the dialog (requests use callerHandlesProblems()). */
export function problemText(error: unknown): string {
  if (isApiProblemError(error)) {
    return error.problem.detail ?? error.problem.title;
  }

  return $localize`:@@portal.problem.unexpected:Something went wrong. Please try again later.`;
}

/** Validation message for a control, once it was touched or a submit was attempted. */
export function controlError(control: AbstractControl, attempted: boolean): string {
  if (!(control.touched || attempted) || !control.errors) {
    return '';
  }

  if (control.errors['maxlength']) {
    const length = (control.errors['maxlength'] as { requiredLength: number }).requiredLength;

    return $localize`:@@portal.error.maxlength:Enter no more than ${length}:length: characters.`;
  }

  return $localize`:@@portal.error.required:This field is required.`;
}

/** Validator for required free text that is not only spaces. */
export function notBlank(control: AbstractControl): { required: true } | null {
  return typeof control.value === 'string' && control.value.trim() === '' ? { required: true } : null;
}

/** A new idempotency key, created once each time a dialog opens and reused on retry. */
export function newIdempotencyKey(): string {
  return crypto.randomUUID();
}
