import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { AdmissionApiService } from '../../../api/admission-api.service';
import { ScoringApiService } from '../../../api/scoring-api.service';
import { PortfolioQuestion, PortfolioReview, PortfolioScoringResult, ScoreSet } from '../../../api/scoring.models';
import { isApiProblemError } from '../../../core/api/api-problem-error';
import { callerHandlesProblems } from '../../../core/api/api-request';
import { ApiProblemDetails } from '../../../core/api/api.models';
import {
  EMPTY_DECISION,
  QuestionDecision,
  ScoringLookupItem,
  applyQ1Default,
  estimatedScore,
  fromScoreInput,
  questionProblem,
  sameDecision,
  toScoreInput,
} from './scoring-rules';

export type SaveOutcome = 'saved' | 'stale' | 'failed';

/**
 * State of the referee's scoring page (US-3.3.1 to US-3.3.4): the anonymised portfolio, the
 * referee's decisions per question, the last saved scores with their ETag (If-Match), the scoring
 * lookups, and the save, submit and conflict-of-interest actions. Provided by the page.
 */
@Injectable()
export class PortfolioScoringFacade {
  private readonly api = inject(ScoringApiService);
  private readonly lookups = inject(AdmissionApiService);

  private readonly portfolioState = signal<PortfolioReview | null>(null);
  private readonly decisionsState = signal<ReadonlyMap<string, QuestionDecision>>(new Map());
  private readonly savedState = signal<ReadonlyMap<string, QuestionDecision>>(new Map());
  private readonly savedScoresState = signal<ScoreSet | null>(null);
  private readonly loadProblemState = signal<ApiProblemDetails | null>(null);
  private readonly loadingState = signal<boolean>(true);
  private etag: string | null = null;

  readonly portfolio = this.portfolioState.asReadonly();
  readonly decisions = this.decisionsState.asReadonly();
  readonly loadProblem = this.loadProblemState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly classifications = signal<readonly ScoringLookupItem[]>([]);
  readonly rejectionReasons = signal<readonly ScoringLookupItem[]>([]);
  /** True once a save was refused because the scores changed elsewhere (412). */
  readonly stale = signal<boolean>(false);

  readonly questions = computed<readonly PortfolioQuestion[]>(() => this.portfolioState()?.questions ?? []);
  readonly dirty = computed<boolean>(() => {
    const saved = this.savedState();

    return [...this.decisionsState()].some(([id, value]) => !sameDecision(value, saved.get(id) ?? EMPTY_DECISION));
  });
  readonly incompleteQuestionIds = computed<readonly string[]>(() =>
    this.questions()
      .filter(question => questionProblem(question, this.decision(question.questionId)) !== null)
      .map(question => question.questionId),
  );
  readonly totalPossible = computed<number>(
    () => this.portfolioState()?.context?.totalPossiblePoints ?? this.questions().reduce((sum, question) => sum + (question.maxPoints ?? 0), 0),
  );
  /** The service's total after the last save, while nothing changed since; otherwise the client estimate. */
  readonly total = computed<{ readonly points: number; readonly estimate: boolean }>(() => {
    const saved = this.savedScoresState();

    if (!this.dirty() && saved?.totalPoints !== null && saved?.totalPoints !== undefined) {
      return { points: saved.totalPoints, estimate: false };
    }

    const points = this.questions().reduce((sum, question) => sum + (this.score(question).points ?? 0), 0);

    return { points, estimate: true };
  });

  async load(portfolioId: string): Promise<void> {
    this.loadingState.set(true);
    this.loadProblemState.set(null);
    this.stale.set(false);

    try {
      const [result, classifications, reasons] = await Promise.all([
        firstValueFrom(this.api.getPortfolio(portfolioId, callerHandlesProblems())),
        firstValueFrom(this.lookups.listLookup('PORTFOLIO_CLASSIFICATION')).catch(() => null),
        firstValueFrom(this.lookups.listLookup('PORTFOLIO_REJECTION_REASON')).catch(() => null),
      ]);
      this.classifications.set(classifications?.data ?? []);
      this.rejectionReasons.set(reasons?.data ?? []);
      this.etag = result.etag;
      this.portfolioState.set(result.data);
      this.adoptSaved(result.data.context?.savedScores ?? null, result.data.questions);
    } catch (error: unknown) {
      this.loadProblemState.set(isApiProblemError(error) ? error.problem : null);

      if (!isApiProblemError(error)) {
        throw error;
      }
    } finally {
      this.loadingState.set(false);
    }
  }

  decision(questionId: string): QuestionDecision {
    return this.decisionsState().get(questionId) ?? EMPTY_DECISION;
  }

