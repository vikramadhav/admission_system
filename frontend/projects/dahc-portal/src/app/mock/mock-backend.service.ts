import { Injectable } from '@angular/core';

import { CorrectionFlag } from '../api/admission.models';
import { Application, ApplicationStatus, ApplicationSummary, Preference } from '../api/application.models';
import { AuthSession } from '../api/auth.models';
import {
  ApplicationSection,
  ApplicationSectionKey,
  AttachmentMetadata,
  AttachmentSlot,
  CandidatePortfolioResult,
  ContactVerification,
  LookupItem,
  PaymentSession,
  PortfolioAnswer,
  PortfolioSubmission,
  SectionFieldState,
  SectionValues,
  WithdrawalChallenge,
  WorkflowActionResult,
} from '../api/candidate-lifecycle.models';
import { CandidateApplicationAction, CandidateDashboard, CandidateDashboardItem } from '../api/dashboard.models';
import { portfolioQuestions } from '../shared/portfolio-questions';
import { programRules } from '../shared/program-rules';
import { MOCK_CYCLE, MOCK_PROGRAMS, MOCK_SPECIALTIES, mockSite, mockSpecialty, toSpecialty } from './mock-catalog';
import { MockAdmission } from './mock-admission';
import { MockOversight } from './mock-oversight';
import { MockScoring, scoringLookup } from './mock-scoring';
import { MockReply, ok, problem } from './mock-http';
import { seedDatabase } from './mock-personas';
import { attachmentSlots, programOf } from './mock-slots';
import {
  MockApplication,
  MockCandidate,
  MockDatabase,
  MockStaffUser,
  flaggedSectionKeys,
  flaggedSlotIds,
  clearDatabase,
  loadDatabase,
  saveDatabase,
  storeUserId,
  storedUserId,
} from './mock-store';

export { MockProblem } from './mock-http';
export type { MockReply } from './mock-http';

/** The one-time code accepted by the mock for every OTP. */
export const MOCK_OTP = '123456';

const ACTIVE_STATUSES: readonly ApplicationStatus[] = [
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'CORRECTION_REQUIRED',
  'CORRECTION_SUBMITTED',
  'SCREENED_OUT',
  'REVIEW_COMPLETED',
  'APPEAL_UNDER_REVIEW',
];

const etagOf = (version: number): string => `W/"${version}"`;

/**
 * In-browser implementation of the candidate operations of the DAHC contract, used by the mock
 * build. It keeps the contract's envelopes, ETags, idempotency and Problem Details so the portal
 * runs unchanged against the .NET API later.
 */
@Injectable({ providedIn: 'root' })
export class MockBackendService {
  private database: MockDatabase = loadDatabase(seedDatabase);
  private readonly uploadedFiles = new Map<string, Blob>();
  private readonly withdrawals = new Map<string, { applicationId: string; reasonCode: string }>();
  private readonly verifications = new Map<string, { channel: string; value: string }>();
  private readonly idempotency = new Map<string, MockReply>();
  private readonly admission = new MockAdmission(
    () => this.database.admission,
    () => this.save(),
    () => this.staffUser(),
  );
  private readonly oversight = new MockOversight(
    () => this.database.oversight,
    () => this.database.admission,
    () => this.save(),
    () => this.staffUser(),
    () => this.database.staff,
  );
  private readonly scoring = new MockScoring(
    () => this.database.scoring,
    () => this.save(),
    () => this.staffUser(),
  );

  signedInUserId(): string | null {
    return storedUserId();
  }

  signIn(userId: string): void {
    storeUserId(userId);
  }

  signOut(): void {
    storeUserId(null);
  }

  /** Starts the mock data again from the seed (sign-in page "reset"). */
  reset(): void {
    clearDatabase();
    this.database = seedDatabase();
    this.save();
  }

  /** Mock gateway: the candidate paid, failed or cancelled. */
  completePayment(applicationId: string, paymentSessionId: string, outcome: 'PAID' | 'FAILED' | 'CANCELLED'): void {
    const application = this.findApplicationAnywhere(applicationId);
    const session = application?.paymentSessions.find(item => item.id === paymentSessionId);

    if (!application || !session) {
      return;
    }

    const paid = outcome === 'PAID';
    application.paymentSessions = application.paymentSessions.map(item =>
      item.id === paymentSessionId
        ? {
            ...item,
            status: outcome,
            receiptId: paid ? `RCP-2026-${String(++this.database.sequence).padStart(6, '0')}` : null,
            paymentDate: paid ? new Date().toISOString() : null,
          }
        : item,
    );
    this.save();
  }

  paymentAmount(applicationId: string, paymentSessionId: string): PaymentSession | null {
    return this.findApplicationAnywhere(applicationId)?.paymentSessions.find(item => item.id === paymentSessionId) ?? null;
  }

  handle(method: string, path: string, body: unknown, headers: { get(name: string): string | null }): MockReply {
    const idempotencyKey = headers.get('Idempotency-Key');
    const cacheKey = idempotencyKey ? `${method} ${path} ${idempotencyKey}` : null;

    if (cacheKey && this.idempotency.has(cacheKey)) {
      return this.idempotency.get(cacheKey) as MockReply;
    }

    const reply = this.route(method, path, body, headers);

    if (cacheKey && reply.status < 300) {
      this.idempotency.set(cacheKey, reply);
    }

    return reply;
  }

