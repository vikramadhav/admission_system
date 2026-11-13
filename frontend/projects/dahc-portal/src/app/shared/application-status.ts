import { DahcTagPurpose } from 'dahc-ui';

import { ApplicationStatus } from '../api/application.models';

export interface ApplicationStatusDisplay {
  readonly label: string;
  readonly purpose: DahcTagPurpose;
}

/**
 * Localized label and tag purpose for a candidate-visible application status. GME Figma shows
 * DRAFT in orange (warning) and SUBMITTED in light blue (information); the others follow meaning.
 */
export function applicationStatusDisplay(status: ApplicationStatus): ApplicationStatusDisplay {
  switch (status) {
    case 'DRAFT':
      return { label: $localize`:@@portal.status.draft:Draft`, purpose: 'warning' };
    case 'SUBMITTED':
      return { label: $localize`:@@portal.status.submitted:Submitted`, purpose: 'information' };
    case 'UNDER_REVIEW':
      return { label: $localize`:@@portal.status.underReview:Under review`, purpose: 'in-progress' };
    case 'CORRECTION_REQUIRED':
      return { label: $localize`:@@portal.status.correctionRequired:Correction required`, purpose: 'warning' };
    case 'CORRECTION_SUBMITTED':
      return { label: $localize`:@@portal.status.correctionSubmitted:Correction submitted`, purpose: 'information' };
    case 'SCREENED_OUT':
      return { label: $localize`:@@portal.status.screenedOut:Screened out`, purpose: 'error' };
    case 'REVIEW_COMPLETED':
      return { label: $localize`:@@portal.status.reviewCompleted:Review completed`, purpose: 'success' };
    case 'APPEAL_UNDER_REVIEW':
      return { label: $localize`:@@portal.status.appealUnderReview:Appeal under review`, purpose: 'in-progress' };
    case 'WITHDRAWN':
      return { label: $localize`:@@portal.status.withdrawn:Withdrawn`, purpose: 'informative-blue' };
    case 'ARCHIVED':
      return { label: $localize`:@@portal.status.archived:Archived`, purpose: 'informative-blue' };
  }
}
