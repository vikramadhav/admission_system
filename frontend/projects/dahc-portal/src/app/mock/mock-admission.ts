import {
  AnnouncementStatus,
  AssignedPool,
  BulkWorkflowResult,
  CorrectionFlag,
  OfficerDashboard,
  OfficerInsight,
  OfficerQueueInsights,
  OfficerWorkload,
  OfficerWorkloadRow,
  ReinstatementRequestDetail,
  ReinstatementRequestSummary,
  StaffApplication,
  SupervisorDashboard,
  SupervisorInboxItem,
  SupervisorQueueInsights,
  VerificationInboxItem,
  VerificationPoolInsights,
  VerificationStatus,
} from '../api/admission.models';
import { WorkflowActionResult, WorkflowStatus } from '../api/candidate-lifecycle.models';
import { ScreeningApplicationRow } from '../api/screening.models';
import { MOCK_PROGRAMS } from './mock-catalog';
import { MOCK_LOOKUPS, MOCK_REVIEW_CYCLE_ID, MockAdmissionState, MockReviewApplication } from './mock-admission-seed';
import { MockReply, ok, problem } from './mock-http';
import { MockStaffUser } from './mock-store';

const DAY = 86_400_000;
const RETRIEVE_CAP = 10;

/** Verification statuses in which the application sits with its officer (counted against the cap). */
const WITH_OFFICER: readonly VerificationStatus[] = ['IN_PROGRESS', 'CORRECTION_SUBMITTED', 'CLARIFICATION_SUBMITTED', 'RE_EVALUATING'];

interface Request {
  readonly method: string;
  /** Path without the query string. */
  readonly path: string;
  readonly query: URLSearchParams;
  readonly body: unknown;
}

/**
 * Mock of the Admission Operations and Screening operations for the admission officer and
 * supervisor (and the Central Monitor's read of an application). It follows the contract's
 * shapes, roles (403 for another active role), idempotency (handled by the caller) and Problem
 * Details. Fields marked PROPOSAL in the models are added as documented there.
 */
export class MockAdmission {
  constructor(
    private readonly state: () => MockAdmissionState,
    private readonly save: () => void,
    private readonly user: () => MockStaffUser | null,
  ) {}

  /** Answers a staff request, or returns null when the path is not an admission operation. */
  handle(method: string, fullPath: string, body: unknown): MockReply | null {
    const [path = '', queryString = ''] = fullPath.split('?');
    const request: Request = { method, path, query: new URLSearchParams(queryString), body };
    let m: RegExpMatchArray | null;

    if (method === 'GET' && path === '/staff/admission/dashboard') {
      return ok(this.officerDashboard(request));
    }

    if (method === 'POST' && (m = path.match(/^\/staff\/pools\/([^/]+)\/application-retrievals$/))) {
      return this.retrieve(decodeURIComponent(m[1] ?? ''));
    }

    if (method === 'GET' && path === '/staff/supervisor/dashboard') {
      return ok(this.supervisorDashboard(request));
    }

    if (method === 'GET' && (m = path.match(/^\/staff\/officers\/([^/]+)\/workload$/))) {
      return ok(this.officerWorkload(decodeURIComponent(m[1] ?? ''), request));
    }

    if (method === 'GET' && (m = path.match(/^\/staff\/pools\/([^/]+)\/officers$/))) {
      return ok(this.poolOfficers(decodeURIComponent(m[1] ?? '')));
    }

    if (method === 'POST' && path === '/staff/application-reassignments') {
      return ok(this.reassign(body as ReassignBody));
    }

    if (method === 'GET' && path === '/staff/reinstatement-requests') {
      return ok(this.reinstatements(request));
    }

    if (method === 'GET' && (m = path.match(/^\/staff\/reinstatement-requests\/([^/]+)$/))) {
      return ok(this.reinstatement(decodeURIComponent(m[1] ?? '')));
    }

    if (method === 'POST' && (m = path.match(/^\/staff\/reinstatement-requests\/([^/]+)\/decision$/))) {
      return ok(this.decideReinstatement(decodeURIComponent(m[1] ?? ''), body as ReinstatementBody));
    }

    if (method === 'GET' && path === '/staff/duplicate-accounts') {
      this.requireRole('ADMISSION_SUPERVISOR');

      return ok(this.state().duplicates);
    }

    if (method === 'POST' && (m = path.match(/^\/staff\/candidates\/([^/]+)\/icp-refresh-preview$/))) {
      return ok(this.icpPreview(decodeURIComponent(m[1] ?? '')));
    }

    if (method === 'POST' && (m = path.match(/^\/staff\/candidates\/([^/]+)\/icp-refresh$/))) {
      return ok(this.icpApply(decodeURIComponent(m[1] ?? ''), body as { fieldCodes?: string[] }));
    }

    if (path.startsWith('/staff/screening/')) {
      return this.screening(request);
    }

    if ((m = path.match(/^\/staff\/applications\/([^/]+)(\/.*)?$/))) {
      return this.applicationOperation(request, decodeURIComponent(m[1] ?? ''), m[2] ?? '');
    }

    return null;
  }

  /** GET /lookups/{type} for the staff lookup types; null for other types. */
  lookup(type: string): MockReply | null {
    const items = MOCK_LOOKUPS[type];

    return items ? ok(items.map((item, index) => ({ ...item, parentCode: null, sortOrder: index + 1, active: true }))) : null;
  }

  // Officer.

