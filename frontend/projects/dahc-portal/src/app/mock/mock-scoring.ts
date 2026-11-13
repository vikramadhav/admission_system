import { PortfolioStatus, RefereeWorkloadRow } from '../api/admission.models';
import {
  PortfolioQuestion,
  PortfolioRoundStatus,
  PortfolioScoringResult,
  RefereeDashboard,
  RefereeInboxItem,
  RefereePool,
  ScoreInput,
  ScoreSet,
  ScoringRound,
  SeniorPortfolioReview,
  SeniorRefereeDashboard,
} from '../api/scoring.models';
import { portfolioQuestions } from '../shared/portfolio-questions';
import { MockReply, ok, problem } from './mock-http';
import { MockStaffUser } from './mock-store';

const DAY = 86_400_000;
const RETRIEVE_CAP = 10;
const RUBRIC = 'residency-2026.1';
const WEIGHT = 20;

export interface MockRound {
  round: ScoringRound;
  status: PortfolioRoundStatus;
  refereeId: string | null;
  retrievedAt: string | null;
  dueAt: string | null;
  scores: ScoreInput[];
  version: number;
  totalPoints: number | null;
  submittedAt: string | null;
}

export interface MockPortfolio {
  portfolioId: string;
  applicationId: string;
  applicationNumber: string;
  programName: string;
  specialtyName: string;
  poolId: string;
  submittedAt: string;
  graduationYear: string;
  internshipCompletedOn: string;
  portfolioStatus: PortfolioStatus;
  rounds: MockRound[];
  /** Referees who returned it for conflict of interest: never assigned again (STP-3.2). */
  coiExcluded: string[];
  appealedQuestionIds: string[];
  appealResponses: Record<string, string>;
  finalPoints: number | null;
}

export interface MockScoringState {
  referees: { refereeId: string; name: string; role: 'REFEREE' | 'THIRD_REFEREE' | 'SECOND_EVALUATION_REFEREE' }[];
  portfolios: MockPortfolio[];
  coiReturns: Record<string, number>;
}

interface QuestionMeta {
  readonly questionId: string;
  readonly prompt: string;
  readonly scoringType: 'ALL_OR_NOTHING' | 'POINTS';
  readonly maxPoints: number;
}

/** Residency question set (BRD US-1.3.10): Q3 and Q8 use the points system. */
const QUESTIONS: readonly QuestionMeta[] = portfolioQuestions('residency').map(question => ({
  questionId: question.id,
  prompt: question.prompt,
  scoringType: question.number === 3 || question.number === 8 ? 'POINTS' : 'ALL_OR_NOTHING',
  maxPoints: question.number === 3 ? 4 : question.number === 8 ? 6 : question.number >= 9 ? 2 : 5,
}));

const TOTAL_POSSIBLE = QUESTIONS.reduce((sum, question) => sum + question.maxPoints, 0);

/** Lookups PORTFOLIO_CLASSIFICATION and PORTFOLIO_REJECTION_REASON, scoped to a question with parentCode. */
export function scoringLookup(type: string): MockReply | null {
  if (type === 'PORTFOLIO_CLASSIFICATION') {
    const items = QUESTIONS.filter(question => question.scoringType === 'POINTS').flatMap(question =>
      question.maxPoints === 4
        ? [
            { code: `${question.questionId}-ORAL`, label: 'Oral presentation', points: 4 },
            { code: `${question.questionId}-POSTER`, label: 'Poster, workshop or other', points: 3 },
          ]
        : [
            { code: `${question.questionId}-DEANS`, label: "Dean's List or graduation honours", points: 6 },
            { code: `${question.questionId}-HONOURS`, label: 'Competitive prize', points: 5 },
            { code: `${question.questionId}-OTHER`, label: 'Other award', points: 4 },
          ].map(item => ({ ...item, parentCode: question.questionId })),
    );

    return ok(items.map((item, index) => ({ parentCode: QUESTIONS.find(question => item.code.startsWith(question.questionId))?.questionId ?? null, ...item, sortOrder: index + 1, active: true, candidateComment: null })));
  }

  if (type === 'PORTFOLIO_REJECTION_REASON') {
    const reasons = [
      { code: 'EVIDENCE_MISSING', label: 'Evidence missing or unreadable', comment: 'The evidence for this item was missing or could not be read.' },
      { code: 'NOT_ELIGIBLE', label: 'Activity does not meet the criteria', comment: 'This activity does not meet the published criteria for this question.' },
      { code: 'OUTSIDE_PERIOD', label: 'Outside the eligible period', comment: 'The activity falls outside the eligible period.' },
    ];

    return ok(
      QUESTIONS.flatMap(question =>
        reasons.map((reason, index) => ({
          code: `${question.questionId}-${reason.code}`,
          label: reason.label,
          parentCode: question.questionId,
          candidateComment: reason.comment,
          points: null,
          sortOrder: index + 1,
          active: true,
        })),
      ),
    );
  }

  return null;
}