  /** GET /finance/payments/export as a file. */
  financeExport(fullPath: string): Blob {
    return this.oversight.exportFile(fullPath);
  }

  attachmentContent(path: string): Blob {
    const [, , applicationId, , slotId] = path.split('/');
    const stored = this.uploadedFiles.get(`${applicationId}/${decodeURIComponent(slotId ?? '')}`);

    return stored ?? new Blob(['%PDF-1.4\n% Mock document: the original file is not kept after a reload.\n'], { type: 'application/pdf' });
  }

  storeUpload(path: string, file: File): void {
    const [, , applicationId, , slotId] = path.split('/');
    this.uploadedFiles.set(`${applicationId}/${decodeURIComponent(slotId ?? '')}`, file);
  }

  private route(method: string, path: string, body: unknown, headers: { get(name: string): string | null }): MockReply {
    const match = (pattern: RegExp): RegExpMatchArray | null => path.match(pattern);
    let m: RegExpMatchArray | null;

    if (method === 'POST' && path === '/auth/sign-in') {
      return ok(this.session());
    }

    if (method === 'GET' && path === '/auth/me') {
      return ok(this.session());
    }

    if (method === 'PUT' && path === '/auth/active-role') {
      return ok(this.switchActiveRole(body as { roleCode?: unknown }));
    }

    if (path.startsWith('/finance/') || path.startsWith('/admin/') || path.startsWith('/staff/site-monitoring/')) {
      const reply = this.oversight.handle(method, path, body, headers);

      if (reply === null) {
        throw problem(404, 'resource.not_found', 'The requested resource was not found.');
      }

      return reply;
    }

    if (path.startsWith('/referee/') || path.startsWith('/senior-referee/')) {
      const reply = this.scoring.handle(method, path, body, headers);

      if (reply === null) {
        throw problem(404, 'resource.not_found', 'The requested resource was not found.');
      }

      return reply;
    }

    if (path.startsWith('/staff/')) {
      const reply = this.admission.handle(method, path, body);

      if (reply === null) {
        throw problem(404, 'resource.not_found', 'The requested resource was not found.');
      }

      return reply;
    }

    if (method === 'GET' && path.startsWith('/lookups/') && path !== '/lookups/WITHDRAWAL_REASON') {
      const type = path.split('/')[2] ?? '';
      const reply = this.staffUser() === null ? null : (this.admission.lookup(type) ?? scoringLookup(type));

      if (reply === null) {
        throw problem(403, 'auth.forbidden', 'Your active role cannot read this list.');
      }

      return reply;
    }

    if (this.staffUser() !== null && (path.startsWith('/me/') || path.startsWith('/applications'))) {
      // Staff areas arrive in later phases; candidate operations are never open to staff (D-14).
      throw problem(403, 'auth.forbidden', 'Your active role cannot use this operation.');
    }

    if (method === 'GET' && path === '/me/dashboard') {
      return ok(this.dashboard());
    }

    if (method === 'GET' && path === '/programs') {
      return ok(MOCK_PROGRAMS);
    }

    if (method === 'GET' && (m = match(/^\/programs\/([^/]+)\/specialties$/))) {
      return ok(MOCK_SPECIALTIES.filter(item => item.programId === m?.[1]).map(toSpecialty));
    }

    if (method === 'GET' && (m = match(/^\/specialties\/([^/]+)\/sites$/))) {
      const specialty = mockSpecialty(m[1] ?? '');

      return ok((specialty?.siteIds ?? []).map(id => mockSite(id)).filter(site => site !== undefined));
    }

    if (method === 'GET' && path === '/lookups/WITHDRAWAL_REASON') {
      return ok(WITHDRAWAL_REASONS);
    }

    if (method === 'GET' && path === '/applications') {
      return ok(this.candidate().applications.map(item => this.summary(item)));
    }

    if (method === 'POST' && path.startsWith('/applications?') ) {
      return this.create(body as { programId: string; preferences: Preference[] });
    }

    if (!(m = match(/^\/applications\/([^/?]+)(\/.*)?$/))) {
      throw problem(404, 'resource.not_found', 'The requested resource was not found.');
    }

    const application = this.application(decodeURIComponent(m[1] ?? ''));
    const rest = m[2] ?? '';
    const ifMatch = headers.get('If-Match');

    switch (true) {
      case method === 'GET' && rest === '':
        return ok(this.toApplication(application), etagOf(application.version));
      case method === 'PATCH' && rest === '':
        this.requireDraft(application);
        this.requireVersion(application, ifMatch);
        this.setPreferences(application, (body as { preferences: Preference[] }).preferences);

        return ok(this.toApplication(application), etagOf(application.version));
      case method === 'DELETE' && rest === '/draft':
        this.requireDraft(application);
        application.status = 'ARCHIVED';
        this.touch(application);

        return ok(this.workflow(application));
      case method === 'PUT' && rest === '/preferences':
        if (!application.editPreferencesOpen || application.status === 'DRAFT') {
          throw problem(409, 'application.preferences_locked', 'Preferences can no longer be changed for this application.');
        }

        this.requireVersion(application, ifMatch);
        this.setPreferences(application, (body as { preferences: Preference[] }).preferences);

        return ok(this.toApplication(application), etagOf(application.version));
      case method === 'POST' && rest === '/site-exclusions':
        return this.exclude(application, body as { siteIds: string[]; reason: string });
      case method === 'POST' && rest === '/reinstatement-requests':
        if (application.status !== 'WITHDRAWN' || application.reinstatementRequestedAt) {
          throw problem(409, 'application.reinstatement_not_allowed', 'This application cannot be reinstated.');
        }

        if (this.candidate().applications.some(item => item.id !== application.id && ACTIVE_STATUSES.includes(item.status))) {
          throw problem(409, 'application.active_exists', 'You already have an active application in this cycle.');
        }

        application.reinstatementRequestedAt = new Date().toISOString();
        this.save();

        return ok(this.workflow(application, 'REINSTATEMENT_REQUESTED'), undefined, 202);
      case rest.startsWith('/sections/'):
        return this.section(application, method, decodeURIComponent(rest.slice('/sections/'.length)) as ApplicationSectionKey, body, ifMatch);
      case method === 'GET' && rest === '/attachments':
        return ok(this.slots(application));
      case rest.startsWith('/attachments/'):
        return this.attachment(application, method, decodeURIComponent(rest.slice('/attachments/'.length)), body);
      case method === 'GET' && rest === '/portfolio':
        return ok(this.portfolio(application));
      case method === 'POST' && rest === '/portfolio-submission':
        return this.submitPortfolio(application, body as { answers: PortfolioAnswer[] });
      case method === 'POST' && rest === '/payment-sessions':
        return this.createPayment(application);
      case method === 'GET' && rest.startsWith('/payment-sessions/'): {
        const session = application.paymentSessions.find(item => item.id === rest.slice('/payment-sessions/'.length));

        if (!session) {
          throw problem(404, 'resource.not_found', 'The payment session was not found.');
        }

        return ok(session);
      }
      case method === 'POST' && rest === '/submission':
        return this.submit(application, body as { paymentSessionId: string });
      case method === 'POST' && rest === '/withdrawal-requests':
        return this.startWithdrawal(application, body as { reasonCode: string; otherReason?: string });
      case method === 'POST' && /^\/withdrawal-requests\/[^/]+\/confirmation$/.test(rest):
        return this.confirmWithdrawal(application, rest.split('/')[2] ?? '', body as { otp: string });
      case method === 'POST' && /^\/withdrawal-requests\/[^/]+\/otp-resend$/.test(rest):
        return ok(this.challenge());
      case method === 'POST' && rest === '/contact-verifications':
        return this.startVerification(body as { channel: 'EMAIL' | 'SMS'; value: string });
      case method === 'POST' && /^\/contact-verifications\/[^/]+\/confirmation$/.test(rest):
        return this.confirmVerification(rest.split('/')[2] ?? '', body as { otp: string });
      case method === 'POST' && /^\/contact-verifications\/[^/]+\/otp-resend$/.test(rest): {
        const id = rest.split('/')[2] ?? '';
        const pending = this.verifications.get(id);

        return ok(this.verification(id, pending?.channel === 'SMS' ? 'SMS' : 'EMAIL', pending?.value ?? ''), undefined, 202);
      }
      case method === 'GET' && rest === '/correction-flags':
        return ok(this.corrections(application));
      case method === 'POST' && rest === '/corrections':
        return this.submitCorrections(application, body as { sections?: Record<string, { values?: SectionValues }> });
      case method === 'GET' && rest === '/portfolio-result':
        return ok(this.portfolioResult(application));
      case method === 'POST' && rest === '/appeals':
        return this.appeal(application, body as { responses: { questionId: string; response: string }[] });
      default:
        throw problem(404, 'resource.not_found', 'The requested resource was not found.');
    }
  }