  private officerDashboard(request: Request): OfficerDashboard {
    const officerId = this.officerId();
    const officer = this.state().officers.find(item => item.officerId === officerId);
    const mine = this.state().applications.filter(item => item.assignedOfficerId === officerId);
    const insight = request.query.get('insight') as OfficerInsight | null;
    const filtered = this.search(insight ? mine.filter(item => matchesInsight(item, insight, officerId)) : mine.filter(item => item.verificationStatus !== 'COMPLETE' && item.verificationStatus !== 'SCREENED_OUT'), request);
    const page = paginate(sortItems(filtered.map(item => this.inboxItem(item)), request.query.get('sort') ?? 'dueAt'), request);
    const pools: AssignedPool[] = (officer?.poolIds ?? []).map(poolId => {
      const pool = this.state().pools.find(item => item.poolId === poolId);

      return {
        poolId,
        programName: pool?.programName ?? '',
        specialtyName: pool?.specialtyName ?? '',
        waiting: this.state().applications.filter(item => item.poolId === poolId && item.verificationStatus === 'PENDING').length,
      };
    });

    return {
      poolInsights: poolInsights(this.state().applications.filter(item => officer?.poolIds.includes(item.poolId))),
      queueInsights: queueInsights(this.state().applications, officerId),
      items: page.items,
      page: page.page,
      generatedAt: new Date().toISOString(),
      pools,
    };
  }

  private retrieve(poolId: string): MockReply {
    const officerId = this.officerId();
    const state = this.state();
    const officer = state.officers.find(item => item.officerId === officerId);

    if (!officer?.poolIds.includes(poolId)) {
      throw problem(403, 'pool.not_assigned', 'You are not assigned to this pool.');
    }

    const inProgress = state.applications.filter(item => item.assignedOfficerId === officerId && item.verificationStatus === 'IN_PROGRESS').length;
    const room = RETRIEVE_CAP - inProgress;

    if (room <= 0) {
      throw problem(409, 'retrieval.limit_reached', `You already have ${RETRIEVE_CAP} applications in progress. Complete some before retrieving more.`);
    }

    const available = state.applications
      .filter(item => item.poolId === poolId && item.verificationStatus === 'PENDING' && !item.autoReturnedFrom.includes(officerId))
      .sort((first, second) => first.submittedAt.localeCompare(second.submittedAt))
      .slice(0, room);

    if (available.length === 0) {
      return { status: 200, body: { data: [], messageCode: 'pool.empty', message: 'There are no applications waiting in this pool.' } };
    }

    const now = Date.now();

    for (const item of available) {
      item.assignedOfficerId = officerId;
      item.retrievedAt = new Date(now).toISOString();
      item.dueAt = new Date(now + 7 * DAY).toISOString();
      item.verificationStatus = 'IN_PROGRESS';
      item.applicationStatus = 'UNDER_REVIEW';
    }

    this.save();

    return ok(available.map(item => this.inboxItem(item)));
  }

  // Supervisor.

  private supervisorDashboard(request: Request): SupervisorDashboard {
    this.requireRole('ADMISSION_SUPERVISOR');
    const state = this.state();
    const queue = request.query.get('queue');
    const items: SupervisorInboxItem[] = [];

    for (const item of state.applications) {
      if (item.verificationStatus === 'PENDING_CLARIFICATION' || item.verificationStatus === 'SCREEN_OUT_PENDING_APPROVAL') {
        items.push({
          itemId: `q-${item.applicationId}`,
          queue: item.verificationStatus === 'PENDING_CLARIFICATION' ? 'ESCALATION' : 'SCREEN_OUT',
          applicationId: item.applicationId,
          applicationNumber: item.applicationNumber,
          candidateName: item.candidateName,
          programName: item.programName,
          specialtyName: item.specialtyName,
          officerName: this.officerName(item.assignedOfficerId),
          requestedAt: item.requestedAt ?? item.submittedAt,
          verificationStatus: item.verificationStatus,
        });
      }
    }

    for (const request of state.reinstatements.filter(item => item.status === 'SUBMITTED')) {
      items.push({
        itemId: `q-${request.requestId}`,
        queue: 'REINSTATEMENT',
        applicationId: request.applicationId,
        applicationNumber: request.applicationNumber,
        reinstatementRequestId: request.requestId,
        candidateName: request.candidateName,
        programName: request.programName,
        officerName: null,
        requestedAt: request.requestedAt,
        verificationStatus: null,
      });
    }

    const filtered = items.filter(item => !queue || item.queue === queue).filter(item => matchesQuery(item, request.query.get('q')));
    const page = paginate(sortItems(filtered, request.query.get('sort') ?? 'requestedAt'), request);

    return {
      poolInsights: poolInsights(state.applications),
      queueInsights: supervisorInsights(state),
      inbox: page,
      officersWorkload: state.officers.map(officer => this.workloadRow(officer.officerId)),
      refereesWorkload: [
        { refereeId: 'referee', refereeName: 'Dr. Layla Nasser', role: 'REFEREE', inProgress: 4, completed: 18, autoReturnedToPool: 1, coiReturned: 0 },
        { refereeId: 'referee-2', refereeName: 'Dr. Omar Barakat', role: 'REFEREE', inProgress: 6, completed: 12, autoReturnedToPool: 0, coiReturned: 1 },
        { refereeId: 'third-referee', refereeName: 'Dr. Ahmed Saleh', role: 'THIRD_REFEREE', inProgress: 1, completed: 3, autoReturnedToPool: 0, coiReturned: 0 },
        { refereeId: 'second-evaluation-referee', refereeName: 'Dr. Mariam Qasim', role: 'SECOND_EVALUATION_REFEREE', inProgress: 1, completed: 2, autoReturnedToPool: 0, coiReturned: 0 },
      ],
      generatedAt: new Date().toISOString(),
    };
  }

  private officerWorkload(officerId: string, request: Request): OfficerWorkload {
    this.requireRole('ADMISSION_SUPERVISOR');

    if (!this.state().officers.some(item => item.officerId === officerId)) {
      throw problem(404, 'resource.not_found', 'The officer was not found.');
    }

    const overdue = request.query.get('overdue') === 'true';
    const items = this.state()
      .applications.filter(item => item.assignedOfficerId === officerId)
      .filter(item => !overdue || isOverdue(item))
      .map(item => this.inboxItem(item));

    return { officer: this.workloadRow(officerId), ...paginate(sortItems(items, request.query.get('sort') ?? 'dueAt'), request) };
  }