function iso(offsetDays: number): string {
  return new Date(Date.now() + offsetDays * DAY).toISOString();
}

function round(name: ScoringRound, status: PortfolioRoundStatus, refereeId: string | null, retrievedDaysAgo: number | null, total: number | null = null): MockRound {
  return {
    round: name,
    status,
    refereeId,
    retrievedAt: retrievedDaysAgo === null ? null : iso(-retrievedDaysAgo),
    dueAt: retrievedDaysAgo === null ? null : iso(-retrievedDaysAgo + 2),
    scores: total === null ? [] : QUESTIONS.map(question => ({ questionId: question.questionId, decision: 'ACCEPT', classificationCode: null, rejectionReasonCodes: [], questionScore: question.maxPoints })),
    version: 1,
    totalPoints: total,
    submittedAt: status === 'COMPLETE' ? iso(-(retrievedDaysAgo ?? 3) + 1) : null,
  };
}

function portfolio(index: number, status: PortfolioStatus, rounds: MockRound[], extra: Partial<MockPortfolio> = {}): MockPortfolio {
  const pool = extra.poolId ?? 'rpool-res-im';

  return {
    portfolioId: `pf-${String(index).padStart(4, '0')}`,
    applicationId: `rv-pf-${index}`,
    applicationNumber: `2026${String(5000 + index * 41).padStart(7, '0')}`,
    programName: 'Medical Residency',
    specialtyName: 'Internal Medicine',
    poolId: pool,
    submittedAt: iso(-25 + index),
    graduationYear: String(2019 + (index % 5)),
    internshipCompletedOn: `202${3 + (index % 2)}-06-30`,
    portfolioStatus: status,
    rounds,
    coiExcluded: [],
    appealedQuestionIds: [],
    appealResponses: {},
    finalPoints: null,
    ...extra,
  };
}

export function seedScoring(): MockScoringState {
  const q = QUESTIONS.map(question => question.questionId);

  return {
    referees: [
      { refereeId: 'referee', name: 'Dr. Layla Nasser', role: 'REFEREE' },
      { refereeId: 'referee-2', name: 'Dr. Omar Barakat', role: 'REFEREE' },
      { refereeId: 'referee-3', name: 'Dr. Hind Al Mulla', role: 'REFEREE' },
      { refereeId: 'third-referee', name: 'Dr. Ahmed Saleh', role: 'THIRD_REFEREE' },
      { refereeId: 'second-evaluation-referee', name: 'Dr. Mariam Qasim', role: 'SECOND_EVALUATION_REFEREE' },
    ],
    coiReturns: { 'referee-2': 1 },
    portfolios: [
      // Waiting in the standard pool.
      portfolio(1, 'PENDING', [round('ROUND_1', 'PENDING', null, null), round('ROUND_2', 'PENDING', null, null)]),
      portfolio(2, 'PENDING', [round('ROUND_1', 'PENDING', null, null), round('ROUND_2', 'PENDING', null, null)]),
      portfolio(3, 'IN_PROGRESS', [round('ROUND_1', 'COMPLETE', 'referee-2', 4, 38), round('ROUND_2', 'PENDING', null, null)]),
      // Dr. Layla Nasser's inbox.
      portfolio(4, 'IN_PROGRESS', [round('ROUND_1', 'IN_PROGRESS', 'referee', 1), round('ROUND_2', 'PENDING', null, null)]),
      portfolio(5, 'IN_PROGRESS', [round('ROUND_1', 'COMPLETE', 'referee-3', 5, 30), round('ROUND_2', 'IN_PROGRESS', 'referee', 1)]),
      portfolio(6, 'IN_PROGRESS', [round('ROUND_1', 'IN_PROGRESS', 'referee', 3), round('ROUND_2', 'PENDING', null, null)]),
      portfolio(7, 'COMPLETE', [round('ROUND_1', 'COMPLETE', 'referee', 9, 36), round('ROUND_2', 'COMPLETE', 'referee-2', 8, 36)], { finalPoints: 36 }),
      // Another referee's inbox (for reassignment).
      portfolio(8, 'IN_PROGRESS', [round('ROUND_1', 'IN_PROGRESS', 'referee-2', 1), round('ROUND_2', 'PENDING', null, null)]),
      // Discrepancy pool and Round 3.
      portfolio(9, 'THIRD_REFEREE_REQUIRED', [round('ROUND_1', 'COMPLETE', 'referee', 7, 40), round('ROUND_2', 'COMPLETE', 'referee-3', 6, 31), round('ROUND_3', 'PENDING', null, null)], { poolId: 'rpool-discrepancy' }),
      portfolio(10, 'THIRD_ROUND_IN_PROGRESS', [round('ROUND_1', 'COMPLETE', 'referee-2', 8, 28), round('ROUND_2', 'COMPLETE', 'referee-3', 7, 35), round('ROUND_3', 'IN_PROGRESS', 'third-referee', 1)], { poolId: 'rpool-discrepancy' }),
      // Appeal pool and 2nd evaluation.
      portfolio(11, 'SECOND_EVALUATION_REQUIRED', [round('ROUND_1', 'COMPLETE', 'referee', 12, 33), round('ROUND_2', 'COMPLETE', 'referee-2', 11, 33), round('SECOND_EVALUATION', 'PENDING', null, null)], {
        poolId: 'rpool-appeal',
        finalPoints: 33,
        appealedQuestionIds: [q[0] ?? '', q[3] ?? ''],
        appealResponses: { [q[0] ?? '']: 'The article was accepted before the deadline; the acceptance letter is attached.', [q[3] ?? '']: 'The campaign certificate shows the dates on page 2.' },
      }),
      portfolio(12, 'SECOND_EVALUATION_IN_PROGRESS', [round('ROUND_1', 'COMPLETE', 'referee-3', 14, 29), round('ROUND_2', 'COMPLETE', 'referee-2', 13, 29), round('SECOND_EVALUATION', 'IN_PROGRESS', 'second-evaluation-referee', 1)], {
        poolId: 'rpool-appeal',
        finalPoints: 29,
        appealedQuestionIds: [q[1] ?? ''],
        appealResponses: { [q[1] ?? '']: 'My supervisor letter confirms the research role.' },
      }),
    ],
  };
}

