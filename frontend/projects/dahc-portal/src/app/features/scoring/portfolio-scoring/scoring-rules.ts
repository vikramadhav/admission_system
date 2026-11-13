import { LookupItem } from '../../../api/candidate-lifecycle.models';
import { PortfolioQuestion, ScoreInput } from '../../../api/scoring.models';

/**
 * Pure scoring rules of the referee's scoring page (US-3.3.3, US-3.3.4). The service computes
 * the authoritative question scores and total; the page only shows an estimate until a save.
 */

/** A lookup value as the scoring lookups return it (PORTFOLIO_CLASSIFICATION has points, rejection reasons a comment). */
/** A classification or rejection reason; `points` and `candidateComment` are part of LookupItem. */
export type ScoringLookupItem = LookupItem;

/** The referee's current, possibly incomplete, decision on one question. */
export interface QuestionDecision {
  readonly decision: '' | 'ACCEPT' | 'REJECT';
  readonly classificationCode: string;
  readonly rejectionReasonCodes: readonly string[];
}

export type QuestionProblem = 'NO_DECISION' | 'NO_CLASSIFICATION' | 'NO_REASON';

export const EMPTY_DECISION: QuestionDecision = { decision: '', classificationCode: '', rejectionReasonCodes: [] };

/** What still blocks this question, or null when it is complete. */
export function questionProblem(question: PortfolioQuestion, value: QuestionDecision): QuestionProblem | null {
  if (value.decision === '') {
    return 'NO_DECISION';
  }

  if (value.decision === 'ACCEPT' && question.scoringType === 'POINTS' && value.classificationCode === '') {
    return 'NO_CLASSIFICATION';
  }

  if (value.decision === 'REJECT' && value.rejectionReasonCodes.length === 0) {
    return 'NO_REASON';
  }

  return null;
}

/** Client estimate of a question score: full points on Accept, classification points on the points system, 0 on Reject. */
export function estimatedScore(question: PortfolioQuestion, value: QuestionDecision, classifications: readonly ScoringLookupItem[]): number | null {
  if (questionProblem(question, value) !== null) {
    return null;
  }

  if (value.decision === 'REJECT') {
    return 0;
  }

  if (question.scoringType === 'POINTS') {
    return classifications.find(item => item.code === value.classificationCode)?.points ?? null;
  }

  return question.maxPoints ?? null;
}

/** Turns a complete decision into the API's ScoreInput; incomplete decisions are not sent. */
export function toScoreInput(questionId: string, value: QuestionDecision): ScoreInput {
  return value.decision === 'ACCEPT'
    ? { questionId, decision: 'ACCEPT', classificationCode: value.classificationCode === '' ? null : value.classificationCode, rejectionReasonCodes: [] }
    : { questionId, decision: 'REJECT', classificationCode: null, rejectionReasonCodes: [...value.rejectionReasonCodes] };
}

export function fromScoreInput(score: ScoreInput): QuestionDecision {
  return {
    decision: score.decision,
    classificationCode: score.classificationCode ?? '',
    rejectionReasonCodes: [...(score.rejectionReasonCodes ?? [])],
  };
}

export function sameDecision(first: QuestionDecision, second: QuestionDecision): boolean {
  return (
    first.decision === second.decision &&
    first.classificationCode === second.classificationCode &&
    first.rejectionReasonCodes.length === second.rejectionReasonCodes.length &&
    first.rejectionReasonCodes.every(code => second.rejectionReasonCodes.includes(code))
  );
}

/**
 * US-3.3.3 special case (Internship and Residency): when Q1 is accepted, Q2 is accepted by
 * default. Applies only while Q2 has no decision yet, so the referee can still change it.
 * Fellowship questions have other ids (FEL-Q1...), so the rule never applies to them.
 */
export function applyQ1Default(questionId: string, value: QuestionDecision, current: ReadonlyMap<string, QuestionDecision>): string | null {
  if (questionId !== 'Q1' || value.decision !== 'ACCEPT' || !current.has('Q2')) {
    return null;
  }

  return current.get('Q2')?.decision === '' ? 'Q2' : null;
}
