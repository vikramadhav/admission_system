// Hand-written from the contract schemas of the Admission Operations tag (OQ-08). Fields marked
// PROPOSAL are not in the contract yet: the mock returns them and the portal works without them.

import { ApplicationStatus } from './application.models';
import { AttachmentMetadata } from './candidate-lifecycle.models';
import { Program } from './catalog.models';

export type VerificationStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'CORRECTION_REQUIRED'
  | 'CORRECTION_SUBMITTED'
  | 'PENDING_CLARIFICATION'
  | 'CLARIFICATION_SUBMITTED'
  | 'SCREEN_OUT_PENDING_APPROVAL'
  | 'RE_EVALUATING'
  | 'COMPLETE'
  | 'SCREENED_OUT'
  | 'ON_HOLD';

/** Overall portfolio-scoring status; separate from each round's status. */
export type PortfolioStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'THIRD_REFEREE_REQUIRED'
  | 'THIRD_ROUND_IN_PROGRESS'
  | 'COMPLETE'
  | 'SECOND_EVALUATION_REQUIRED'
  | 'SECOND_EVALUATION_IN_PROGRESS'
  | 'ON_HOLD';

export type AnnouncementStatus =
  | 'PENDING'
  | 'READY_FOR_INITIAL_ANNOUNCEMENT'
  | 'ANNOUNCED'
  | 'APPEAL_UNDER_REVIEW'
  | 'READY_FOR_REANNOUNCEMENT'
  | 'REANNOUNCED';

/** Pool insights summed across the caller's pools, or all pools for supervisors. */
export interface VerificationPoolInsights {
  readonly submitted: number;
  readonly underVerification: number;
  readonly pendingWithCandidate: number;
  readonly screenedOut: number;
  readonly completed: number;
}

export interface OfficerQueueInsights {
  readonly inProgress: number;
  readonly pendingResponse: number;
  readonly pendingWithSupervisor: number;
  readonly resubmittedByCandidate: number;
  readonly resubmittedBySupervisor: number;
  readonly completed: number;
  readonly screenedOut: number;
  readonly autoReturnedToPool: number;
}

/** Personal-queue category that filters the officer inbox (US-2.1.2 AC10). */
export type OfficerInsight =
  | 'IN_PROGRESS'
  | 'PENDING_RESPONSE'
  | 'PENDING_WITH_SUPERVISOR'
  | 'RESUBMITTED_BY_CANDIDATE'
  | 'RESUBMITTED_BY_SUPERVISOR'
  | 'COMPLETED'
  | 'SCREENED_OUT'
  | 'AUTO_RETURNED_TO_POOL';

export interface VerificationInboxItem {
  readonly applicationId: string;
  /** Application number shown to people (D-19); the UUID goes in URLs. */
  readonly applicationNumber: string;
  readonly candidateName: string;
  readonly programName: string;
  /** First-preference specialty (the pool). Training sites are never included. */
  readonly specialtyName?: string;
  readonly poolId: string;
  readonly assignedOfficerId?: string | null;
  readonly submittedAt?: string | null;
  readonly retrievedAt?: string | null;
  readonly dueAt?: string | null;
  readonly overdue?: boolean;
  readonly applicationStatus: ApplicationStatus;
  readonly verificationStatus: VerificationStatus;
  readonly portfolioStatus?: PortfolioStatus;
  readonly gpaShortlistingScore?: number | null;
  /** Residency only. */
  readonly examShortlistingScore?: number | null;
}

export interface Page {
  readonly limit: number;
  readonly nextCursor: string | null;
}

/** PROPOSAL (PQ-03): the pools the caller can retrieve from. */
export interface AssignedPool {
  readonly poolId: string;
  readonly programName: string;
  readonly specialtyName: string;
  /** Applications or portfolios waiting in the pool. */
  readonly waiting: number;
}

export interface OfficerDashboard {
  readonly poolInsights: VerificationPoolInsights;
  readonly queueInsights: OfficerQueueInsights;
  readonly items: readonly VerificationInboxItem[];
  readonly page: Page;
  readonly generatedAt: string;
  /** PROPOSAL (PQ-03). */
  readonly pools?: readonly AssignedPool[];
}