const POOLS: readonly (RefereePool & { readonly roles: readonly string[] })[] = [
  { poolId: 'rpool-res-im', programName: 'Medical Residency', specialtyName: 'Internal Medicine', kind: 'STANDARD', waiting: 0, roles: ['REFEREE'] },
  { poolId: 'rpool-discrepancy', programName: 'Medical Residency', specialtyName: 'Internal Medicine', kind: 'DISCREPANCY', waiting: 0, roles: ['THIRD_REFEREE'] },
  { poolId: 'rpool-appeal', programName: 'Medical Residency', specialtyName: 'Internal Medicine', kind: 'APPEAL', waiting: 0, roles: ['SECOND_EVALUATION_REFEREE'] },
];

/** Round a referee role works on, by pool kind. */
const ROLE_ROUNDS: Readonly<Record<string, readonly ScoringRound[]>> = {
  REFEREE: ['ROUND_1', 'ROUND_2'],
  THIRD_REFEREE: ['ROUND_3'],
  SECOND_EVALUATION_REFEREE: ['SECOND_EVALUATION'],
};

/**
 * Mock of the Portfolio Scoring operations. Candidate identity is never part of any response.
 * Fields marked PROPOSAL in api/scoring.models.ts (pools, scoring context, question meta,
 * oversight block) are added as documented there.
 */
export class MockScoring {
  constructor(
    private readonly state: () => MockScoringState,
    private readonly save: () => void,
    private readonly user: () => MockStaffUser | null,
  ) {}

  handle(method: string, fullPath: string, body: unknown, headers: { get(name: string): string | null }): MockReply | null {
    const [path = '', queryString = ''] = fullPath.split('?');
    const query = new URLSearchParams(queryString);
    let m: RegExpMatchArray | null;

    if (method === 'GET' && path === '/referee/dashboard') {
      return ok(this.refereeDashboard(query));
    }

    if (method === 'POST' && (m = path.match(/^\/referee\/pools\/([^/]+)\/portfolio-retrievals$/))) {
      return this.retrieve(decodeURIComponent(m[1] ?? ''));
    }

    if ((m = path.match(/^\/referee\/portfolios\/([^/]+)(\/.*)?$/))) {
      return this.refereePortfolio(method, decodeURIComponent(m[1] ?? ''), m[2] ?? '', body, headers);
    }

    if (method === 'GET' && path === '/senior-referee/dashboard') {
      return ok(this.seniorDashboard());
    }

    if (method === 'GET' && (m = path.match(/^\/senior-referee\/referees\/([^/]+)\/portfolios$/))) {
      this.requireRole('SENIOR_REFEREE');
      const refereeId = decodeURIComponent(m[1] ?? '');

      return ok(this.state().portfolios.flatMap(item => this.inboxItems(item, refereeId)));
    }

    if ((m = path.match(/^\/senior-referee\/portfolios\/([^/]+)(\/.*)?$/))) {
      return this.seniorPortfolio(method, decodeURIComponent(m[1] ?? ''), m[2] ?? '', body);
    }

    return null;
  }