  private poolOfficers(poolId: string): unknown {
    this.requireRole('ADMISSION_SUPERVISOR');

    return this.state()
      .officers.filter(officer => officer.poolIds.includes(poolId))
      .map(officer => ({
        userId: officer.officerId,
        displayName: officer.name,
        activeAssignments: this.state().applications.filter(item => item.assignedOfficerId === officer.officerId && WITH_OFFICER.includes(item.verificationStatus)).length,
      }));
  }

  private reassign(body: ReassignBody): BulkWorkflowResult {
    this.requireRole('ADMISSION_SUPERVISOR');

    if (!body.justification?.trim()) {
      throw problem(422, 'request.validation_failed', 'Enter a justification.', [{ code: 'required', detail: 'Enter a justification.', pointer: '/justification' }]);
    }

    if (body.action === 'REASSIGN' && !body.targetOfficerId) {
      throw problem(422, 'request.validation_failed', 'Choose the officer to reassign to.', [{ code: 'required', detail: 'Choose an officer.', pointer: '/targetOfficerId' }]);
    }

    const results = body.applicationIds.map(id => {
      const item = this.state().applications.find(application => application.applicationId === id);
      const eligible = item !== undefined && ['IN_PROGRESS', 'CORRECTION_SUBMITTED', 'CLARIFICATION_SUBMITTED'].includes(item.verificationStatus);
      const target = this.state().officers.find(officer => officer.officerId === body.targetOfficerId);

      if (!item || !eligible) {
        return { resourceId: id, outcome: 'BLOCKED' as const, code: 'assignment.not_eligible' };
      }

      if (body.action === 'REASSIGN') {
        if (!target?.poolIds.includes(item.poolId) || target.officerId === item.assignedOfficerId) {
          return { resourceId: id, outcome: 'BLOCKED' as const, code: 'assignment.target_not_in_pool' };
        }

        item.assignedOfficerId = target.officerId;
        item.retrievedAt = new Date().toISOString();
        item.dueAt = new Date(Date.now() + 7 * DAY).toISOString();
      } else {
        item.assignedOfficerId = null;
        item.retrievedAt = null;
        item.dueAt = null;
        item.verificationStatus = 'PENDING';
        item.applicationStatus = 'SUBMITTED';
      }

      return { resourceId: id, outcome: 'PROCESSED' as const };
    });

    this.save();
    const processed = results.filter(item => item.outcome === 'PROCESSED').length;

    return { selectedCount: results.length, processedCount: processed, blockedCount: results.length - processed, results };
  }

  // Application under review.

  private applicationOperation(request: Request, applicationId: string, rest: string): MockReply {
    const item = this.state().applications.find(application => application.applicationId === applicationId);

    if (!item) {
      throw problem(404, 'resource.not_found', 'The application was not found.');
    }

    if (request.method === 'GET' && rest === '') {
      this.requireRole('ADMISSION_OFFICER', 'ADMISSION_SUPERVISOR', 'CENTRAL_MONITOR');
      this.requireVisible(item);

      return ok(this.staffApplication(item));
    }

    if (request.method === 'GET' && rest === '/attachments') {
      this.requireRole('ADMISSION_OFFICER', 'ADMISSION_SUPERVISOR', 'CENTRAL_MONITOR');
      this.requireVisible(item);

      return ok(item.attachments);
    }

    const body = (request.body ?? {}) as Record<string, unknown>;

    switch (true) {
      case request.method === 'PUT' && rest === '/correction-flags': {
        this.requireOfficerWorking(item);
        const flags = (body['flags'] as CorrectionFlag[] | undefined) ?? [];

        if (flags.length === 0) {
          throw problem(422, 'request.validation_failed', 'Flag at least one item.');
        }

        item.flags = flags.map(flag => ({ ...flag }));
        this.save();

        return ok({ flags: item.flags });
      }
      case request.method === 'POST' && rest === '/correction-requests':
        this.requireOfficerWorking(item);

        if (item.flags.length === 0) {
          throw problem(409, 'verification.no_flags', 'Flag at least one item before returning the application.');
        }

        return this.transition(item, 'CORRECTION_REQUIRED', 'CORRECTION_REQUIRED', () => {
          item.notes.push({ noteType: 'CORRECTION', text: item.flags.map(flag => flag.candidateNote ?? flag.candidateNoteCode).join(' '), createdAt: now(), authorDisplayName: this.user()?.displayName ?? '' });
        });
      case request.method === 'POST' && rest === '/verification-completion':
        this.requireOfficerWorking(item);

        return this.transition(item, 'COMPLETE', item.portfolioStatus === 'COMPLETE' ? 'REVIEW_COMPLETED' : item.applicationStatus, () => {
          item.flags = [];

          if (item.portfolioStatus === 'COMPLETE') {
            item.reviewCompletedAt = now();
          }
        });
      case request.method === 'POST' && rest === '/verification-actions':
        return this.afterFeedback(item, body);
      case request.method === 'PUT' && /^\/attachments\/[^/]+\/replacement$/.test(rest):
        return this.replaceAttachment(item, decodeURIComponent(rest.split('/')[2] ?? ''), request.body);
      case request.method === 'POST' && rest === '/screen-out-recommendations':
        this.requireOfficerWorking(item);

        if (typeof body['reasonCode'] !== 'string' || body['reasonCode'] === '') {
          throw problem(422, 'request.validation_failed', 'Choose a screen-out reason.');
        }

        return this.transition(item, 'SCREEN_OUT_PENDING_APPROVAL', item.applicationStatus, () => {
          item.screenOutRecommendation = { reasonCode: String(body['reasonCode']), note: typeof body['note'] === 'string' && body['note'] !== '' ? body['note'] : null };
          item.requestedAt = now();
          item.notes.push({ noteType: 'SCREEN_OUT', text: item.screenOutRecommendation.note ?? reasonLabel(item.screenOutRecommendation.reasonCode), createdAt: now(), authorDisplayName: this.user()?.displayName ?? '' });
        }, 202);
      case request.method === 'POST' && rest === '/clarification-requests':
        this.requireOfficerWorking(item);
        requireText(body['note'], 'note', 'Enter a note for the supervisor.');

        return this.transition(item, 'PENDING_CLARIFICATION', item.applicationStatus, () => {
          item.requestedAt = now();
          item.notes.push({ noteType: 'ESCALATION', text: String(body['note']), createdAt: now(), authorDisplayName: this.user()?.displayName ?? '' });
        }, 202);
      case request.method === 'POST' && rest === '/screen-out-decisions':
        return this.decideScreenOut(item, body);
      case request.method === 'POST' && rest === '/clarification-responses':
        this.requireRole('ADMISSION_SUPERVISOR');
        this.requireStatus(item, 'PENDING_CLARIFICATION');
        requireText(body['note'], 'note', 'Enter your guidance for the officer.');

        return this.transition(item, 'CLARIFICATION_SUBMITTED', item.applicationStatus, () => {
          item.requestedAt = null;
          item.notes.push({ noteType: 'SUPERVISOR_GUIDANCE', text: String(body['note']), createdAt: now(), authorDisplayName: this.user()?.displayName ?? '' });
        });
      case request.method === 'POST' && rest === '/reinstatement':
        this.requireRole('ADMISSION_SUPERVISOR');
        this.requireStatus(item, 'SCREENED_OUT');
        requireText(body['justification'], 'justification', 'Enter a justification.');

        return this.reinstateScreenedOut(item);
      default:
        throw problem(404, 'resource.not_found', 'The requested resource was not found.');
    }
  }