export interface OfficerWorkloadRow {
  readonly officerId: string;
  readonly officerName: string;
  readonly poolIds?: readonly string[];
  readonly queueInsights: OfficerQueueInsights;
  readonly overdueCount: number;
}

export interface OfficerWorkload {
  readonly officer: OfficerWorkloadRow;
  readonly items: readonly VerificationInboxItem[];
  readonly page: Page;
}

export type RefereeRole = 'REFEREE' | 'THIRD_REFEREE' | 'SECOND_EVALUATION_REFEREE';

export interface RefereeWorkloadRow {
  readonly refereeId: string;
  readonly refereeName: string;
  readonly role: RefereeRole;
  readonly inProgress: number;
  readonly completed: number;
  readonly autoReturnedToPool: number;
  readonly coiReturned: number;
}

export interface SupervisorQueueInsights {
  readonly totalComplete: number;
  readonly totalScreenedOut: number;
  readonly pendingEscalated: number;
  readonly pendingScreenOut: number;
  readonly pendingReinstatement: number;
  readonly totalReinstated: number;
  readonly totalReinstatementRejected: number;
}

export type SupervisorQueue = 'ESCALATION' | 'SCREEN_OUT' | 'REINSTATEMENT';

export interface SupervisorInboxItem {
  readonly itemId: string;
  readonly queue: SupervisorQueue;
  readonly applicationId: string;
  readonly applicationNumber: string;
  readonly reinstatementRequestId?: string | null;
  readonly candidateName: string;
  readonly programName: string;
  readonly specialtyName?: string;
  readonly officerName?: string | null;
  readonly requestedAt: string;
  readonly verificationStatus?: VerificationStatus | null;
}

export interface SupervisorDashboard {
  readonly poolInsights: VerificationPoolInsights;
  readonly queueInsights: SupervisorQueueInsights;
  readonly inbox: { readonly items: readonly SupervisorInboxItem[]; readonly page: Page };
  readonly officersWorkload: readonly OfficerWorkloadRow[];
  readonly refereesWorkload: readonly RefereeWorkloadRow[];
  readonly generatedAt: string;
}

export interface StaffUserSummary {
  readonly userId: string;
  readonly displayName: string;
  readonly activeAssignments?: number;
}

/** An active attachment as admission staff see it (portfolio evidence is never included). */
export interface ApplicationAttachment {
  readonly sectionKey: string;
  readonly documentTypeCode: string;
  readonly label: string;
  readonly specialtyId?: string | null;
  readonly attachment: AttachmentMetadata;
  readonly previousVersionCount: number;
}

/** A flagged field, attachment, section or subsection with the candidate-facing note (US-2.3.2). */
export interface CorrectionFlag {
  /** JSON Pointer to what is flagged, for example `/sections/academic-information/values/degree`. */
  readonly fieldPointer: string;
  /** Note template code (lookup CORRECTION_NOTE_TEMPLATE). */
  readonly candidateNoteCode: string;
  /** Up to 500 characters. */
  readonly candidateNote?: string;
}

export interface CorrectionFlagSet {
  readonly flags: readonly CorrectionFlag[];
}

export type StaffNoteType = 'CORRECTION' | 'ESCALATION' | 'SCREEN_OUT' | 'SUPERVISOR_GUIDANCE';

export interface StaffNote {
  readonly noteType: StaffNoteType;
  readonly text: string;
  readonly createdAt: string;
  readonly authorDisplayName?: string;
}

/**
 * PROPOSAL (PQ-25): verification context the staff application view needs. The contract's
 * getApplicationForVerification returns only the plain Application, without verification status,
 * flags, notes, the pending screen-out recommendation or the candidate id (PQ-04, PQ-05).
 */
export interface VerificationReview {
  readonly candidateId?: string | null;
  readonly candidateName: string;
  readonly verificationStatus: VerificationStatus;
  readonly portfolioStatus?: PortfolioStatus | null;
  readonly assignedOfficerName?: string | null;
  readonly dueAt?: string | null;
  readonly gpaShortlistingScore?: number | null;
  readonly examShortlistingScore?: number | null;
  /** Fields filled from ICP, shown highlighted (US-2.3.1). Pointers as in CorrectionFlag. */
  readonly icpFieldPointers?: readonly string[];
  readonly flags: readonly CorrectionFlag[];
  readonly notes: readonly StaffNote[];
  readonly screenOutRecommendation?: { readonly reasonCode: string; readonly note?: string | null } | null;
}