  // Referee.

  private refereeDashboard(query: URLSearchParams): RefereeDashboard {
    const user = this.requireRole('REFEREE', 'THIRD_REFEREE', 'SECOND_EVALUATION_REFEREE');
    const refereeId = this.refereeId(user);
    const rounds = ROLE_ROUNDS[user.activeRole] ?? [];
    const items = this.state()
      .portfolios.flatMap(item => this.inboxItems(item, refereeId))
      .filter(item => rounds.includes(item.round))
      .filter(item => !query.get('round') || item.round === query.get('round'))
      .filter(item => !query.get('q') || item.applicationNumber.includes(query.get('q') ?? ''))
      .sort((first, second) => (first.dueAt ?? '').localeCompare(second.dueAt ?? ''));
    const mine = items.filter(item => item.roundStatus === 'IN_PROGRESS');

    return {
      queueInsights: {
        portfoliosInPool: this.waiting(user.activeRole, refereeId),
        pendingMyAction: mine.length,
        complete: items.filter(item => item.roundStatus === 'COMPLETE').length,
        returnedForCoi: this.state().coiReturns[refereeId] ?? 0,
      },
      items,
      page: { limit: 25, nextCursor: null },
      generatedAt: new Date().toISOString(),
      pools: POOLS.filter(pool => pool.roles.includes(user.activeRole)).map(pool => ({
        poolId: pool.poolId,
        programName: pool.programName,
        specialtyName: pool.specialtyName,
        kind: pool.kind,
        waiting: this.waiting(user.activeRole, refereeId),
      })),
    };
  }

  private retrieve(poolId: string): MockReply {
    const user = this.requireRole('REFEREE', 'THIRD_REFEREE', 'SECOND_EVALUATION_REFEREE');
    const refereeId = this.refereeId(user);
    const pool = POOLS.find(item => item.poolId === poolId && item.roles.includes(user.activeRole));

    if (!pool) {
      throw problem(403, 'pool.not_assigned', 'You are not assigned to this pool.');
    }

    const inProgress = this.state().portfolios.flatMap(item => item.rounds).filter(entry => entry.refereeId === refereeId && entry.status === 'IN_PROGRESS').length;

    if (inProgress >= RETRIEVE_CAP) {
      throw problem(409, 'retrieval.limit_reached', `You already have ${RETRIEVE_CAP} portfolios in progress. Submit some before retrieving more.`);
    }

    const picked: RefereeInboxItem[] = [];

    for (const item of this.eligible(user.activeRole, refereeId)) {
      if (picked.length + inProgress >= RETRIEVE_CAP) {
        break;
      }

      const next = this.nextRound(item, user.activeRole);

      if (!next) {
        continue;
      }

      next.status = 'IN_PROGRESS';
      next.refereeId = refereeId;
      next.retrievedAt = new Date().toISOString();
      next.dueAt = new Date(Date.now() + 2 * DAY).toISOString();
      item.portfolioStatus = next.round === 'ROUND_3' ? 'THIRD_ROUND_IN_PROGRESS' : next.round === 'SECOND_EVALUATION' ? 'SECOND_EVALUATION_IN_PROGRESS' : 'IN_PROGRESS';
      picked.push(...this.inboxItems(item, refereeId).filter(entry => entry.round === next.round));
    }

    if (picked.length === 0) {
      return { status: 200, body: { data: [], messageCode: 'pool.empty', message: 'There are no portfolios waiting for you in this pool.' } };
    }

    this.save();

    return ok(picked);
  }