  private afterFeedback(item: MockReviewApplication, body: Record<string, unknown>): MockReply {
    this.requireOfficerWorking(item);

    if (item.verificationStatus !== 'CLARIFICATION_SUBMITTED' && item.verificationStatus !== 'RE_EVALUATING') {
      throw problem(409, 'verification.invalid_state', 'This application is not waiting on supervisor feedback.');
    }

    switch (body['action']) {
      case 'COMPLETE_VERIFICATION':
        return this.transition(item, 'COMPLETE', item.portfolioStatus === 'COMPLETE' ? 'REVIEW_COMPLETED' : item.applicationStatus);
      case 'RETURN_FOR_CORRECTION':
        if (item.flags.length === 0) {
          throw problem(409, 'verification.no_flags', 'Flag at least one item before returning the application.');
        }

        return this.transition(item, 'CORRECTION_REQUIRED', 'CORRECTION_REQUIRED');
      case 'RECOMMEND_SCREEN_OUT':
        return this.transition(item, 'SCREEN_OUT_PENDING_APPROVAL', item.applicationStatus, () => {
          item.screenOutRecommendation = { reasonCode: String(body['reasonCode'] ?? ''), note: typeof body['note'] === 'string' ? body['note'] : null };
          item.requestedAt = now();
        });
      case 'ESCALATE_FOR_CLARIFICATION':
        requireText(body['note'], 'note', 'Enter a note for the supervisor.');

        return this.transition(item, 'PENDING_CLARIFICATION', item.applicationStatus, () => {
          item.requestedAt = now();
          item.notes.push({ noteType: 'ESCALATION', text: String(body['note']), createdAt: now(), authorDisplayName: this.user()?.displayName ?? '' });
        });
      default:
        throw problem(422, 'request.validation_failed', 'Choose an action.');
    }
  }

  private decideScreenOut(item: MockReviewApplication, body: Record<string, unknown>): MockReply {
    this.requireRole('ADMISSION_SUPERVISOR');
    this.requireStatus(item, 'SCREEN_OUT_PENDING_APPROVAL');

    if (body['decision'] === 'ENDORSE_SCREEN_OUT') {
      return this.transition(item, 'SCREENED_OUT', 'SCREENED_OUT', () => {
        item.previous = { applicationStatus: 'UNDER_REVIEW', verificationStatus: 'IN_PROGRESS', portfolioStatus: item.portfolioStatus };
        item.screenOutReasonCode = typeof body['reasonCode'] === 'string' && body['reasonCode'] !== '' ? body['reasonCode'] : (item.screenOutRecommendation?.reasonCode ?? null);
        item.portfolioStatus = 'ON_HOLD';
        // US-2.4.3 AC10: an endorsed verification screen-out is announced immediately.
        item.announcementStatus = 'ANNOUNCED';
        item.requestedAt = null;
      });
    }

    if (body['decision'] === 'REJECT_SCREEN_OUT') {
      requireText(body['note'], 'note', 'Enter a note explaining the rejection.');

      return this.transition(item, 'RE_EVALUATING', item.applicationStatus, () => {
        item.screenOutRecommendation = null;
        item.requestedAt = null;
        item.notes.push({ noteType: 'SUPERVISOR_GUIDANCE', text: String(body['note']), createdAt: now(), authorDisplayName: this.user()?.displayName ?? '' });
      });
    }

    throw problem(422, 'request.validation_failed', 'Choose a decision.');
  }

  private reinstateScreenedOut(item: MockReviewApplication): MockReply {
    const previous = item.previous ?? { applicationStatus: 'UNDER_REVIEW', verificationStatus: 'IN_PROGRESS', portfolioStatus: 'IN_PROGRESS' };

    return this.transition(item, previous.verificationStatus, previous.applicationStatus, () => {
      item.portfolioStatus = previous.portfolioStatus;
      item.screenOutReasonCode = null;
      item.announcementStatus = 'PENDING';
      item.previous = null;
    });
  }

