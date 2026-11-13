import { VerificationStatus } from '../../api/admission.models';

/**
 * Which verification actions the portal offers for an application, derived from its
 * verification status and the active role. The contract returns no allowedActions for staff
 * (PQ-02), so these rules copy the BRD; the API stays the authority and its 409 or 422 is shown
 * as returned.
 */
export type VerificationAction =
  // Admission officer
  | 'FLAG'
  | 'RETURN_FOR_CORRECTION'
  | 'COMPLETE_VERIFICATION'
  | 'RECOMMEND_SCREEN_OUT'
  | 'ESCALATE'
  | 'REPLACE_ATTACHMENT'
  // Admission supervisor
  | 'DECIDE_SCREEN_OUT'
  | 'RETURN_WITH_GUIDANCE'
  | 'REINSTATE'
  | 'REFRESH_ICP';

/** Statuses in which the officer works on the application (EPIC-02 Verification Status table). */
const OFFICER_WORKING: readonly VerificationStatus[] = ['IN_PROGRESS', 'CORRECTION_SUBMITTED', 'CLARIFICATION_SUBMITTED', 'RE_EVALUATING'];

/** After supervisor feedback the officer acts through verification-actions instead (US-2.4.5). */
const AFTER_FEEDBACK: readonly VerificationStatus[] = ['CLARIFICATION_SUBMITTED', 'RE_EVALUATING'];

export function verificationActions(status: VerificationStatus, role: string, hasFlags: boolean): readonly VerificationAction[] {
  if (role === 'ADMISSION_OFFICER') {
    if (!OFFICER_WORKING.includes(status)) {
      return [];
    }

    // US-2.3.3: Return for Correction needs at least one flag.
    const actions: VerificationAction[] = ['FLAG', 'REPLACE_ATTACHMENT', 'COMPLETE_VERIFICATION', 'RECOMMEND_SCREEN_OUT', 'ESCALATE'];

    return hasFlags ? ['RETURN_FOR_CORRECTION', ...actions] : actions;
  }

  if (role === 'ADMISSION_SUPERVISOR') {
    // US-2.5.3: ICP refresh is available on any application.
    const actions: VerificationAction[] = ['REFRESH_ICP'];

    if (status === 'SCREEN_OUT_PENDING_APPROVAL') {
      actions.unshift('DECIDE_SCREEN_OUT');
    } else if (status === 'PENDING_CLARIFICATION') {
      actions.unshift('RETURN_WITH_GUIDANCE');
    } else if (status === 'SCREENED_OUT') {
      // STP-2.5 rule 4: direct reinstatement of a screened-out application.
      actions.unshift('REINSTATE');
    }

    return actions;
  }

  return [];
}

/** Whether an officer action must go through the after-feedback operation (US-2.4.5). */
export function isAfterSupervisorFeedback(status: VerificationStatus): boolean {
  return AFTER_FEEDBACK.includes(status);
}