  // Session and dashboard.

  private session(): AuthSession {
    const staff = this.staffUser();

    if (staff !== null) {
      return {
        userType: 'STAFF',
        userId: staff.userId,
        candidateNumber: null,
        displayName: staff.displayName,
        email: staff.email,
        roles: [...staff.roles],
        activeRole: staff.activeRole,
        preferences: { timeZoneId: 'Asia/Dubai', culture: 'en-AE' },
      };
    }

    const candidate = this.candidate();

    return {
      userType: 'CANDIDATE',
      userId: candidate.userId,
      candidateNumber: candidate.candidateNumber,
      displayName: candidate.displayName,
      email: candidate.email,
      roles: ['CANDIDATE'],
      activeRole: 'CANDIDATE',
      preferences: { timeZoneId: 'Asia/Dubai', culture: 'en-AE' },
    };
  }

  /** PUT /auth/active-role: staff only, and only to a role the user holds (403 otherwise). */
  private switchActiveRole(body: { roleCode?: unknown }): AuthSession {
    const staff = this.staffUser();

    if (staff === null) {
      this.candidate();
      throw problem(403, 'auth.forbidden', 'Candidates cannot switch roles.');
    }

    if (typeof body.roleCode !== 'string' || !staff.roles.includes(body.roleCode)) {
      throw problem(403, 'auth.role_not_held', 'You do not hold that role.');
    }

    staff.activeRole = body.roleCode;
    this.save();

    return this.session();
  }

  private staffUser(): MockStaffUser | null {
    const userId = storedUserId();

    return userId ? (this.database.staff[userId] ?? null) : null;
  }