  private refereePortfolio(method: string, portfolioId: string, rest: string, body: unknown, headers: { get(name: string): string | null }): MockReply {
    const user = this.requireRole('REFEREE', 'THIRD_REFEREE', 'SECOND_EVALUATION_REFEREE');
    const refereeId = this.refereeId(user);
    const item = this.state().portfolios.find(entry => entry.portfolioId === portfolioId);
    const assigned = item?.rounds.find(entry => entry.refereeId === refereeId && entry.status === 'IN_PROGRESS');

    if (!item || !assigned) {
      throw problem(404, 'resource.not_found', 'The portfolio was not found or is not assigned to you.');
    }

    if (method === 'GET' && rest === '') {
      return ok(this.review(item, assigned), etag(assigned.version));
    }

    if (method === 'GET' && rest.startsWith('/evidence/')) {
      return ok(null);
    }

    if (method === 'POST' && rest === '/conflict-of-interest') {
      const reason = (body as { reason?: string }).reason ?? '';

      if (reason.trim() === '') {
        throw problem(422, 'request.validation_failed', 'Enter the reason for the conflict of interest.', [{ code: 'required', detail: 'Enter a reason.', pointer: '/reason' }]);
      }

      item.coiExcluded.push(refereeId);
      this.state().coiReturns[refereeId] = (this.state().coiReturns[refereeId] ?? 0) + 1;
      assigned.status = 'PENDING';
      assigned.refereeId = null;
      assigned.retrievedAt = null;
      assigned.dueAt = null;
      assigned.scores = [];
      this.save();

      return ok({ resourceId: item.portfolioId, status: 'PENDING', effectiveAt: new Date().toISOString(), auditEventId: crypto.randomUUID() });
    }

    if (method === 'PUT' && rest === '/scores') {
      const ifMatch = headers.get('If-Match');

      if (!ifMatch) {
        throw problem(428, 'request.precondition_required', 'The If-Match header is required.');
      }

      if (ifMatch !== etag(assigned.version)) {
        throw problem(412, 'request.precondition_failed', 'These scores were changed in another window. Reload to see the latest version.');
      }

      const input = body as ScoreSet;
      assigned.scores = input.scores.map(score => ({ ...score, questionScore: this.questionScore(score) }));
      assigned.totalPoints = assigned.scores.reduce((sum, score) => sum + (score.questionScore ?? 0), 0);
      assigned.version += 1;
      this.save();

      return ok({ rubricVersion: RUBRIC, scores: assigned.scores, totalPoints: assigned.totalPoints }, etag(assigned.version));
    }

    if (method === 'POST' && rest === '/score-submission') {
      return ok(this.submit(item, assigned));
    }

    throw problem(404, 'resource.not_found', 'The requested resource was not found.');
  }

  private submit(item: MockPortfolio, assigned: MockRound): PortfolioScoringResult {
    const questions = this.questionsFor(item, assigned.round);
    const missing = questions.filter(question => !assigned.scores.some(score => score.questionId === question.questionId));

    if (missing.length > 0) {
      throw problem(409, 'scoring.incomplete', `Score every question before submitting. ${missing.length} question(s) have no decision yet.`);
    }

    assigned.status = 'COMPLETE';
    assigned.submittedAt = new Date().toISOString();
    const total = assigned.totalPoints ?? 0;
    let discrepancy = false;
    let details: PortfolioScoringResult['discrepancyDetails'] = [];
    const r1 = item.rounds.find(entry => entry.round === 'ROUND_1');
    const r2 = item.rounds.find(entry => entry.round === 'ROUND_2');

    if (assigned.round === 'ROUND_1' || assigned.round === 'ROUND_2') {
      if (r1?.status === 'COMPLETE' && r2?.status === 'COMPLETE') {
        details = QUESTIONS.filter(question => decisionOf(r1, question.questionId) !== decisionOf(r2, question.questionId)).map(question => ({
          questionId: question.questionId,
          round1Result: decisionOf(r1, question.questionId),
          round2Result: decisionOf(r2, question.questionId),
        }));
        // US-3.3.4: a discrepancy is a different total or any different decision (PQ-16).
        discrepancy = r1.totalPoints !== r2.totalPoints || details.length > 0;

        if (discrepancy) {
          item.portfolioStatus = 'THIRD_REFEREE_REQUIRED';
          item.poolId = 'rpool-discrepancy';
          item.rounds.push(round('ROUND_3', 'PENDING', null, null));
        } else {
          item.portfolioStatus = 'COMPLETE';
          item.finalPoints = total;
        }
      }
    } else {
      // Round 3 and 2nd evaluation replace the final score.
      item.portfolioStatus = 'COMPLETE';
      item.finalPoints = assigned.round === 'SECOND_EVALUATION' ? (item.finalPoints ?? 0) - this.appealedOriginal(item) + total : total;
    }

    this.save();

    return {
      portfolioId: item.portfolioId,
      roundStatus: 'COMPLETE',
      portfolioStatus: item.portfolioStatus,
      discrepancy,
      discrepancyDetails: details,
      finalPortfolioPoints: item.finalPoints,
      weightedPortfolioScore: item.finalPoints === null ? null : Number(((item.finalPoints / TOTAL_POSSIBLE) * WEIGHT).toFixed(2)),
      auditEventId: crypto.randomUUID(),
    };
  }

  // Senior referee.

  private seniorDashboard(): SeniorRefereeDashboard {
    this.requireRole('SENIOR_REFEREE');
    const portfolios = this.state().portfolios;
    const inProgress = (name: ScoringRound): number => portfolios.filter(item => item.rounds.some(entry => entry.round === name && entry.status === 'IN_PROGRESS')).length;

    return {
      poolInsights: {
        pendingScoring: portfolios.filter(item => ['PENDING', 'THIRD_REFEREE_REQUIRED', 'SECOND_EVALUATION_REQUIRED'].includes(item.portfolioStatus)).length,
        firstRoundInProgress: inProgress('ROUND_1'),
        secondRoundInProgress: inProgress('ROUND_2'),
        resolvingDiscrepancy: inProgress('ROUND_3'),
        rescoringAppealed: inProgress('SECOND_EVALUATION'),
        complete: portfolios.filter(item => item.portfolioStatus === 'COMPLETE').length,
      },
      refereesWorkload: this.state().referees.map(referee => this.workloadRow(referee.refereeId)),
      generatedAt: new Date().toISOString(),
    };
  }

