import { DahcTagPurpose } from 'dahc-ui';

import { AnnouncementStatus, PortfolioStatus, VerificationStatus } from '../../api/admission.models';

export interface StatusDisplay {
  readonly label: string;
  readonly purpose: DahcTagPurpose;
}

/** Label and tag purpose of a verification status (BRD Verification Status profile). */
export function verificationStatusDisplay(status: VerificationStatus): StatusDisplay {
  switch (status) {
    case 'PENDING':
      return { label: $localize`:@@portal.workflow.verification.pending:Pending`, purpose: 'information' };
    case 'IN_PROGRESS':
      return { label: $localize`:@@portal.workflow.verification.inProgress:In progress`, purpose: 'in-progress' };
    case 'CORRECTION_REQUIRED':
      return { label: $localize`:@@portal.workflow.verification.correctionRequired:Correction required`, purpose: 'warning' };
    case 'CORRECTION_SUBMITTED':
      return { label: $localize`:@@portal.workflow.verification.correctionSubmitted:Correction submitted`, purpose: 'information' };
    case 'PENDING_CLARIFICATION':
      return { label: $localize`:@@portal.workflow.verification.pendingClarification:Pending clarification`, purpose: 'warning' };
    case 'CLARIFICATION_SUBMITTED':
      return { label: $localize`:@@portal.workflow.verification.clarificationSubmitted:Clarification submitted`, purpose: 'information' };
    case 'SCREEN_OUT_PENDING_APPROVAL':
      return { label: $localize`:@@portal.workflow.verification.screenOutPending:Screen out pending approval`, purpose: 'warning' };
    case 'RE_EVALUATING':
      return { label: $localize`:@@portal.workflow.verification.reEvaluating:Re-evaluating`, purpose: 'in-progress' };
    case 'COMPLETE':
      return { label: $localize`:@@portal.workflow.verification.complete:Complete`, purpose: 'success' };
    case 'SCREENED_OUT':
      return { label: $localize`:@@portal.workflow.verification.screenedOut:Screened out`, purpose: 'error' };
    case 'ON_HOLD':
      return { label: $localize`:@@portal.workflow.verification.onHold:On hold`, purpose: 'informative-blue' };
  }
}

/** Label and tag purpose of a portfolio status (BRD Portfolio Status profile). */
export function portfolioStatusDisplay(status: PortfolioStatus): StatusDisplay {
  switch (status) {
    case 'PENDING':
      return { label: $localize`:@@portal.workflow.portfolio.pending:Pending`, purpose: 'information' };
    case 'IN_PROGRESS':
      return { label: $localize`:@@portal.workflow.portfolio.inProgress:In progress`, purpose: 'in-progress' };
    case 'THIRD_REFEREE_REQUIRED':
      return { label: $localize`:@@portal.workflow.portfolio.thirdRefereeRequired:Third referee required`, purpose: 'warning' };
    case 'THIRD_ROUND_IN_PROGRESS':
      return { label: $localize`:@@portal.workflow.portfolio.thirdRoundInProgress:Third round in progress`, purpose: 'in-progress' };
    case 'COMPLETE':
      return { label: $localize`:@@portal.workflow.portfolio.complete:Complete`, purpose: 'success' };
    case 'SECOND_EVALUATION_REQUIRED':
      return { label: $localize`:@@portal.workflow.portfolio.secondEvaluationRequired:2nd evaluation required`, purpose: 'warning' };
    case 'SECOND_EVALUATION_IN_PROGRESS':
      return { label: $localize`:@@portal.workflow.portfolio.secondEvaluationInProgress:2nd evaluation in progress`, purpose: 'in-progress' };
    case 'ON_HOLD':
      return { label: $localize`:@@portal.workflow.portfolio.onHold:On hold`, purpose: 'informative-blue' };
  }
}

/** Label and tag purpose of an announcement status (EPIC-04). */
export function announcementStatusDisplay(status: AnnouncementStatus): StatusDisplay {
  switch (status) {
    case 'PENDING':
      return { label: $localize`:@@portal.workflow.announcement.pending:Pending`, purpose: 'information' };
    case 'READY_FOR_INITIAL_ANNOUNCEMENT':
      return { label: $localize`:@@portal.workflow.announcement.readyInitial:Ready to announce`, purpose: 'in-progress' };
    case 'ANNOUNCED':
      return { label: $localize`:@@portal.workflow.announcement.announced:Announced`, purpose: 'success' };
    case 'APPEAL_UNDER_REVIEW':
      return { label: $localize`:@@portal.workflow.announcement.appealUnderReview:Appeal under review`, purpose: 'warning' };
    case 'READY_FOR_REANNOUNCEMENT':
      return { label: $localize`:@@portal.workflow.announcement.readyReannouncement:Ready to reannounce`, purpose: 'in-progress' };
    case 'REANNOUNCED':
      return { label: $localize`:@@portal.workflow.announcement.reannounced:Reannounced`, purpose: 'success' };
  }
}

/** A weighted score as "X.XX / Y" (BRD), or a dash when there is none. */
export function weightedScore(score: number | null | undefined, weight?: number | null): string {
  if (score === null || score === undefined) {
    return '–';
  }

  return weight === null || weight === undefined ? score.toFixed(2) : `${score.toFixed(2)} / ${weight}`;
}