  private dashboard(): CandidateDashboard {
    const candidate = this.candidate();
    const active = candidate.applications.find(item => ACTIVE_STATUSES.includes(item.status));
    const order = (item: MockApplication): number => (ACTIVE_STATUSES.includes(item.status) ? 0 : 1);
    const items = [...candidate.applications]
      .sort((first, second) => order(first) - order(second) || second.createdAt.localeCompare(first.createdAt))
      .map(item => this.dashboardItem(item));

    return {
      startNewApplication: active ? { enabled: false, disabledReason: 'ACTIVE_APPLICATION_EXISTS' } : { enabled: true },
      sessionTimeoutMinutes: 30,
      items,
      page: { limit: 25, nextCursor: null },
    };
  }

  private dashboardItem(application: MockApplication): CandidateDashboardItem {
    const program = programOf(application);
    const announced = application.announcedScores;

    return {
      ...this.summary(application),
      submissionDeadline: program.applicationClosesAt ?? null,
      announcementDate: announced?.reannouncedAt ?? announced?.announcedAt ?? null,
      appealDeadline: this.appealOpen(application) ? (announced?.appealDeadline ?? null) : null,
      allowedActions: this.allowedActions(application),
    };
  }

  private allowedActions(application: MockApplication): CandidateApplicationAction[] {
    const rules = programRules(programOf(application));
    const actions: CandidateApplicationAction[] = ['VIEW'];

    switch (application.status) {
      case 'DRAFT':
        return [...actions, 'RESUME', 'DISCARD'];
      case 'ARCHIVED':
        return actions;
      case 'WITHDRAWN': {
        const otherActive = this.candidate().applications.some(item => item.id !== application.id && ACTIVE_STATUSES.includes(item.status));

        return application.reinstatementRequestedAt || otherActive ? actions : [...actions, 'REINSTATE'];
      }
      default: {
        actions.push('WITHDRAW');

        if (application.editPreferencesOpen && rules.maxPreferences === 2) {
          actions.push('EDIT_PREFERENCES');
        } else if (application.status !== 'SCREENED_OUT' && application.preferences.some(item => this.remainingSites(application, item).length > 1)) {
          actions.push('EXCLUDE_TRAINING_SITE');
        }

        if (this.appealOpen(application)) {
          actions.push('APPEAL');
        }

        return actions;
      }
    }
  }

  private appealOpen(application: MockApplication): boolean {
    const deadline = application.announcedScores?.appealDeadline;

    return (
      application.status === 'REVIEW_COMPLETED' &&
      application.appeal === null &&
      !application.announcedScores?.reannouncedAt &&
      typeof deadline === 'string' &&
      Date.parse(deadline) > Date.now()
    );
  }

  // Applications.

  private summary(application: MockApplication): ApplicationSummary {
    return {
      id: application.id,
      applicationNumber: application.applicationNumber,
      program: programOf(application),
      status: application.status,
      createdAt: application.createdAt,
      submittedAt: application.submittedAt,
      version: application.version,
      preferences: application.preferences.map(preference => ({
        ...preference,
        trainingSites: preference.trainingSites.filter(site => !application.excludedSiteIds.includes(site.siteId)),
      })),
      announcedScores: application.announcedScores,
    };
  }

  private toApplication(application: MockApplication): Application {
    return this.summary(application);
  }

  private create(body: { programId: string; preferences: Preference[] }): MockReply {
    const candidate = this.candidate();

    if (candidate.applications.some(item => ACTIVE_STATUSES.includes(item.status))) {
      throw problem(409, 'application.active_exists', 'You already have an active application in this cycle.');
    }

    if (!MOCK_PROGRAMS.some(item => item.id === body.programId)) {
      throw problem(422, 'application.program_not_open', 'This program is not open for applications.');
    }

    const now = new Date().toISOString();
    const sequence = ++this.database.sequence;
    const application: MockApplication = {
      id: crypto.randomUUID(),
      applicationNumber: `2026${String(sequence).padStart(7, '0')}`,
      programId: body.programId,
      status: 'DRAFT',
      previousStatus: null,
      createdAt: now,
      submittedAt: null,
      version: 1,
      preferences: [],
      sections: {},
      attachments: {},
      portfolio: null,
      paymentSessions: [],
      announcedScores: null,
      appeal: null,
      editPreferencesOpen: false,
      reinstatementRequestedAt: null,
      excludedSiteIds: [],
    };
    this.validatePreferences(application, body.preferences);
    application.preferences = body.preferences;
    candidate.applications.push(application);
    this.save();

    return ok(this.toApplication(application), etagOf(application.version), 201);
  }

  private setPreferences(application: MockApplication, preferences: Preference[]): void {
    this.validatePreferences(application, preferences);
    application.preferences = preferences;
    this.touch(application);
  }