  private seniorPortfolio(method: string, portfolioId: string, rest: string, body: unknown): MockReply {
    const user = this.user();
    const supervisorReplace = user?.activeRole === 'ADMISSION_SUPERVISOR' && method === 'PUT' && /^\/evidence\/[^/]+\/replacement$/.test(rest);

    if (!supervisorReplace) {
      this.requireRole('SENIOR_REFEREE');
    }

    const item = this.state().portfolios.find(entry => entry.portfolioId === portfolioId);

    if (!item) {
      throw problem(404, 'resource.not_found', 'The portfolio was not found.');
    }

    if (method === 'GET' && rest === '') {
      return ok(this.seniorReview(item));
    }

    if (method === 'GET' && rest === '/eligible-referees') {
      const current = item.rounds.find(entry => entry.status === 'IN_PROGRESS');
      const used = item.rounds.map(entry => entry.refereeId).filter((id): id is string => id !== null);
      const role = current?.round === 'ROUND_3' ? 'THIRD_REFEREE' : current?.round === 'SECOND_EVALUATION' ? 'SECOND_EVALUATION_REFEREE' : 'REFEREE';

      return ok(
        this.state()
          .referees.filter(referee => referee.role === role && !used.includes(referee.refereeId) && !item.coiExcluded.includes(referee.refereeId))
          .map(referee => ({ userId: referee.refereeId, displayName: referee.name, activeAssignments: this.workloadRow(referee.refereeId).inProgress })),
      );
    }

    if (method === 'PUT' && rest === '/assignment') {
      const request = body as { targetUserId?: string; justification?: string };
      const current = item.rounds.find(entry => entry.status === 'IN_PROGRESS');

      if (!current) {
        throw problem(409, 'assignment.not_eligible', 'Only a portfolio in a referee’s inbox can be reassigned.');
      }

      if (!request.justification?.trim()) {
        throw problem(422, 'request.validation_failed', 'Enter a justification.', [{ code: 'required', detail: 'Enter a justification.', pointer: '/justification' }]);
      }

      const target = this.state().referees.find(referee => referee.refereeId === request.targetUserId);

      if (!target || item.coiExcluded.includes(target.refereeId) || item.rounds.some(entry => entry.refereeId === target.refereeId)) {
        throw problem(409, 'assignment.target_not_eligible', 'That referee cannot take this portfolio.');
      }

      current.refereeId = target.refereeId;
      current.retrievedAt = new Date().toISOString();
      current.dueAt = new Date(Date.now() + 2 * DAY).toISOString();
      current.scores = [];
      current.version += 1;
      this.save();

      return ok(this.inboxItems(item, target.refereeId)[0] ?? null);
    }

    if (method === 'POST' && rest === '/score-overrides') {
      const request = body as { round?: ScoringRound; newTotalPoints?: number; justification?: string };
      const target = item.rounds.find(entry => entry.round === request.round);

      if (!target || target.status !== 'COMPLETE') {
        throw problem(409, 'override.round_not_complete', 'Only a completed round can be overridden.');
      }

      if (typeof request.newTotalPoints !== 'number' || request.newTotalPoints < 0 || request.newTotalPoints > TOTAL_POSSIBLE) {
        throw problem(422, 'request.validation_failed', `The new score must be between 0 and ${TOTAL_POSSIBLE}.`, [{ code: 'range', detail: 'Out of range.', pointer: '/newTotalPoints' }]);
      }

      if (!request.justification?.trim()) {
        throw problem(422, 'request.validation_failed', 'Enter a justification.', [{ code: 'required', detail: 'Enter a justification.', pointer: '/justification' }]);
      }

      target.totalPoints = request.newTotalPoints;
      const last = [...item.rounds].reverse().find(entry => entry.status === 'COMPLETE');

      if (item.portfolioStatus === 'COMPLETE' && last === target) {
        item.finalPoints = request.newTotalPoints;
      }

      this.save();

      return ok({
        portfolioId: item.portfolioId,
        roundStatus: target.status,
        portfolioStatus: item.portfolioStatus,
        discrepancy: false,
        finalPortfolioPoints: item.finalPoints,
        weightedPortfolioScore: item.finalPoints === null ? null : Number(((item.finalPoints / TOTAL_POSSIBLE) * WEIGHT).toFixed(2)),
        auditEventId: crypto.randomUUID(),
      });
    }

    if (method === 'PUT' && /^\/evidence\/[^/]+\/replacement$/.test(rest)) {
      const file = body instanceof FormData ? body.get('file') : null;
      const reason = body instanceof FormData ? body.get('reason') : null;

      if (typeof reason !== 'string' || reason.trim() === '') {
        throw problem(422, 'request.validation_failed', 'Enter a justification for the replacement.');
      }

      if (!(file instanceof File)) {
        throw problem(422, 'request.validation_failed', 'Choose a file.');
      }

      if (file.size > 2 * 1024 * 1024) {
        throw problem(413, 'upload.too_large', 'The file is larger than 2 MB.');
      }

      return ok({ attachmentId: rest.split('/')[2] ?? '', version: 2, fileName: file.name, mediaType: file.type || 'application/pdf', sizeBytes: file.size, uploadedAt: new Date().toISOString() });
    }

    if (method === 'GET' && rest.startsWith('/evidence/')) {
      return ok(null);
    }

    throw problem(404, 'resource.not_found', 'The requested resource was not found.');
  }