  private replaceAttachment(item: MockReviewApplication, attachmentId: string, body: unknown): MockReply {
    this.requireOfficerWorking(item);
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

    const attachment = item.attachments.find(entry => entry.attachment.attachmentId === attachmentId);

    if (!attachment) {
      throw problem(404, 'resource.not_found', 'The attachment was not found.');
    }

    const replaced = {
      ...attachment,
      attachment: { ...attachment.attachment, version: attachment.attachment.version + 1, fileName: file.name, mediaType: file.type || 'application/pdf', sizeBytes: file.size, uploadedAt: now() },
      previousVersionCount: attachment.previousVersionCount + 1,
    };
    item.attachments = item.attachments.map(entry => (entry === attachment ? replaced : entry));
    this.save();

    return ok(replaced.attachment);
  }

  private transition(
    item: MockReviewApplication,
    verification: VerificationStatus,
    application: MockReviewApplication['applicationStatus'],
    effect?: () => void,
    status = 200,
  ): MockReply {
    effect?.();
    item.verificationStatus = verification;
    item.applicationStatus = application;
    this.save();

    return ok(actionResult(item.applicationId, verification), undefined, status);
  }

  private staffApplication(item: MockReviewApplication): StaffApplication {
    const program = MOCK_PROGRAMS.find(entry => entry.id === item.programId) ?? MOCK_PROGRAMS[0];
    const role = this.user()?.activeRole;

    return {
      id: item.applicationId,
      applicationNumber: item.applicationNumber,
      program: program ?? { id: item.programId, code: '', name: item.programName, category: 'RESIDENCY' },
      status: item.applicationStatus,
      createdAt: item.submittedAt,
      submittedAt: item.submittedAt,
      version: 1,
      sections: item.sections,
      review: {
        candidateId: role === 'ADMISSION_SUPERVISOR' ? item.candidateId : null,
        candidateName: item.candidateName,
        verificationStatus: item.verificationStatus,
        portfolioStatus: item.portfolioStatus,
        assignedOfficerName: this.officerName(item.assignedOfficerId),
        dueAt: item.dueAt,
        gpaShortlistingScore: item.gpaShortlistingScore,
        examShortlistingScore: item.examShortlistingScore,
        icpFieldPointers: item.icpFieldPointers,
        flags: item.flags,
        notes: item.notes,
        screenOutRecommendation: item.screenOutRecommendation,
      },
    };
  }

  // Reinstatement, ICP.

  private reinstatements(request: Request): ReinstatementRequestSummary[] {
    this.requireRole('ADMISSION_SUPERVISOR');
    const status = request.query.get('status');

    return this.state()
      .reinstatements.filter(item => !status || item.status === status)
      .sort((first, second) => first.requestedAt.localeCompare(second.requestedAt))
      .map(item => ({
        requestId: item.requestId,
        applicationId: item.applicationId,
        applicationNumber: item.applicationNumber,
        candidateName: item.candidateName,
        programName: item.programName,
        cycleId: MOCK_REVIEW_CYCLE_ID,
        requestedAt: item.requestedAt,
        status: item.status,
      }));
  }

  private reinstatement(requestId: string): ReinstatementRequestDetail {
    this.requireRole('ADMISSION_SUPERVISOR');
    const item = this.state().reinstatements.find(entry => entry.requestId === requestId);

    if (!item) {
      throw problem(404, 'resource.not_found', 'The reinstatement request was not found.');
    }

    return {
      requestId: item.requestId,
      applicationId: item.applicationId,
      applicationNumber: item.applicationNumber,
      candidateName: item.candidateName,
      programName: item.programName,
      cycleId: MOCK_REVIEW_CYCLE_ID,
      requestedAt: item.requestedAt,
      status: item.status,
      withdrawalReasonCode: item.withdrawalReasonCode,
      withdrawalOtherReason: null,
      withdrawnAt: item.withdrawnAt,
      justification: item.justification,
      previousStatus: { applicationStatus: item.previousStatus, verificationStatus: 'IN_PROGRESS', portfolioStatus: 'PENDING' },
      notes: [{ noteType: 'CORRECTION', text: 'Transcript re-uploaded at the officer’s request.', createdAt: item.withdrawnAt, authorDisplayName: 'Omar Khalifa' }],
      decision: item.decision,
    };
  }

  private decideReinstatement(requestId: string, body: ReinstatementBody): WorkflowActionResult {
    this.requireRole('ADMISSION_SUPERVISOR');
    const item = this.state().reinstatements.find(entry => entry.requestId === requestId);

    if (!item) {
      throw problem(404, 'resource.not_found', 'The reinstatement request was not found.');
    }

    if (item.status !== 'SUBMITTED') {
      throw problem(409, 'reinstatement.already_decided', 'This request has already been decided.');
    }

    requireText(body.note, 'note', 'Enter a note.');

    if (body.decision === 'REJECT' && !body.reasonCode) {
      throw problem(422, 'request.validation_failed', 'Choose a rejection reason.', [{ code: 'required', detail: 'Choose a reason.', pointer: '/reasonCode' }]);
    }

    item.status = body.decision === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    item.decision = { decision: body.decision, reasonCode: body.reasonCode ?? null, note: body.note ?? '', decidedAt: now(), decidedByDisplayName: this.user()?.displayName ?? '' };
    this.save();

    return actionResult(item.applicationId, body.decision === 'APPROVE' ? item.previousStatus : 'WITHDRAWN');
  }