  private validatePreferences(application: MockApplication, preferences: readonly Preference[]): void {
    const rules = programRules(programOf(application));
    const errors: { code: string; detail: string; pointer: string }[] = [];

    if (preferences.length < 1 || preferences.length > rules.maxPreferences) {
      errors.push({ code: 'preferences.count_invalid', detail: 'Choose the allowed number of preferences.', pointer: '/preferences' });
    }

    if (preferences.length === 2 && preferences[0]?.specialtyId === preferences[1]?.specialtyId) {
      errors.push({ code: 'preferences.duplicate_specialty', detail: 'The two preferences must be different specialties.', pointer: '/preferences/1/specialtyId' });
    }

    preferences.forEach((preference, index) => {
      if (preference.trainingSites.length === 0) {
        errors.push({ code: 'preferences.sites_required', detail: 'Choose at least one training site.', pointer: `/preferences/${index}/trainingSites` });
      }

      if (new Set(preference.trainingSites.map(site => site.siteId)).size !== preference.trainingSites.length) {
        errors.push({ code: 'preferences.duplicate_site', detail: 'A training site can be chosen only once per specialty.', pointer: `/preferences/${index}/trainingSites` });
      }
    });

    if (errors.length > 0) {
      throw problem(422, 'application.invalid_preferences', 'The preferences are not valid.', errors);
    }
  }

  private exclude(application: MockApplication, body: { siteIds: string[]; reason: string }): MockReply {
    if (!this.allowedActions(application).includes('EXCLUDE_TRAINING_SITE')) {
      throw problem(409, 'application.exclusion_not_allowed', 'Training sites can no longer be excluded.');
    }

    for (const preference of application.preferences) {
      const remaining = this.remainingSites(application, preference).filter(site => !body.siteIds.includes(site));

      if (remaining.length === 0) {
        throw problem(409, 'preferences.last_site', 'You cannot exclude the last training site of a specialty.');
      }
    }

    application.excludedSiteIds = [...new Set([...application.excludedSiteIds, ...body.siteIds])];
    this.touch(application);

    return ok(this.toApplication(application));
  }

  private remainingSites(application: MockApplication, preference: Preference): string[] {
    return preference.trainingSites.map(site => site.siteId).filter(site => !application.excludedSiteIds.includes(site));
  }

  // Corrections (US-2.3.4).

  /** PROPOSAL (PQ-04): the candidate's view of the flags while corrections are open. */
  private corrections(application: MockApplication): { flags: CorrectionFlag[]; correctionDeadline: string } {
    if (application.status !== 'CORRECTION_REQUIRED' || !application.correction) {
      throw problem(409, 'application.not_correction_required', 'This application has no corrections to make.');
    }

    return { flags: application.correction.flags, correctionDeadline: application.correction.deadline };
  }

  /** Saves the flagged sections only, then routes the application back to the same officer. */
  private submitCorrections(application: MockApplication, body: { sections?: Record<string, { values?: SectionValues }> }): MockReply {
    const correction = application.correction;

    if (application.status !== 'CORRECTION_REQUIRED' || !correction) {
      throw problem(409, 'application.not_correction_required', 'This application has no corrections to make.');
    }

    if (correction.deadline < new Date().toISOString()) {
      throw problem(409, 'application.correction_period_ended', 'The correction period has ended.');
    }

    const flagged = flaggedSectionKeys(correction);
    const sections = body.sections ?? {};
    const unexpected = Object.keys(sections).filter(key => !flagged.includes(key));

    if (unexpected.length > 0) {
      throw problem(
        422,
        'corrections.section_not_flagged',
        'Only the flagged sections can be corrected.',
        unexpected.map(key => ({ code: 'corrections.section_not_flagged', detail: 'This section was not flagged.', pointer: `/sections/${key}` })),
      );
    }

    const missingFiles = flaggedSlotIds(correction).filter(slotId => {
      const slot = this.slots(application).find(item => item.slotId === slotId);

      return slot !== undefined && slot.required && slot.attachment === null;
    });

    if (missingFiles.length > 0) {
      throw problem(422, 'corrections.document_missing', 'Upload the flagged documents before you re-submit.');
    }

    const candidate = this.candidate();

    for (const [key, input] of Object.entries(sections)) {
      const values = input.values ?? {};

      if (key === 'personal-information') {
        this.requireVerifiedContacts(candidate, values);
        candidate.profile = values as unknown as MockCandidate['profile'];
        candidate.profileVersion++;
      } else {
        const current = application.sections[key as ApplicationSectionKey];
        application.sections[key as ApplicationSectionKey] = { values, version: (current?.version ?? 0) + 1 };
      }
    }

    application.status = 'CORRECTION_SUBMITTED';
    application.correction = null;
    this.touch(application);

    return ok(this.workflow(application, 'CORRECTION_SUBMITTED'));
  }

  // Sections.

  private section(
    application: MockApplication,
    method: string,
    key: ApplicationSectionKey,
    body: unknown,
    ifMatch: string | null,
  ): MockReply {
    const rules = programRules(programOf(application));
    const applies = key === 'personal-information' || key === 'application-information' || rules.groups.includes(key);

    if (!applies) {
      throw problem(404, 'section.not_applicable', 'This section does not apply to the program.');
    }

    const candidate = this.candidate();

    if (method === 'PUT') {
      this.requireDraft(application);
      const values = (body as { values: SectionValues }).values;

      if (key === 'personal-information') {
        this.requireSectionVersion(candidate.profileVersion, ifMatch);
        this.requireVerifiedContacts(candidate, values);
        candidate.profile = values as unknown as MockCandidate['profile'];
        candidate.profileVersion++;
      } else {
        const current = application.sections[key];
        this.requireSectionVersion(current?.version ?? 0, ifMatch);
        application.sections[key] = { values, version: (current?.version ?? 0) + 1 };
      }

      this.touch(application);
    }

    const version = key === 'personal-information' ? candidate.profileVersion : (application.sections[key]?.version ?? 0);
    const section: ApplicationSection = {
      applicationId: application.id,
      sectionKey: key,
      schemaVersion: '2026.1',
      values: key === 'personal-information' ? (candidate.profile as unknown as SectionValues) : (application.sections[key]?.values ?? {}),
      fields: key === 'personal-information' ? this.personalFields(candidate) : [],
      editable: application.status === 'DRAFT' || (application.status === 'CORRECTION_REQUIRED' && flaggedSectionKeys(application.correction).includes(key)),
      version,
    };

    return ok(section, etagOf(version));
  }