  // Helpers.

  private review(item: MockPortfolio, assigned: MockRound): unknown {
    return {
      portfolioId: item.portfolioId,
      round: assigned.round,
      rubricVersion: RUBRIC,
      questions: this.questionsFor(item, assigned.round),
      context: {
        applicationNumber: item.applicationNumber,
        submittedAt: item.submittedAt,
        programName: item.programName,
        keyFacts: [
          { label: 'Specialty', value: item.specialtyName },
          { label: 'Graduation year', value: item.graduationYear },
          { label: 'Internship completion date', value: item.internshipCompletedOn },
        ],
        dueAt: assigned.dueAt,
        savedScores: assigned.scores.length > 0 ? { rubricVersion: RUBRIC, scores: assigned.scores, totalPoints: assigned.totalPoints } : null,
        totalPossiblePoints: assigned.round === 'SECOND_EVALUATION' ? this.questionsFor(item, assigned.round).reduce((sum, question) => sum + (question.maxPoints ?? 0), 0) : TOTAL_POSSIBLE,
      },
    };
  }

  private seniorReview(item: MockPortfolio): SeniorPortfolioReview {
    const current = item.rounds.find(entry => entry.status === 'IN_PROGRESS');
    const r1 = item.rounds.find(entry => entry.round === 'ROUND_1');
    const r2 = item.rounds.find(entry => entry.round === 'ROUND_2');
    const discrepancies =
      r1?.status === 'COMPLETE' && r2?.status === 'COMPLETE' && r1.totalPoints !== r2.totalPoints
        ? QUESTIONS.slice(0, 2).map(question => ({ questionId: question.questionId, round1Result: 'ACCEPT', round2Result: 'REJECT' }))
        : [];

    return {
      portfolioId: item.portfolioId,
      round: current?.round ?? item.rounds[item.rounds.length - 1]?.round ?? 'ROUND_1',
      rubricVersion: RUBRIC,
      questions: this.questionsFor(item, 'ROUND_1'),
      context: {
        applicationNumber: item.applicationNumber,
        submittedAt: item.submittedAt,
        programName: item.programName,
        keyFacts: [
          { label: 'Specialty', value: item.specialtyName },
          { label: 'Graduation year', value: item.graduationYear },
        ],
        dueAt: current?.dueAt ?? null,
        savedScores: null,
        totalPossiblePoints: TOTAL_POSSIBLE,
      },
      roundSummaries: item.rounds.map(entry => ({
        round: entry.round,
        status: entry.status,
        ...(entry.refereeId ? { refereeId: entry.refereeId } : {}),
        refereeName: this.state().referees.find(referee => referee.refereeId === entry.refereeId)?.name ?? null,
        totalPoints: entry.status === 'COMPLETE' ? entry.totalPoints : null,
        submittedAt: entry.submittedAt,
      })),
      discrepancies,
      oversight: {
        portfolioStatus: item.portfolioStatus,
        finalPortfolioPoints: item.finalPoints,
        weightedPortfolioScore: item.finalPoints === null ? null : Number(((item.finalPoints / TOTAL_POSSIBLE) * WEIGHT).toFixed(2)),
        currentRefereeId: current?.refereeId ?? null,
        currentRound: current?.round ?? null,
      },
    };
  }