  private icpPreview(candidateId: string): unknown {
    this.requireRole('ADMISSION_SUPERVISOR');
    const item = this.state().applications.find(entry => entry.candidateId === candidateId);

    if (!item) {
      throw problem(404, 'resource.not_found', 'The candidate was not found.');
    }

    const personal = item.sections['personal-information'] ?? {};
    const fields = [
      { fieldCode: 'lastNameEn', label: 'Last name (English)', currentValue: String(personal['lastNameEn'] ?? ''), icpValue: `${String(personal['lastNameEn'] ?? '')}i` },
      { fieldCode: 'nationality', label: 'Nationality', currentValue: String(personal['nationality'] ?? ''), icpValue: String(personal['nationality'] ?? '') },
      { fieldCode: 'emiratesIdExpiry', label: 'Emirates ID expiry', currentValue: '2026-10-23', icpValue: '2031-10-22' },
      { fieldCode: 'passportNumber', label: 'Passport number', currentValue: 'N1234567', icpValue: 'N1234567' },
    ].map(field => ({ ...field, differs: field.currentValue !== field.icpValue }));

    return {
      differencesFound: fields.some(field => field.differs),
      previewToken: `icp-${candidateId}-${Date.now()}`,
      expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
      fields,
    };
  }

  private icpApply(candidateId: string, body: { fieldCodes?: string[] }): unknown {
    this.requireRole('ADMISSION_SUPERVISOR');
    const item = this.state().applications.find(entry => entry.candidateId === candidateId);

    if (!item || !body.fieldCodes?.length) {
      throw problem(422, 'request.validation_failed', 'Choose at least one field to update.');
    }

    const personal = item.sections['personal-information'] ?? {};

    if (body.fieldCodes.includes('lastNameEn')) {
      item.sections['personal-information'] = { ...personal, lastNameEn: `${String(personal['lastNameEn'] ?? '')}i` };
    }

    this.save();

    return { refreshedAt: now(), changedFields: body.fieldCodes, auditEventId: crypto.randomUUID() };
  }

  // Screening (EPIC-04).

  private screening(request: Request): MockReply {
    this.requireRole('ADMISSION_SUPERVISOR');
    const state = this.state();

    if (request.method === 'GET' && request.path === '/staff/screening/dashboard') {
      const announcement = request.query.get('announcementStatus');
      const attendance = request.query.get('casperAttendance');
      const appealed = request.query.get('appealed');
      const rows = state.applications
        .filter(item => ['REVIEW_COMPLETED', 'APPEAL_UNDER_REVIEW', 'SCREENED_OUT'].includes(item.applicationStatus))
        .map(item => screeningRow(item))
        .filter(row => !announcement || row.announcementStatus === announcement)
        .filter(row => !attendance || row.casperAttendance === attendance)
        .filter(row => appealed === null || String(row.appealed) === appealed)
        .filter(row => matchesQuery(row, request.query.get('q')));

      return ok({ ...paginate(sortItems(rows, request.query.get('sort') ?? '-shortlistingScore'), request), generatedAt: now() });
    }

    if (request.method === 'POST' && request.path === '/staff/screening/casper-imports') {
      return ok(this.casperImport(request.body));
    }

    const body = request.body as { applicationIds?: string[]; reasonCode?: string };
    const ids = body.applicationIds ?? [];

    if (ids.length === 0) {
      throw problem(422, 'request.validation_failed', 'Select at least one application.');
    }

    const apply = (eligible: (item: MockReviewApplication) => boolean, change: (item: MockReviewApplication) => void, blockedCode: string): MockReply => {
      const results = ids.map(id => {
        const item = state.applications.find(entry => entry.applicationId === id);

        if (!item || !eligible(item)) {
          return { resourceId: id, outcome: 'BLOCKED' as const, code: blockedCode };
        }

        change(item);

        return { resourceId: id, outcome: 'PROCESSED' as const };
      });

      this.save();
      const processed = results.filter(item => item.outcome === 'PROCESSED').length;

      return ok({ selectedCount: ids.length, processedCount: processed, blockedCount: ids.length - processed, results });
    };

    switch (request.path) {
      case '/staff/screening/announcements':
        return apply(
          item => effectiveAnnouncement(item) === 'READY_FOR_INITIAL_ANNOUNCEMENT',
          item => {
            item.announcementStatus = 'ANNOUNCED';
            item.initialAnnouncedAt = now();
            item.appealed = false;
          },
          'announcement.not_ready',
        );
      case '/staff/screening/bulk-screen-outs':
        if (!body.reasonCode) {
          throw problem(422, 'request.validation_failed', 'Choose a screen-out reason.');
        }

        return apply(
          item => item.applicationStatus !== 'SCREENED_OUT',
          item => {
            item.previous = { applicationStatus: item.applicationStatus, verificationStatus: item.verificationStatus, portfolioStatus: item.portfolioStatus };
            item.applicationStatus = 'SCREENED_OUT';
            item.announcementStatus = 'ANNOUNCED';
            item.screenOutReasonCode = body.reasonCode ?? null;
          },
          'screen_out.already_screened_out',
        );
      case '/staff/screening/reannouncements':
        return apply(
          item => item.announcementStatus === 'READY_FOR_REANNOUNCEMENT',
          item => {
            item.announcementStatus = 'REANNOUNCED';
            item.reannouncedAt = now();
          },
          'reannouncement.not_ready',
        );
      default:
        throw problem(404, 'resource.not_found', 'The requested resource was not found.');
    }
  }

  private casperImport(body: unknown): unknown {
    const file = body instanceof FormData ? body.get('file') : null;

    if (!(file instanceof File)) {
      throw problem(422, 'request.validation_failed', 'Choose the CASPER results file.');
    }

    if (!/\.xlsx?$/i.test(file.name)) {
      throw problem(415, 'casper.invalid_file', 'The file must be an Excel workbook (.xlsx) in the CASPER template.');
    }

    const state = this.state();
    const candidates = state.applications.filter(item => item.applicationStatus === 'REVIEW_COMPLETED');
    const attended = candidates.slice(0, Math.max(0, candidates.length - 1));

    for (const item of candidates) {
      const present = attended.includes(item);
      item.casperAttendance = present ? 'ATTENDED' : 'ABSENT';
      item.casperShortlistingScore = present ? Number((item.weights.casper * 0.74).toFixed(2)) : null;
    }

    state.casperUploadVersion += 1;
    this.save();

    return {
      uploadVersion: state.casperUploadVersion,
      totalRows: attended.length + 2,
      matchedRows: attended.length,
      appliedRows: attended.length,
      exceptionRows: 2,
      exceptions: [
        { rowNumber: attended.length + 2, code: 'casper.unmatched_application', detail: 'No application with this ID in the cycle.', applicationNumberReceived: '20269999999' },
        { rowNumber: attended.length + 3, code: 'casper.invalid_percentile', detail: 'CASPER percentile must be between 0 and 1.', applicationNumberReceived: candidates[0]?.applicationNumber ?? null },
      ],
    };
  }