  private personalFields(candidate: MockCandidate): SectionFieldState[] {
    return [
      ...candidate.icpFields.map(fieldCode => ({ fieldCode, readOnly: true, source: 'ICP' as const })),
      { fieldCode: 'contact.registeredEmail', readOnly: true, source: 'IDAM' as const },
      { fieldCode: 'contact.registeredMobile', readOnly: true, source: 'IDAM' as const },
    ];
  }

  private requireVerifiedContacts(candidate: MockCandidate, values: SectionValues): void {
    const contact = values['contact'] as Record<string, string> | undefined;
    const changed = [
      contact?.['contactEmail'] && contact['contactEmail'] !== candidate.email ? contact['contactEmail'] : null,
      contact?.['contactMobile'] && contact['contactMobile'] !== candidate.mobile ? contact['contactMobile'] : null,
    ].filter((value): value is string => value !== null);
    const unverified = changed.filter(value => !candidate.verifiedContacts.includes(value));

    if (unverified.length > 0) {
      throw problem(422, 'contact.not_verified', 'Verify your changed contact details before saving.', [
        { code: 'contact.not_verified', detail: 'This contact has not been verified.', pointer: '/values/contact' },
      ]);
    }
  }

  // Attachments.

  private slots(application: MockApplication): AttachmentSlot[] {
    return attachmentSlots(application, this.candidate(), programRules(programOf(application)));
  }

  private attachment(application: MockApplication, method: string, rest: string, body: unknown): MockReply {
    const slotId = rest.replace(/\/content$/, '');
    const slot = this.slots(application).find(item => item.slotId === slotId);

    if (!slot) {
      throw problem(404, 'attachment.slot_not_found', 'This document is not required for the application.');
    }

    if (!slot.editable) {
      throw problem(409, 'attachment.not_editable', 'This document can no longer be changed.');
    }

    if (method === 'DELETE') {
      application.attachments = Object.fromEntries(Object.entries(application.attachments).filter(([key]) => key !== slotId));
      this.touch(application);

      return ok({ ...slot, attachment: null });
    }

    const file = body instanceof FormData ? body.get('file') : null;

    if (!(file instanceof File)) {
      throw problem(422, 'attachment.empty', 'The file is empty.');
    }

    if (file.size > slot.maxFileSizeBytes) {
      throw problem(413, 'attachment.too_large', 'The file is larger than 2 MB.');
    }

    if (!slot.allowedMediaTypes.includes(file.type)) {
      throw problem(415, 'attachment.type_not_allowed', 'This file type is not allowed.');
    }

    const metadata: AttachmentMetadata = {
      attachmentId: crypto.randomUUID(),
      version: (application.attachments[slotId]?.version ?? 0) + 1,
      fileName: file.name,
      mediaType: file.type,
      sizeBytes: file.size,
      uploadedAt: new Date().toISOString(),
    };
    application.attachments[slotId] = metadata;
    this.touch(application);

    return ok(metadata);
  }

  // Portfolio.

  private portfolio(application: MockApplication): PortfolioSubmission {
    return application.portfolio
      ? { submittedAt: application.portfolio.submittedAt, immutable: true, answers: application.portfolio.answers }
      : { submittedAt: null, immutable: false, answers: [] };
  }

  private submitPortfolio(application: MockApplication, body: { answers: PortfolioAnswer[] }): MockReply {
    this.requireDraft(application);

    if (application.portfolio) {
      throw problem(409, 'portfolio.already_submitted', 'The portfolio has already been submitted.');
    }

    const questions = portfolioQuestions(programRules(programOf(application)).portfolioSet);

    if (questions.some(question => !body.answers.some(answer => answer.questionId === question.id))) {
      throw problem(422, 'portfolio.incomplete', 'Answer every portfolio question.');
    }

    application.portfolio = { submittedAt: new Date().toISOString(), answers: body.answers };
    this.touch(application);

    return ok(this.portfolio(application), undefined, 201);
  }

  // Payment and submission.

  private createPayment(application: MockApplication): MockReply {
    if (application.status !== 'DRAFT') {
      throw problem(409, 'application.not_payable', 'This application cannot be paid.');
    }

    const missing = this.missingForSubmission(application);

    if (missing.length > 0) {
      throw problem(422, 'application.incomplete', 'Complete the application before you pay.', missing);
    }

    const paid = application.paymentSessions.find(item => item.status === 'PAID');

    if (paid) {
      return ok(paid, undefined, 201);
    }

    const id = crypto.randomUUID();
    const session: PaymentSession = {
      id,
      applicationId: application.id,
      amount: programRules(programOf(application)).feeAed,
      currency: 'AED',
      status: 'PENDING',
      checkoutUrl: `/mock-payment-gateway?applicationId=${encodeURIComponent(application.id)}&paymentSessionId=${id}`,
      checkoutExpiresAt: new Date(Date.now() + 30 * 60_000).toISOString(),
      receiptId: null,
      paymentDate: null,
    };
    application.paymentSessions.push(session);
    this.save();

    return ok(session, undefined, 201);
  }

