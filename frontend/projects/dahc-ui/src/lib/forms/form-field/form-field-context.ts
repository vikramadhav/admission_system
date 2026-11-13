import { InjectionToken, Signal } from '@angular/core';

/** What a form field shares with the native control projected into it (input[dahcInput] and friends). */
export interface DahcFormFieldContext {
  readonly controlId: string;
  readonly describedBy: Signal<string | null>;
  readonly showError: Signal<boolean>;
  readonly required: Signal<boolean>;
  /** The control reports whether its form control is invalid and touched. */
  registerControlInvalid(invalid: Signal<boolean>): void;
  /** The control reports its value length and native maxlength (-1 when none), for the counter. */
  registerControlLength?(length: Signal<number>, maxLength: Signal<number>): void;
}

export const DAHC_FORM_FIELD = new InjectionToken<DahcFormFieldContext>('DAHC_FORM_FIELD');