  // Helpers.

  private inboxItem(item: MockReviewApplication): VerificationInboxItem {
    return {
      applicationId: item.applicationId,
      applicationNumber: item.applicationNumber,
      candidateName: item.candidateName,
      programName: item.programName,
      specialtyName: item.specialtyName,
      poolId: item.poolId,
      assignedOfficerId: item.assignedOfficerId,
      submittedAt: item.submittedAt,
      retrievedAt: item.retrievedAt,
      dueAt: item.dueAt,
      overdue: isOverdue(item),
      applicationStatus: item.applicationStatus,
      verificationStatus: item.verificationStatus,
      portfolioStatus: item.portfolioStatus,
      gpaShortlistingScore: item.gpaShortlistingScore,
      examShortlistingScore: item.examShortlistingScore,
    };
  }

  private workloadRow(officerId: string): OfficerWorkloadRow {
    const officer = this.state().officers.find(item => item.officerId === officerId);

    return {
      officerId,
      officerName: officer?.name ?? officerId,
      poolIds: [...(officer?.poolIds ?? [])],
      queueInsights: queueInsights(this.state().applications, officerId),
      overdueCount: this.state().applications.filter(item => item.assignedOfficerId === officerId && isOverdue(item)).length,
    };
  }

  private search<T extends { candidateName: string; applicationNumber: string }>(items: readonly T[], request: Request): T[] {
    return items.filter(item => matchesQuery(item, request.query.get('q')));
  }

  /** The demo personas share the seeded officer's queue. */
  private officerId(): string {
    const user = this.requireRole('ADMISSION_OFFICER');

    return user.userId === 'multi-role' || user.userId === 'staff-user' ? 'officer' : user.userId;
  }

  private officerName(officerId: string | null): string | null {
    return officerId === null ? null : (this.state().officers.find(item => item.officerId === officerId)?.name ?? null);
  }

  private requireRole(...roles: string[]): MockStaffUser {
    const user = this.user();

    if (user === null) {
      throw problem(403, 'auth.forbidden', 'Your active role cannot use this operation.');
    }

    if (!roles.includes(user.activeRole)) {
      throw problem(403, 'auth.forbidden', 'Your active role cannot use this operation.');
    }

    return user;
  }

  /** Officers see only applications assigned to them (STP-2.1). */
  private requireVisible(item: MockReviewApplication): void {
    if (this.user()?.activeRole === 'ADMISSION_OFFICER' && item.assignedOfficerId !== this.officerId()) {
      throw problem(404, 'resource.not_found', 'The application was not found.');
    }
  }

  private requireOfficerWorking(item: MockReviewApplication): void {
    this.requireRole('ADMISSION_OFFICER');
    this.requireVisible(item);

    if (!WITH_OFFICER.includes(item.verificationStatus)) {
      throw problem(409, 'verification.invalid_state', 'This action is not available for the application in its current status.');
    }
  }

  private requireStatus(item: MockReviewApplication, status: VerificationStatus): void {
    if (item.verificationStatus !== status) {
      throw problem(409, 'verification.invalid_state', 'This action is not available for the application in its current status.');
    }
  }
}

interface ReassignBody {
  readonly action: 'REASSIGN' | 'RETURN_TO_POOL';
  readonly applicationIds: readonly string[];
  readonly targetOfficerId?: string | null;
  readonly justification?: string;
}

interface ReinstatementBody {
  readonly decision: 'APPROVE' | 'REJECT';
  readonly reasonCode?: string | null;
  readonly note?: string;
}

function now(): string {
  return new Date().toISOString();
}

function actionResult(resourceId: string, status: WorkflowStatus): WorkflowActionResult {
  return { resourceId, status, effectiveAt: now(), auditEventId: crypto.randomUUID() };
}

function requireText(value: unknown, field: string, message: string): void {
  if (typeof value !== 'string' || value.trim() === '') {
    throw problem(422, 'request.validation_failed', message, [{ code: 'required', detail: message, pointer: `/${field}` }]);
  }
}

function reasonLabel(code: string): string {
  return MOCK_LOOKUPS['SCREEN_OUT_REASON']?.find(item => item.code === code)?.label ?? code;
}

function isOverdue(item: MockReviewApplication): boolean {
  return item.verificationStatus === 'IN_PROGRESS' && item.dueAt !== null && item.dueAt < now();
}

function matchesQuery(item: { candidateName: string; applicationNumber: string }, q: string | null): boolean {
  const text = q?.trim().toLowerCase();

  return !text || item.candidateName.toLowerCase().includes(text) || item.applicationNumber.includes(text);
}

function matchesInsight(item: MockReviewApplication, insight: OfficerInsight, officerId: string): boolean {
  switch (insight) {
    case 'IN_PROGRESS':
      return item.verificationStatus === 'IN_PROGRESS';
    case 'PENDING_RESPONSE':
      return item.verificationStatus === 'CORRECTION_REQUIRED';
    case 'PENDING_WITH_SUPERVISOR':
      return item.verificationStatus === 'PENDING_CLARIFICATION' || item.verificationStatus === 'SCREEN_OUT_PENDING_APPROVAL';
    case 'RESUBMITTED_BY_CANDIDATE':
      return item.verificationStatus === 'CORRECTION_SUBMITTED';
    case 'RESUBMITTED_BY_SUPERVISOR':
      return item.verificationStatus === 'CLARIFICATION_SUBMITTED' || item.verificationStatus === 'RE_EVALUATING';
    case 'COMPLETED':
      return item.verificationStatus === 'COMPLETE';
    case 'SCREENED_OUT':
      return item.verificationStatus === 'SCREENED_OUT';
    case 'AUTO_RETURNED_TO_POOL':
      return item.autoReturnedFrom.includes(officerId);
  }
}