  private missingForSubmission(application: MockApplication): { code: string; detail: string; pointer: string }[] {
    const missing: { code: string; detail: string; pointer: string }[] = [];
    const info = application.sections['application-information']?.values;

    if (info?.['termsAccepted'] !== true) {
      missing.push({ code: 'terms.not_accepted', detail: 'Accept the terms and conditions.', pointer: '/sections/application-information/termsAccepted' });
    }

    if (!application.portfolio) {
      missing.push({ code: 'portfolio.not_submitted', detail: 'Submit your portfolio.', pointer: '/portfolio' });
    }

    for (const slot of this.slots(application)) {
      if (slot.required && slot.attachment === null) {
        missing.push({ code: 'attachment.required', detail: `Upload: ${slot.label}.`, pointer: `/attachments/${slot.slotId}` });
      }
    }

    return missing;
  }

  private submit(application: MockApplication, body: { paymentSessionId: string }): MockReply {
    const session = application.paymentSessions.find(item => item.id === body.paymentSessionId);

    if (application.status === 'SUBMITTED') {
      return ok(this.toApplication(application));
    }

    if (session?.status !== 'PAID') {
      throw problem(409, 'payment.not_paid', 'The payment has not been completed.');
    }

    application.status = 'SUBMITTED';
    application.submittedAt = new Date().toISOString();
    application.editPreferencesOpen = programRules(programOf(application)).maxPreferences === 2;
    this.touch(application);

    return ok(this.toApplication(application));
  }

  // Withdrawal and contact verification.

  private startWithdrawal(application: MockApplication, body: { reasonCode: string; otherReason?: string }): MockReply {
    if (!this.allowedActions(application).includes('WITHDRAW')) {
      throw problem(409, 'application.not_withdrawable', 'This application cannot be withdrawn.');
    }

    if (body.reasonCode === 'OTHER' && (body.otherReason ?? '').trim().length < 3) {
      throw problem(422, 'request.validation_failed', 'Describe the reason in at least 3 letters.', [
        { code: 'field.invalid', detail: 'Describe the reason in at least 3 letters.', pointer: '/otherReason' },
      ]);
    }

    const requestId = crypto.randomUUID();
    this.withdrawals.set(requestId, { applicationId: application.id, reasonCode: body.reasonCode });
    const challenge: WithdrawalChallenge = { requestId, ...this.challenge() };

    return ok(challenge, undefined, 202);
  }

  private challenge(): Omit<WithdrawalChallenge, 'requestId'> {
    const candidate = this.candidate();

    return {
      expiresAt: new Date(Date.now() + 10 * 60_000).toISOString(),
      resendAvailableAt: new Date(Date.now() + 30_000).toISOString(),
      destinations: [
        { channel: 'EMAIL', maskedValue: mask(candidate.email) },
        { channel: 'SMS', maskedValue: mask(candidate.mobile) },
      ],
    };
  }

  private confirmWithdrawal(application: MockApplication, requestId: string, body: { otp: string }): MockReply {
    if (!this.withdrawals.has(requestId)) {
      throw problem(409, 'otp.expired', 'This code has expired. Start the withdrawal again.');
    }

    if (body.otp !== MOCK_OTP) {
      throw problem(422, 'otp.invalid', 'The code is not correct.');
    }

    this.withdrawals.delete(requestId);
    application.previousStatus = application.status;
    application.status = 'WITHDRAWN';
    application.editPreferencesOpen = false;
    this.touch(application);

    return ok(this.workflow(application));
  }

  private startVerification(body: { channel: 'EMAIL' | 'SMS'; value: string }): MockReply {
    const id = crypto.randomUUID();
    this.verifications.set(id, body);

    return ok(this.verification(id, body.channel, body.value), undefined, 202);
  }

  private verification(verificationId: string, channel: 'EMAIL' | 'SMS', value: string): ContactVerification {
    return {
      verificationId,
      channel,
      destination: { channel, maskedValue: mask(value) },
      expiresAt: new Date(Date.now() + 10 * 60_000).toISOString(),
      resendAvailableAt: new Date(Date.now() + 30_000).toISOString(),
    };
  }

  private confirmVerification(verificationId: string, body: { otp: string }): MockReply {
    const pending = this.verifications.get(verificationId);

    if (!pending) {
      throw problem(409, 'otp.expired', 'This code has expired. Request a new one.');
    }

    if (body.otp !== MOCK_OTP) {
      throw problem(422, 'otp.invalid', 'The code is not correct.');
    }

    this.candidate().verifiedContacts.push(pending.value);
    this.verifications.delete(verificationId);
    this.save();
    const now = new Date();

    return ok({ verifiedAt: now.toISOString(), validUntil: new Date(now.getTime() + 24 * 3_600_000).toISOString() });
  }

  // Portfolio result and appeal.

