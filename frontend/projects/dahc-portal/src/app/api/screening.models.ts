// Hand-written from the contract schemas of the Screening and Announcements tag (OQ-08).

import { AnnouncementStatus, PortfolioStatus, VerificationStatus } from './admission.models';
import { ApplicationStatus } from './application.models';

export type CasperAttendance = 'NA' | 'ATTENDED' | 'ABSENT';

export interface ScreeningApplicationRow {
  readonly applicationId: string;
  readonly applicationNumber: string;
  readonly candidateName: string;
  readonly programName: string;
  readonly applicationStatus: ApplicationStatus;
  readonly verificationStatus: VerificationStatus;
  readonly portfolioStatus: PortfolioStatus;
  readonly announcementStatus: AnnouncementStatus;
  readonly casperAttendance: CasperAttendance;
  readonly appealed: boolean;
  readonly gpaShortlistingScore?: number | null;
  readonly examShortlistingScore?: number | null;
  readonly casperShortlistingScore?: number | null;
  /** Final weighted portfolio score; round scores are never listed. */
  readonly portfolioScore?: number | null;
  readonly shortlistingScore: number | null;
  /** Program weights, so each score shows as X.XX / Y. */
  readonly weights?: {
    readonly gpa?: number | null;
    readonly exam?: number | null;
    readonly casper?: number | null;
    readonly portfolio?: number | null;
  };
  readonly reviewCompletedAt?: string | null;
  readonly initialAnnouncedAt?: string | null;
  readonly reannouncedAt?: string | null;
  readonly screenOutReasonCode?: string | null;
}

export interface ScreeningDashboard {
  readonly items: readonly ScreeningApplicationRow[];
  readonly page: { readonly limit: number; readonly nextCursor: string | null };
  readonly generatedAt: string;
}

export interface CasperImportResult {
  readonly uploadVersion: number;
  readonly totalRows: number;
  readonly matchedRows?: number;
  readonly appliedRows: number;
  readonly exceptionRows: number;
  readonly exceptions?: readonly {
    readonly rowNumber: number;
    readonly code: string;
    readonly detail?: string;
    readonly applicationNumberReceived?: string | null;
  }[];
}

/** Bulk announce, screen-out and reannounce request. `reasonCode` matters only for screen-out. */
export interface BulkActionRequest {
  readonly applicationIds: readonly string[];
  readonly reasonCode: string;
  readonly confirmed: true;
}

/** Sort keys allowed by the screening dashboard. */
export type ScreeningSort =
  | 'shortlistingScore'
  | 'portfolioScore'
  | 'gpaShortlistingScore'
  | 'examShortlistingScore'
  | 'casperShortlistingScore'
  | 'applicationId'
  | 'candidateName'
  | 'reviewCompletedAt'
  | 'announcementStatus';

export interface ScreeningFilters {
  readonly announcementStatus?: AnnouncementStatus | null;
  readonly casperAttendance?: CasperAttendance | null;
  readonly appealed?: boolean | null;
  readonly q?: string;
}
