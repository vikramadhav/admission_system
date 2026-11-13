import { CanDeactivateFn } from '@angular/router';

/**
 * A page with a form that can be left with unsaved changes. The page owns its confirmation
 * (usually a dahc-modal), so the question matches the page's wording.
 */
export interface DahcHasUnsavedChanges {
  hasUnsavedChanges(): boolean;
  /** Asks whether to leave and lose the changes; resolves true to leave. */
  confirmDiscard(): boolean | Promise<boolean>;
}

/** Asks before leaving a page with unsaved changes. */
export const unsavedChangesGuard: CanDeactivateFn<DahcHasUnsavedChanges> = component =>
  component.hasUnsavedChanges() ? component.confirmDiscard() : true;