  private portfolioResult(application: MockApplication): CandidatePortfolioResult {
    const scores = application.announcedScores;

    if (!scores || !application.portfolio) {
      throw problem(404, 'portfolio.scores_not_announced', 'Portfolio scores have not been announced yet.');
    }

    const questions = portfolioQuestions(programRules(programOf(application)).portfolioSet);
    const awarded: Record<string, number> = { 'FEL-Q1': 5, 'FEL-Q3': 0, 'FEL-Q5': 5 };
    const comments: Record<string, string[]> = {
      'FEL-Q3': ['The certificate does not show the stamp and signature of the institution.'],
    };

    return {
      applicationId: application.id,
      applicationNumber: application.applicationNumber,
      announcedAt: scores.announcedAt,
      finalPortfolioPoints: scores.finalPortfolioScore,
      portfolioScore: scores.finalPortfolioScore,
      appeal: {
        status: application.appeal ? 'SUBMITTED' : this.appealOpen(application) ? 'OPEN' : 'CLOSED',
        deadline: scores.appealDeadline ?? null,
        submittedAt: application.appeal?.submittedAt ?? null,
        timeZoneId: 'Asia/Dubai',
      },
      questions: questions.map(question => {
        const answer = application.portfolio?.answers.find(item => item.questionId === question.id);
        const points = awarded[question.id] ?? 0;

        return {
          questionId: question.id,
          prompt: question.prompt,
          candidateAnswer: answer?.answer ?? 'NO',
          details: answer?.details ?? {},
          evidence: [],
          maxPoints: 5,
          awardedPoints: answer?.answer === 'YES' ? points : 0,
          comments: comments[question.id] ?? [],
          appealable: answer?.answer === 'YES' && points < 5,
          appealResponse: application.appeal?.responses.find(item => item.questionId === question.id)?.response ?? null,
        };
      }),
    };
  }

  private appeal(application: MockApplication, body: { responses: { questionId: string; response: string }[] }): MockReply {
    if (!this.appealOpen(application)) {
      throw problem(409, 'appeal.not_available', 'The appeal window is closed or an appeal was already submitted.');
    }

    if (body.responses.length === 0 || body.responses.some(item => item.response.trim() === '' || item.response.length > 200)) {
      throw problem(422, 'request.validation_failed', 'Give a response of up to 200 characters for each appealed question.');
    }

    application.appeal = { submittedAt: new Date().toISOString(), responses: body.responses };
    application.status = 'APPEAL_UNDER_REVIEW';
    this.touch(application);

    return ok(this.workflow(application), undefined, 202);
  }

  // Helpers.

  private workflow(application: MockApplication, status: string = application.status): WorkflowActionResult {
    return {
      resourceId: application.id,
      status,
      effectiveAt: new Date().toISOString(),
      auditEventId: crypto.randomUUID(),
    };
  }

  private candidate(): MockCandidate {
    const userId = storedUserId();
    const candidate = userId ? this.database.candidates[userId] : undefined;

    if (!candidate) {
      throw problem(401, 'auth.token_invalid', 'Your session has ended. Please sign in again.');
    }

    return candidate;
  }

  private application(id: string): MockApplication {
    const application = this.candidate().applications.find(item => item.id === id);

    if (!application) {
      throw problem(404, 'resource.not_found', 'The application was not found.');
    }

    return application;
  }

  private findApplicationAnywhere(id: string): MockApplication | undefined {
    return Object.values(this.database.candidates)
      .flatMap(item => item.applications)
      .find(item => item.id === id);
  }

  private requireDraft(application: MockApplication): void {
    if (application.status !== 'DRAFT') {
      throw problem(409, 'application.not_editable', 'This application can no longer be changed.');
    }
  }

  private requireVersion(application: MockApplication, ifMatch: string | null): void {
    this.requireSectionVersion(application.version, ifMatch);
  }

  private requireSectionVersion(version: number, ifMatch: string | null): void {
    if (!ifMatch) {
      throw problem(428, 'request.precondition_required', 'The If-Match header is required.');
    }

    if (ifMatch !== etagOf(version)) {
      throw problem(412, 'request.precondition_failed', 'This was changed somewhere else. Load the latest version.');
    }
  }

  private touch(application: MockApplication): void {
    application.version++;
    this.save();
  }

  private save(): void {
    saveDatabase(this.database);
  }
}

const WITHDRAWAL_REASONS: LookupItem[] = [
  { code: 'NOT_ELIGIBLE', label: 'Not meeting eligibility criteria', sortOrder: 1, active: true },
  { code: 'OTHER_PROGRAM', label: 'Joining another training program', sortOrder: 2, active: true },
  { code: 'PERSONAL', label: 'Personal reasons', sortOrder: 3, active: true },
  { code: 'FINANCIAL', label: 'Financial reasons', sortOrder: 4, active: true },
  { code: 'SCHOLARSHIP', label: 'Scholarship opportunity', sortOrder: 5, active: true },
  { code: 'OTHER', label: 'Others', sortOrder: 6, active: true },
];

function mask(value: string): string {
  if (value.includes('@')) {
    const [name = '', domain = ''] = value.split('@');

    return `${name.slice(0, 2)}${'•'.repeat(Math.max(name.length - 2, 1))}@${domain}`;
  }

  return `${value.slice(0, 4)}${'•'.repeat(Math.max(value.length - 7, 1))}${value.slice(-3)}`;
}

export { MOCK_CYCLE };