  setDecision(questionId: string, value: QuestionDecision): void {
    const next = new Map(this.decisionsState());
    next.set(questionId, value);
    const defaulted = applyQ1Default(questionId, value, this.decisionsState());

    if (defaulted !== null) {
      next.set(defaulted, { ...EMPTY_DECISION, decision: 'ACCEPT' });
    }

    this.decisionsState.set(next);
  }

  /** The question's score: the service's value from the last save while unchanged, else an estimate. */
  score(question: PortfolioQuestion): { readonly points: number | null; readonly estimate: boolean } {
    const value = this.decision(question.questionId);
    const saved = this.savedScoresState()?.scores.find(score => score.questionId === question.questionId);

    if (saved && sameDecision(value, this.savedState().get(question.questionId) ?? EMPTY_DECISION) && saved.questionScore !== null && saved.questionScore !== undefined) {
      return { points: saved.questionScore, estimate: false };
    }

    return { points: estimatedScore(question, value, this.classifications()), estimate: true };
  }

  classificationsFor(questionId: string): readonly ScoringLookupItem[] {
    return this.classifications().filter(item => item.parentCode === questionId && item.active);
  }

  reasonsFor(questionId: string): readonly ScoringLookupItem[] {
    return this.rejectionReasons().filter(item => item.parentCode === questionId && item.active);
  }

  /**
   * Saves the complete decisions with If-Match (US-3.3.3 "Save draft"). Incomplete questions stay
   * on the page only; the result says how many were left out.
   */
  async save(): Promise<{ readonly outcome: SaveOutcome; readonly skipped: number; readonly problem: string }> {
    const portfolio = this.portfolioState();

    if (!portfolio || this.etag === null) {
      return { outcome: 'failed', skipped: 0, problem: '' };
    }

    const complete = portfolio.questions.filter(question => questionProblem(question, this.decision(question.questionId)) === null);
    const scores: ScoreSet = {
      rubricVersion: portfolio.rubricVersion,
      scores: complete.map(question => toScoreInput(question.questionId, this.decision(question.questionId))),
    };

    try {
      const result = await firstValueFrom(this.api.saveScores(portfolio.portfolioId, scores, this.etag, callerHandlesProblems()));
      this.etag = result.etag ?? this.etag;
      const skipped = portfolio.questions.filter(question => this.decision(question.questionId).decision !== '').length - complete.length;
      this.savedScoresState.set(result.data);
      const saved = new Map(this.savedState());

      for (const question of complete) {
        saved.set(question.questionId, this.decision(question.questionId));
      }

      this.savedState.set(saved);

      return { outcome: 'saved', skipped, problem: '' };
    } catch (error: unknown) {
      if (isApiProblemError(error) && (error.problem.status === 412 || error.problem.status === 428)) {
        this.stale.set(true);

        return { outcome: 'stale', skipped: 0, problem: error.problem.detail ?? error.problem.title };
      }

      return { outcome: 'failed', skipped: 0, problem: problemText(error) };
    }
  }

  /** Completes the round (US-3.3.4); the service decides discrepancy, third referee or final score. */
  async submit(idempotencyKey: string): Promise<PortfolioScoringResult> {
    const portfolio = this.portfolioState();

    if (!portfolio) {
      throw new Error('No portfolio loaded.');
    }

    const result = await firstValueFrom(this.api.submitRound(portfolio.portfolioId, idempotencyKey, callerHandlesProblems()));
    this.savedState.set(new Map(this.decisionsState()));

    return result.data;
  }

  /** Returns the portfolio for conflict of interest (US-3.3.2); saved answers are discarded. */
  async declareConflict(reason: string): Promise<void> {
    const portfolio = this.portfolioState();

    if (!portfolio) {
      return;
    }

    await firstValueFrom(this.api.declareConflictOfInterest(portfolio.portfolioId, reason, callerHandlesProblems()));
    this.savedState.set(new Map(this.decisionsState()));
  }

  /** Drops unsaved changes, for example before leaving after a confirmed discard. */
  discardChanges(): void {
    this.decisionsState.set(new Map(this.savedState()));
  }

  private adoptSaved(saved: ScoreSet | null, questions: readonly PortfolioQuestion[]): void {
    const decisions = new Map<string, QuestionDecision>();

    for (const question of questions) {
      const score = saved?.scores.find(item => item.questionId === question.questionId);
      decisions.set(question.questionId, score ? fromScoreInput(score) : EMPTY_DECISION);
    }

    this.savedScoresState.set(saved);
    this.savedState.set(new Map(decisions));
    this.decisionsState.set(decisions);
  }
}

export function problemText(error: unknown): string {
  if (isApiProblemError(error)) {
    return error.problem.detail ?? error.problem.title;
  }

  return $localize`:@@portal.problem.unexpected:Something went wrong. Please try again later.`;
}
