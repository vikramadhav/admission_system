import { InjectionToken } from '@angular/core';

/** A sign-in identity offered instead of IDAM (mock build only). */
export interface DahcSignInPersona {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  /** Listed under candidates (default) or staff on the sign-in page. */
  readonly group?: 'candidate' | 'staff';
}

/**
 * Lets a non-production build replace the IDAM hand-off on the sign-in page with a list of
 * personas. Production provides nothing, so the page offers IDAM / UAE Pass only.
 */
export interface DahcAlternativeSignIn {
  readonly personas: readonly DahcSignInPersona[];
  signInAs(personaId: string, returnPath: string): void;
  /** Restores the sample data (mock build). */
  reset?(): void;
}

export const DAHC_ALTERNATIVE_SIGN_IN = new InjectionToken<DahcAlternativeSignIn | null>('DAHC_ALTERNATIVE_SIGN_IN', {
  factory: () => null,
});
