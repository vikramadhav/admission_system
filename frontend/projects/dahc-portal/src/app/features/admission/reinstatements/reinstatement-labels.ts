import { DahcTagPurpose } from 'dahc-ui';

import { ReinstatementRequestStatus, StaffNoteType } from '../../../api/admission.models';

export function reinstatementStatusDisplay(status: ReinstatementRequestStatus): { readonly label: string; readonly purpose: DahcTagPurpose } {
  switch (status) {
    case 'SUBMITTED':
      return { label: $localize`:@@portal.admission.reinstatement.statusSubmitted:Submitted`, purpose: 'in-progress' };
    case 'APPROVED':
      return { label: $localize`:@@portal.admission.reinstatement.statusApproved:Approved`, purpose: 'success' };
    case 'REJECTED':
      return { label: $localize`:@@portal.admission.reinstatement.statusRejected:Rejected`, purpose: 'error' };
  }
}

/** Withdrawal reasons of US-1.2.4 by code; an unknown code is shown as received. */
export function withdrawalReasonLabel(code: string): string {
  switch (code) {
    case 'NOT_MEETING_ELIGIBILITY':
      return $localize`:@@portal.admission.reinstatement.reasonEligibility:Not meeting eligibility criteria`;
    case 'JOINING_ANOTHER_PROGRAM':
      return $localize`:@@portal.admission.reinstatement.reasonAnotherProgram:Joining another training program`;
    case 'PERSONAL_REASONS':
      return $localize`:@@portal.admission.reinstatement.reasonPersonal:Personal reasons`;
    case 'FINANCIAL_REASONS':
      return $localize`:@@portal.admission.reinstatement.reasonFinancial:Financial reasons`;
    case 'SCHOLARSHIP_OPPORTUNITY':
      return $localize`:@@portal.admission.reinstatement.reasonScholarship:Scholarship opportunity`;
    case 'OTHERS':
      return $localize`:@@portal.admission.reinstatement.reasonOthers:Others`;
    default:
      return code;
  }
}

export function noteTypeLabel(type: StaffNoteType): string {
  switch (type) {
    case 'CORRECTION':
      return $localize`:@@portal.admission.reinstatement.noteCorrection:Correction note`;
    case 'ESCALATION':
      return $localize`:@@portal.admission.reinstatement.noteEscalation:Escalation`;
    case 'SCREEN_OUT':
      return $localize`:@@portal.admission.reinstatement.noteScreenOut:Screen-out recommendation`;
    case 'SUPERVISOR_GUIDANCE':
      return $localize`:@@portal.admission.reinstatement.noteGuidance:Supervisor guidance`;
  }
}
