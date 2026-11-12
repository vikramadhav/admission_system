import { DahcBadgeTone } from 'dahc-ui';

import { ApplicationStatus } from '../../api/application.models';

export interface ApplicationStatusDisplay {
  readonly label: string;
  readonly tone: DahcBadgeTone;
}

/** Localized label and badge tone for a candidate-visible application status. */
export function applicationStatusDisplay(status: ApplicationStatus): ApplicationStatusDisplay {
  switch (status) {
    case 'DRAFT':
      return { label: $localize`:@@portal.status.draft:Draft`, tone: 'neutral' };
    case 'SUBMITTED':
      return { label: $localize`:@@portal.status.submitted:Submitted`, tone: 'info' };
    case 'UNDER_REVIEW':
      return { label: $localize`:@@portal.status.underReview:Under review`, tone: 'info' };
    case 'CORRECTION_REQUIRED':
      return { label: $localize`:@@portal.status.correctionRequired:Correction required`, tone: 'warning' };
    case 'CORRECTION_SUBMITTED':
      return { label: $localize`:@@portal.status.correctionSubmitted:Correction submitted`, tone: 'info' };
    case 'SCREENED_OUT':
      return { label: $localize`:@@portal.status.screenedOut:Screened out`, tone: 'danger' };
    case 'REVIEW_COMPLETED':
      return { label: $localize`:@@portal.status.reviewCompleted:Review completed`, tone: 'success' };
    case 'APPEAL_UNDER_REVIEW':
      return { label: $localize`:@@portal.status.appealUnderReview:Appeal under review`, tone: 'info' };
    case 'WITHDRAWN':
      return { label: $localize`:@@portal.status.withdrawn:Withdrawn`, tone: 'neutral' };
    case 'ARCHIVED':
      return { label: $localize`:@@portal.status.archived:Archived`, tone: 'neutral' };
  }
}