function poolInsights(items: readonly MockReviewApplication[]): VerificationPoolInsights {
  const count = (statuses: readonly VerificationStatus[]): number => items.filter(item => statuses.includes(item.verificationStatus)).length;

  return {
    submitted: count(['PENDING']),
    underVerification: count(['IN_PROGRESS', 'CLARIFICATION_SUBMITTED', 'RE_EVALUATING', 'CORRECTION_SUBMITTED']),
    pendingWithCandidate: count(['CORRECTION_REQUIRED']),
    screenedOut: count(['SCREEN_OUT_PENDING_APPROVAL', 'SCREENED_OUT']),
    completed: count(['COMPLETE']),
  };
}

function queueInsights(items: readonly MockReviewApplication[], officerId: string): OfficerQueueInsights {
  const mine = items.filter(item => item.assignedOfficerId === officerId);
  const count = (statuses: readonly VerificationStatus[]): number => mine.filter(item => statuses.includes(item.verificationStatus)).length;

  return {
    inProgress: count(['IN_PROGRESS']),
    pendingResponse: count(['CORRECTION_REQUIRED']),
    pendingWithSupervisor: count(['PENDING_CLARIFICATION', 'SCREEN_OUT_PENDING_APPROVAL']),
    resubmittedByCandidate: count(['CORRECTION_SUBMITTED']),
    resubmittedBySupervisor: count(['CLARIFICATION_SUBMITTED', 'RE_EVALUATING']),
    completed: count(['COMPLETE']),
    screenedOut: count(['SCREENED_OUT']),
    autoReturnedToPool: items.filter(item => item.autoReturnedFrom.includes(officerId)).length,
  };
}

function supervisorInsights(state: MockAdmissionState): SupervisorQueueInsights {
  const count = (status: VerificationStatus): number => state.applications.filter(item => item.verificationStatus === status).length;
  const requests = (status: string): number => state.reinstatements.filter(item => item.status === status).length;

  return {
    totalComplete: count('CLARIFICATION_SUBMITTED') + count('RE_EVALUATING') + count('SCREENED_OUT'),
    totalScreenedOut: count('SCREENED_OUT'),
    pendingEscalated: count('PENDING_CLARIFICATION'),
    pendingScreenOut: count('SCREEN_OUT_PENDING_APPROVAL'),
    pendingReinstatement: requests('SUBMITTED'),
    totalReinstated: requests('APPROVED'),
    totalReinstatementRejected: requests('REJECTED'),
  };
}

/** Pending becomes ready once verification and portfolio are both complete (US-4.3.1). */
function effectiveAnnouncement(item: MockReviewApplication): AnnouncementStatus {
  if (item.announcementStatus === 'PENDING' && item.verificationStatus === 'COMPLETE' && item.portfolioStatus === 'COMPLETE' && item.applicationStatus !== 'SCREENED_OUT') {
    return 'READY_FOR_INITIAL_ANNOUNCEMENT';
  }

  return item.announcementStatus;
}

function screeningRow(item: MockReviewApplication): ScreeningApplicationRow {
  const parts = [item.gpaShortlistingScore, item.examShortlistingScore, item.casperShortlistingScore, item.portfolioScore];
  const total = parts.reduce<number>((sum, value) => sum + (value ?? 0), 0);

  return {
    applicationId: item.applicationId,
    applicationNumber: item.applicationNumber,
    candidateName: item.candidateName,
    programName: item.programName,
    applicationStatus: item.applicationStatus,
    verificationStatus: item.verificationStatus,
    portfolioStatus: item.portfolioStatus,
    announcementStatus: effectiveAnnouncement(item),
    casperAttendance: item.casperAttendance,
    appealed: item.appealed,
    gpaShortlistingScore: item.gpaShortlistingScore,
    examShortlistingScore: item.examShortlistingScore,
    casperShortlistingScore: item.casperShortlistingScore,
    portfolioScore: item.portfolioScore,
    shortlistingScore: Number(total.toFixed(2)),
    weights: item.weights,
    reviewCompletedAt: item.reviewCompletedAt,
    initialAnnouncedAt: item.initialAnnouncedAt,
    reannouncedAt: item.reannouncedAt,
    screenOutReasonCode: item.screenOutReasonCode,
  };
}

/** Sorts by an allow-listed key; a leading "-" sorts descending. */
function sortItems<T>(items: readonly T[], sort: string): T[] {
  const descending = sort.startsWith('-');
  const key = (descending ? sort.slice(1) : sort) === 'applicationId' ? 'applicationNumber' : descending ? sort.slice(1) : sort;

  return [...items].sort((first, second) => {
    const a = (first as Record<string, unknown>)[key];
    const b = (second as Record<string, unknown>)[key];
    const order = a === b ? 0 : a === null || a === undefined ? 1 : b === null || b === undefined ? -1 : a < b ? -1 : 1;

    return descending ? -order : order;
  });
}

/** Opaque-looking cursors: the offset of the next page. */
function paginate<T>(items: readonly T[], request: Request): { items: T[]; page: { limit: number; nextCursor: string | null } } {
  const limit = Math.min(100, Math.max(1, Number(request.query.get('limit') ?? 25)));
  const offset = Number(request.query.get('cursor') ? atob(request.query.get('cursor') ?? '') : 0) || 0;
  const slice = items.slice(offset, offset + limit);
  const next = offset + limit < items.length ? btoa(String(offset + limit)) : null;

  return { items: slice, page: { limit, nextCursor: next } };
}
