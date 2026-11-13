// Hand-written from Contracts/openapi (candidate-lifecycle.yaml, applications.yaml and
// components/schemas.yaml): sections, attachments, portfolio, payment, submission and the
// candidate actions. Code generation is not approved yet (OQ-08); keep in step by review.

import type { CorrectionFlag } from './admission.models';

/** Contract parameter sectionKey (PRM:104-118). The portfolio has its own operations. */
export type ApplicationSectionKey =
  | 'application-information'
  | 'personal-information'
  | 'academic-information'
  | 'english-proficiency'
  | 'internship-information'
  | 'residency-information'
  | 'board-license-information'
  | 'residency-entrance-exam';

/** Attachment slots also belong to the portfolio (portfolioQuestionId set). */
export type AttachmentSectionKey = ApplicationSectionKey | 'portfolio';

export type SectionValues = Readonly<Record<string, unknown>>;

/** Field state the server reports for a section (FormFieldDefinition, reduced to what the portal uses). */
export interface SectionFieldState {
  readonly fieldCode: string;
  readonly readOnly: boolean;
  /** Where a read-only value came from, for example ICP through UAE Pass (portal assumption A-05). */
  readonly source?: 'ICP' | 'IDAM' | null;
}

export interface ApplicationSection {
  readonly applicationId: string;
  readonly sectionKey: ApplicationSectionKey;
  readonly schemaVersion: string;
  readonly values: SectionValues;
  readonly fields: readonly SectionFieldState[];
  readonly editable: boolean;
  readonly version: number;
}

export interface ApplicationSectionInput {
  readonly schemaVersion: string;
  readonly values: SectionValues;
}

export interface AttachmentMetadata {
  readonly attachmentId: string;
  readonly version: number;
  readonly fileName: string;
  readonly mediaType: string;
  readonly sizeBytes: number;
  readonly uploadedAt: string;
}

export interface AttachmentSlot {
  readonly slotId: string;
  readonly sectionKey: AttachmentSectionKey;
  readonly documentTypeCode: string;
  readonly label: string;
  readonly required: boolean;
  readonly editable: boolean;
  readonly allowedMediaTypes: readonly string[];
  readonly maxFileSizeBytes: number;
  readonly specialtyId?: string | null;
  readonly trainingSiteId?: string | null;
  readonly portfolioQuestionId?: string | null;
  readonly attachment: AttachmentMetadata | null;
}

export type PortfolioAnswerValue = 'YES' | 'NO';

export interface PortfolioAnswer {
  readonly questionId: string;
  readonly answer: PortfolioAnswerValue;
  readonly details?: Readonly<Record<string, string>>;
  readonly evidenceIds?: readonly string[];
}

export interface PortfolioSubmission {
  readonly submittedAt: string | null;
  readonly immutable: boolean;
  readonly answers: readonly PortfolioAnswer[];
}

export interface PortfolioSubmissionInput {
  readonly answers: readonly PortfolioAnswer[];
  readonly confirmed: true;
}

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'UNKNOWN';

export interface PaymentSession {
  readonly id: string;
  readonly applicationId: string;
  readonly amount: number;
  readonly currency: 'AED';
  readonly status: PaymentStatus;
  readonly checkoutUrl?: string | null;
  readonly checkoutExpiresAt?: string | null;
  readonly receiptId?: string | null;
  readonly paymentDate?: string | null;
}

export interface SubmitApplicationRequest {
  readonly paymentSessionId: string;
  readonly confirmed: true;
}

export type WorkflowStatus = string;

export interface WorkflowActionResult {
  readonly resourceId: string;
  readonly status: WorkflowStatus;
  readonly effectiveAt: string;
  readonly auditEventId: string;
  readonly messageCode?: string | null;
}

export type OtpChannel = 'EMAIL' | 'SMS';

export interface OtpDestination {
  readonly channel: OtpChannel;
  readonly maskedValue: string;
}

export interface WithdrawalRequestInput {
  readonly reasonCode: string;
  readonly otherReason?: string;
}

export interface WithdrawalChallenge {
  readonly requestId: string;
  readonly expiresAt: string;
  readonly resendAvailableAt: string;
  readonly destinations: readonly OtpDestination[];
}

export interface OtpChallenge {
  readonly expiresAt: string;
  readonly resendAvailableAt: string;
  readonly destinations: readonly OtpDestination[];
}

export interface OtpConfirmation {
  readonly otp: string;
}

export interface ReinstatementRequestInput {
  readonly justification: string;
}

export interface SiteExclusionInput {
  readonly siteIds: readonly string[];
  readonly reason: string;
}

export interface ContactVerificationInput {
  readonly channel: OtpChannel;
  readonly value: string;
}

export interface ContactVerification {
  readonly verificationId: string;
  readonly channel: OtpChannel;
  readonly destination: OtpDestination;
  readonly expiresAt: string;
  readonly resendAvailableAt: string;
}

export interface ContactVerificationResult {
  readonly verifiedAt: string;
  readonly validUntil: string;
}

export type PortfolioAppealStatus = 'OPEN' | 'SUBMITTED' | 'CLOSED' | 'NOT_AVAILABLE';

export interface PortfolioResultQuestion {
  readonly questionId: string;
  readonly prompt: string;
  readonly candidateAnswer: PortfolioAnswerValue;
  readonly details?: Readonly<Record<string, string>>;
  readonly evidence: readonly AttachmentMetadata[];
  readonly maxPoints: number;
  readonly awardedPoints: number;
  readonly comments: readonly string[];
  readonly appealable: boolean;
  readonly appealResponse?: string | null;
}

export interface CandidatePortfolioResult {
  readonly applicationId: string;
  readonly applicationNumber: string;
  readonly announcedAt: string;
  readonly finalPortfolioPoints: number;
  readonly portfolioScore: number;
  readonly appeal: {
    readonly status: PortfolioAppealStatus;
    readonly deadline?: string | null;
    readonly submittedAt?: string | null;
    readonly timeZoneId?: string | null;
  };
  readonly questions: readonly PortfolioResultQuestion[];
}

export interface PortfolioAppealInput {
  readonly responses: readonly { readonly questionId: string; readonly response: string }[];
  readonly confirmed: true;
}

export interface LookupItem {
  readonly code: string;
  readonly label: string;
  /** The code this value belongs to, for example the portfolio question of a rejection reason. */
  readonly parentCode?: string | null;
  /** Candidate-facing comment mapped to a portfolio rejection reason. */
  readonly candidateComment?: string | null;
  /** Points of a portfolio classification. */
  readonly points?: number | null;
  readonly sortOrder: number;
  readonly active: boolean;
}

/**
 * PROPOSAL (PQ-04): what the candidate may correct after an officer returned the application
 * (US-2.3.4). The contract has no candidate read of the flags yet; the mock serves
 * GET /applications/{applicationId}/correction-flags.
 */
export interface CandidateCorrections {
  readonly flags: readonly CorrectionFlag[];
  /** End of the correction grace period, with offset (D-07). */
  readonly correctionDeadline: string;
}

/** POST /applications/{applicationId}/corrections: values of the flagged sections only. */
export interface SubmitCorrectionsRequest {
  readonly sections: Readonly<Partial<Record<ApplicationSectionKey, ApplicationSectionInput>>>;
}