/** The application as admission staff read it: Application plus the proposed review block. */
export interface StaffApplication {
  readonly id: string;
  readonly applicationNumber: string;
  readonly program: Program;
  readonly status: ApplicationStatus;
  readonly createdAt: string;
  readonly submittedAt?: string | null;
  readonly version: number;
  /** Section values keyed by section key (form schema field codes). */
  readonly sections?: Readonly<Record<string, Readonly<Record<string, unknown>>>>;
  /** PROPOSAL (PQ-25). */
  readonly review?: VerificationReview;
}

export type VerificationFeedbackAction =
  | 'RETURN_FOR_CORRECTION'
  | 'COMPLETE_VERIFICATION'
  | 'RECOMMEND_SCREEN_OUT'
  | 'ESCALATE_FOR_CLARIFICATION';

export interface ScreenOutDecision {
  readonly decision: 'ENDORSE_SCREEN_OUT' | 'REJECT_SCREEN_OUT';
  /** On endorsement replaces the officer's reason; null keeps it. */
  readonly reasonCode?: string | null;
  /** Mandatory when rejecting; up to 500 characters. */
  readonly note?: string | null;
}

export interface BulkReassignmentRequest {
  readonly action: 'REASSIGN' | 'RETURN_TO_POOL';
  readonly applicationIds: readonly string[];
  /** Required for REASSIGN; an officer of the same pool. */
  readonly targetOfficerId?: string | null;
  /** Up to 200 characters. */
  readonly justification: string;
  readonly confirmed: true;
}

export interface BulkWorkflowResult {
  readonly selectedCount: number;
  readonly processedCount: number;
  readonly blockedCount: number;
  readonly results: readonly { readonly resourceId: string; readonly outcome: 'PROCESSED' | 'BLOCKED'; readonly code?: string }[];
}

export type ReinstatementRequestStatus = 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export interface ReinstatementRequestSummary {
  readonly requestId: string;
  readonly applicationId: string;
  readonly applicationNumber: string;
  readonly candidateName: string;
  readonly programName: string;
  readonly cycleId: string;
  readonly requestedAt: string;
  readonly status: ReinstatementRequestStatus;
}

export interface ReinstatementRequestDetail extends ReinstatementRequestSummary {
  readonly withdrawalReasonCode: string;
  readonly withdrawalOtherReason?: string | null;
  readonly withdrawnAt: string;
  readonly justification: string;
  readonly previousStatus: {
    readonly applicationStatus: ApplicationStatus;
    readonly verificationStatus?: VerificationStatus | null;
    readonly portfolioStatus?: PortfolioStatus | null;
  };
  readonly notes: readonly StaffNote[];
  readonly decision?: {
    readonly decision: 'APPROVE' | 'REJECT';
    readonly reasonCode?: string | null;
    readonly note: string;
    readonly decidedAt: string;
    readonly decidedByDisplayName?: string;
  } | null;
}

export interface ReinstatementDecision {
  readonly decision: 'APPROVE' | 'REJECT';
  /** Required for REJECT (lookup REINSTATEMENT_REJECTION_REASON). */
  readonly reasonCode?: string | null;
  /** 1 to 500 characters. */
  readonly note: string;
}

export interface DuplicateAccountParty {
  readonly candidateId: string;
  readonly candidateNumber: string;
  readonly displayName: string;
  readonly createdAt: string;
}

export interface DuplicateAccountPair {
  readonly pairId: string;
  readonly detectedAt: string;
  readonly matchedOn: readonly ('MOBILE' | 'EMIRATES_ID' | 'PASSPORT')[];
  readonly original: DuplicateAccountParty;
  readonly duplicate: DuplicateAccountParty;
}

export interface IcpFieldComparison {
  readonly fieldCode: string;
  readonly label: string;
  readonly currentValue: string | null;
  readonly icpValue: string | null;
  readonly differs: boolean;
}

export interface IcpRefreshPreview {
  readonly differencesFound: boolean;
  readonly previewToken: string | null;
  readonly expiresAt: string | null;
  readonly fields: readonly IcpFieldComparison[];
}

export interface IcpRefreshResult {
  readonly refreshedAt: string;
  readonly changedFields: readonly string[];
  readonly auditEventId: string;
}
