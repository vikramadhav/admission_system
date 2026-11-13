// Hand-written from the contract schemas of the Portfolio Scoring tag (OQ-08). Fields marked
// PROPOSAL are not in the contract yet (PQ-36): the mock returns them, and the portal degrades
// without them.

import { PortfolioStatus, RefereeWorkloadRow } from './admission.models';
import { AttachmentMetadata } from './candidate-lifecycle.models';

export type PortfolioRoundStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETE' | 'ON_HOLD';

export type ScoringRound = 'ROUND_1' | 'ROUND_2' | 'ROUND_3' | 'SECOND_EVALUATION';

/** Anonymised inbox row: candidate name and identity are never returned. */
export interface RefereeInboxItem {
  readonly portfolioId: string;
  readonly applicationId: string;
  readonly applicationNumber: string;
  readonly programName: string;
  readonly round: ScoringRound;
  readonly roundStatus?: PortfolioRoundStatus;
  readonly portfolioStatus: PortfolioStatus;
  readonly retrievedAt?: string | null;
  readonly dueAt?: string | null;
  readonly overdue?: boolean;
}

/** PROPOSAL (PQ-03): a pool the referee can retrieve from. */
export interface RefereePool {
  readonly poolId: string;
  readonly programName: string;
  readonly specialtyName: string;
  /** Standard (Round 1 and 2), discrepancy (Round 3) or appeal (2nd evaluation). */
  readonly kind: 'STANDARD' | 'DISCREPANCY' | 'APPEAL';
  readonly waiting: number;
}

export interface RefereeDashboard {
  readonly queueInsights: {
    readonly portfoliosInPool: number;
    readonly pendingMyAction: number;
    readonly complete: number;
    readonly returnedForCoi: number;
  };
  readonly items: readonly RefereeInboxItem[];
  readonly page: { readonly limit: number; readonly nextCursor: string | null };
  readonly generatedAt: string;
  /** PROPOSAL (PQ-03). */
  readonly pools?: readonly RefereePool[];
}

export interface SeniorRefereeDashboard {
  readonly poolInsights: {
    readonly pendingScoring: number;
    readonly firstRoundInProgress: number;
    readonly secondRoundInProgress: number;
    readonly resolvingDiscrepancy: number;
    readonly rescoringAppealed: number;
    readonly complete: number;
  };
  readonly refereesWorkload: readonly RefereeWorkloadRow[];
  readonly generatedAt: string;
}

export type ScoringType = 'ALL_OR_NOTHING' | 'POINTS';

export interface PortfolioQuestion {
  readonly questionId: string;
  readonly prompt: string;
  /** The candidate's YES / NO answer. */
  readonly candidateAnswer: string;
  /** Answer details (link, journal, title, dates, role, ...) keyed by field code. */
  readonly details?: Readonly<Record<string, unknown>>;
  readonly evidence: readonly AttachmentMetadata[];
  readonly priorRoundData?: Readonly<Record<string, unknown>> | null;
  /** PROPOSAL (PQ-36): how the question is scored and its maximum points. */
  readonly scoringType?: ScoringType;
  readonly maxPoints?: number;
  /** PROPOSAL (PQ-36): 2nd evaluation only: the candidate flagged this question in the appeal. */
  readonly appealed?: boolean;
  /** PROPOSAL (PQ-36): 2nd evaluation only: the candidate's appeal response. */
  readonly appealResponse?: string | null;
}

/** PROPOSAL (PQ-36): what the referee needs around the questions (US-3.3.1 key information). */
export interface PortfolioScoringContext {
  readonly applicationNumber: string;
  readonly submittedAt: string;
  readonly programName: string;
  /** Program-specific key facts: graduation year, internship completion, residency dates, specialties. */
  readonly keyFacts: readonly { readonly label: string; readonly value: string }[];
  readonly dueAt?: string | null;
  /** The referee's saved draft for this round, null when nothing is saved yet. */
  readonly savedScores: ScoreSet | null;
  readonly totalPossiblePoints: number;
}

export interface PortfolioReview {
  readonly portfolioId: string;
  readonly round: ScoringRound;
  readonly rubricVersion: string;
  readonly questions: readonly PortfolioQuestion[];
  /** PROPOSAL (PQ-36). */
  readonly context?: PortfolioScoringContext;
}

export interface SeniorPortfolioReview extends PortfolioReview {
  readonly roundSummaries: readonly {
    readonly round: ScoringRound;
    readonly status: PortfolioRoundStatus;
    readonly refereeId?: string;
    /** PROPOSAL (PQ-36): the referee's name for the oversight view. */
    readonly refereeName?: string | null;
    readonly totalPoints?: number | null;
    readonly submittedAt?: string | null;
  }[];
  readonly discrepancies?: readonly { readonly questionId: string; readonly round1Result?: string; readonly round2Result?: string }[];
  /** PROPOSAL (PQ-36): portfolio status, final and weighted score, and the referee holding it now. */
  readonly oversight?: {
    readonly portfolioStatus: PortfolioStatus;
    readonly finalPortfolioPoints?: number | null;
    readonly weightedPortfolioScore?: number | null;
    readonly currentRefereeId?: string | null;
    readonly currentRound?: ScoringRound | null;
  };
}

export interface ScoreInput {
  readonly questionId: string;
  readonly decision: 'ACCEPT' | 'REJECT';
  /** Required for ACCEPT on points-system questions (lookup PORTFOLIO_CLASSIFICATION). */
  readonly classificationCode?: string | null;
  /** One or more, required for REJECT (lookup PORTFOLIO_REJECTION_REASON). */
  readonly rejectionReasonCodes?: readonly string[];
  /** Computed by the service. */
  readonly questionScore?: number | null;
}

export interface ScoreSet {
  readonly rubricVersion: string;
  readonly scores: readonly ScoreInput[];
  /** Computed by the service. */
  readonly totalPoints?: number | null;
}

export interface PortfolioScoringResult {
  readonly portfolioId: string;
  readonly roundStatus: PortfolioRoundStatus;
  readonly portfolioStatus: PortfolioStatus;
  readonly discrepancy?: boolean;
  readonly discrepancyDetails?: readonly { readonly questionId: string; readonly round1Result: string; readonly round2Result: string }[];
  readonly finalPortfolioPoints?: number | null;
  readonly weightedPortfolioScore?: number | null;
  readonly auditEventId: string;
}

export interface ScoreOverrideRequest {
  readonly round: ScoringRound;
  /** New round total, at most the question set total ("X out of Y"). */
  readonly newTotalPoints: number;
  /** Up to 200 characters. */
  readonly justification: string;
  readonly confirmed: true;
}

/** Sort keys allowed by the referee dashboard and the senior referee's view of a referee's inbox. */
export type RefereeInboxSort = 'dueAt' | 'retrievedAt' | 'applicationId' | 'round' | 'portfolioStatus';