  private questionsFor(item: MockPortfolio, name: ScoringRound): PortfolioQuestion[] {
    const appealOnly = name === 'SECOND_EVALUATION';

    return QUESTIONS.filter(question => !appealOnly || item.appealedQuestionIds.includes(question.questionId)).map((question, index) => ({
      questionId: question.questionId,
      prompt: question.prompt,
      candidateAnswer: index % 4 === 3 ? 'NO' : 'YES',
      details: index % 4 === 3 ? {} : { title: `Evidence item ${index + 1}`, date: '2025-03-14', role: 'Lead author' },
      evidence:
        index % 4 === 3
          ? []
          : [{ attachmentId: `ev-${item.portfolioId}-${index}`, version: 1, fileName: `evidence-q${index + 1}.pdf`, mediaType: 'application/pdf', sizeBytes: 220_000, uploadedAt: item.submittedAt }],
      priorRoundData: null,
      scoringType: question.scoringType,
      maxPoints: question.maxPoints,
      appealed: appealOnly ? true : undefined,
      appealResponse: appealOnly ? (item.appealResponses[question.questionId] ?? null) : undefined,
    })) as PortfolioQuestion[];
  }

  private questionScore(score: ScoreInput): number {
    const question = QUESTIONS.find(entry => entry.questionId === score.questionId);

    if (!question || score.decision === 'REJECT') {
      return 0;
    }

    if (question.scoringType === 'POINTS') {
      const points = Number(score.classificationCode?.endsWith('ORAL') ? 4 : score.classificationCode?.endsWith('POSTER') ? 3 : score.classificationCode?.endsWith('DEANS') ? 6 : score.classificationCode?.endsWith('HONOURS') ? 5 : 4);

      return Math.min(points, question.maxPoints);
    }

    return question.maxPoints;
  }

  private appealedOriginal(item: MockPortfolio): number {
    return QUESTIONS.filter(question => item.appealedQuestionIds.includes(question.questionId)).reduce((sum, question) => sum + Math.round(question.maxPoints / 2), 0);
  }

  private inboxItems(item: MockPortfolio, refereeId: string): RefereeInboxItem[] {
    return item.rounds
      .filter(entry => entry.refereeId === refereeId)
      .map(entry => ({
        portfolioId: item.portfolioId,
        applicationId: item.applicationId,
        applicationNumber: item.applicationNumber,
        programName: item.programName,
        round: entry.round,
        roundStatus: entry.status,
        portfolioStatus: item.portfolioStatus,
        retrievedAt: entry.retrievedAt,
        dueAt: entry.dueAt,
        overdue: entry.status === 'IN_PROGRESS' && entry.dueAt !== null && entry.dueAt < new Date().toISOString(),
      }));
  }

  private eligible(role: string, refereeId: string): MockPortfolio[] {
    return this.state()
      .portfolios.filter(item => !item.coiExcluded.includes(refereeId) && !item.rounds.some(entry => entry.refereeId === refereeId))
      .filter(item => this.nextRound(item, role) !== null)
      .sort((first, second) => first.submittedAt.localeCompare(second.submittedAt));
  }

  private nextRound(item: MockPortfolio, role: string): MockRound | null {
    const rounds = ROLE_ROUNDS[role] ?? [];

    return item.rounds.find(entry => rounds.includes(entry.round) && entry.status === 'PENDING') ?? null;
  }

  private waiting(role: string, refereeId: string): number {
    return this.eligible(role, refereeId).length;
  }

  private workloadRow(refereeId: string): RefereeWorkloadRow {
    const referee = this.state().referees.find(entry => entry.refereeId === refereeId);
    const rounds = this.state().portfolios.flatMap(item => item.rounds).filter(entry => entry.refereeId === refereeId);

    return {
      refereeId,
      refereeName: referee?.name ?? refereeId,
      role: referee?.role ?? 'REFEREE',
      inProgress: rounds.filter(entry => entry.status === 'IN_PROGRESS').length,
      completed: rounds.filter(entry => entry.status === 'COMPLETE').length,
      autoReturnedToPool: 0,
      coiReturned: this.state().coiReturns[refereeId] ?? 0,
    };
  }

  /** The demo personas share the seeded queue of their role. */
  private refereeId(user: MockStaffUser): string {
    if (user.userId === 'multi-role') {
      return user.activeRole === 'THIRD_REFEREE' ? 'third-referee' : user.activeRole === 'SECOND_EVALUATION_REFEREE' ? 'second-evaluation-referee' : 'referee';
    }

    return user.userId;
  }

  private requireRole(...roles: string[]): MockStaffUser {
    const user = this.user();

    if (user === null || !roles.includes(user.activeRole)) {
      throw problem(403, 'auth.forbidden', 'Your active role cannot use this operation.');
    }

    return user;
  }
}

function etag(version: number): string {
  return `W/"pf-${version}"`;
}

function decisionOf(entry: MockRound, questionId: string): string {
  return entry.scores.find(score => score.questionId === questionId)?.decision ?? 'ACCEPT';
}
