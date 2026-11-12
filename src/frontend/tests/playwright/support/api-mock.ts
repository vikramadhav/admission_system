import { Page, Request, Route } from '@playwright/test';

import { corsHeaders } from './cors';

/** API base URL of the portal's development environment. */
export const API_BASE = 'https://localhost:5001/api/v1';

const CYCLE_ID = '6f1c2a10-0000-4000-8000-000000000001';

export const PROGRAMS = [
  { id: '7a000000-0000-4000-8000-000000000001', code: 'INT', name: 'Internship', category: 'INTERNSHIP', cycleId: CYCLE_ID },
  { id: '7a000000-0000-4000-8000-000000000002', code: 'MRES', name: 'Medical Residency', category: 'RESIDENCY', cycleId: CYCLE_ID },
];

export const SPECIALTIES = [
  { id: '5b000000-0000-4000-8000-000000000001', code: 'EM', name: 'Emergency Medicine' },
  { id: '5b000000-0000-4000-8000-000000000002', code: 'FM', name: 'Family Medicine' },
];

export const SITES = [
  { id: '3c000000-0000-4000-8000-000000000001', code: 'RH', name: 'Rashid Hospital' },
  { id: '3c000000-0000-4000-8000-000000000002', code: 'DH', name: 'Dubai Hospital' },
  { id: '3c000000-0000-4000-8000-000000000003', code: 'LH', name: 'Latifa Hospital' },
];

interface StoredApplication {
  id: string;
  applicationNumber: string;
  program: (typeof PROGRAMS)[number];
  status: string;
  createdAt: string;
  submittedAt: null;
  version: number;
  preferences: unknown[];
}

export interface RecordedRequest {
  readonly method: string;
  readonly path: string;
  readonly headers: Record<string, string>;
  readonly body: unknown;
}

interface StartNewOverride {
  enabled: boolean;
  disabledReason: string | null;
  nextCycleOpensAt: string | null;
}

/**
 * A small in-memory DAHC API following the contract for the D1 operations: ApiResponse
 * envelopes, Problem Details errors, ETag and If-Match on drafts, Idempotency-Key on create.
 */
export class ApiMock {
  readonly requests: RecordedRequest[] = [];
  readonly applications: StoredApplication[] = [];
  signInProblem: { status: number; code: string; detail: string } | null = null;
  startNewOverride: StartNewOverride | null = null;
  /** When set, the next draft save answers 412 as if the draft changed elsewhere. */
  failNextSaveWithStaleVersion = false;

  async install(page: Page): Promise<void> {
    await page.route(url => url.href.startsWith(API_BASE), route => this.handle(route));
  }

  requestsTo(method: string, path: string): RecordedRequest[] {
    return this.requests.filter(request => request.method === method && request.path === path);
  }

  private async handle(route: Route): Promise<void> {
    const request = route.request();

    if (request.method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: corsHeaders() });

      return;
    }

    const url = new URL(request.url());
    const path = url.pathname.replace('/api/v1', '');
    this.requests.push({ method: request.method(), path, headers: request.headers(), body: parseBody(request) });

    if (request.headers()['authorization'] === undefined) {
      await this.problem(route, 401, 'auth.token_missing', 'Sign in to continue.');

      return;
    }

    await this.route(route, request.method(), path, request);
  }

  private async route(route: Route, method: string, path: string, request: Request): Promise<void> {
    const applicationMatch = /^\/applications\/([^/]+)$/.exec(path);

    if (method === 'POST' && path === '/auth/sign-in') {
      if (this.signInProblem) {
        await this.problem(route, this.signInProblem.status, this.signInProblem.code, this.signInProblem.detail);

        return;
      }

      await this.ok(route, this.session());
    } else if (method === 'GET' && path === '/auth/me') {
      await this.ok(route, this.session());
    } else if (method === 'GET' && path === '/me/dashboard') {
      await this.ok(route, this.dashboard(), this.applications.length === 0 ? 'applications.none_active' : null);
    } else if (method === 'GET' && path === '/programs') {
      await this.ok(route, PROGRAMS);
    } else if (method === 'GET' && /^\/programs\/[^/]+\/specialties$/.test(path)) {
      await this.ok(route, SPECIALTIES);
    } else if (method === 'GET' && /^\/specialties\/[^/]+\/sites$/.test(path)) {
      await this.ok(route, SITES);
    } else if (method === 'POST' && path === '/applications') {
      await this.createApplication(route, request);
    } else if (method === 'GET' && applicationMatch?.[1]) {
      await this.getApplication(route, applicationMatch[1]);
    } else if (method === 'PATCH' && applicationMatch?.[1]) {
      await this.updateApplication(route, applicationMatch[1], request);
    } else {
      await this.problem(route, 404, 'resource.not_found', 'Not found.');
    }
  }

  private session(): Record<string, unknown> {
    return {
      userType: 'CANDIDATE',
      userId: '9d000000-0000-4000-8000-000000000001',
      candidateNumber: '000000123',
      displayName: 'Aisha',
      email: null,
      roles: ['CANDIDATE'],
      activeRole: 'CANDIDATE',
      preferences: { timeZoneId: 'Asia/Dubai', culture: 'en-AE' },
    };
  }

  private dashboard(): Record<string, unknown> {
    const hasActive = this.applications.some(application => application.status === 'DRAFT');
    const startNewApplication = this.startNewOverride ?? {
      enabled: !hasActive,
      disabledReason: hasActive ? 'ACTIVE_APPLICATION_EXISTS' : null,
      nextCycleOpensAt: null,
    };

    return {
      startNewApplication,
      sessionTimeoutMinutes: 20,
      items: this.applications.map(application => ({
        ...application,
        submissionDeadline: '2026-12-31T19:59:00Z',
        announcementDate: null,
        appealDeadline: null,
        allowedActions: application.status === 'DRAFT' ? ['RESUME', 'DISCARD'] : ['VIEW'],
      })),
      page: { limit: 25, nextCursor: null },
    };
  }

  private async createApplication(route: Route, request: Request): Promise<void> {
    if (!request.headers()['idempotency-key']) {
      await this.problem(route, 400, 'request.idempotency_key_required', 'Idempotency-Key is required.');

      return;
    }

    const body = parseBody(request) as { programId: string; preferences: unknown[] };
    const program = PROGRAMS.find(candidate => candidate.id === body.programId) ?? PROGRAMS[0];

    if (!program) {
      await this.problem(route, 422, 'request.validation_failed', 'Unknown program.');

      return;
    }

    const application: StoredApplication = {
      id: `a1000000-0000-4000-8000-00000000000${this.applications.length + 1}`,
      applicationNumber: `2027000000${this.applications.length + 1}`,
      program,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      submittedAt: null,
      version: 1,
      preferences: body.preferences,
    };
    this.applications.push(application);

    await this.ok(route, application, null, 201, `"v${application.version}"`);
  }

  private async getApplication(route: Route, id: string): Promise<void> {
    const application = this.applications.find(candidate => candidate.id === id);

    if (!application) {
      await this.problem(route, 404, 'application.not_found', 'This application was not found.');

      return;
    }

    await this.ok(route, application, null, 200, `"v${application.version}"`);
  }

  private async updateApplication(route: Route, id: string, request: Request): Promise<void> {
    const application = this.applications.find(candidate => candidate.id === id);

    if (!application) {
      await this.problem(route, 404, 'application.not_found', 'This application was not found.');

      return;
    }

    if (this.failNextSaveWithStaleVersion || request.headers()['if-match'] !== `"v${application.version}"`) {
      this.failNextSaveWithStaleVersion = false;
      await this.problem(route, 412, 'request.precondition_failed', 'This draft was changed since you opened it.');

      return;
    }

    const body = parseBody(request) as { preferences: unknown[] };
    application.preferences = body.preferences;
    application.version += 1;

    await this.ok(route, application, null, 200, `"v${application.version}"`);
  }

  private async ok(route: Route, data: unknown, messageCode: string | null = null, status = 200, etag?: string): Promise<void> {
    const headers: Record<string, string> = { ...corsHeaders(), 'x-request-id': 'test-request' };

    if (etag) {
      headers['etag'] = etag;
    }

    const pagination = Array.isArray(data) ? { limit: 25, nextCursor: null } : undefined;
    const message = messageCode === null ? null : 'You have not started an application yet.';
    await route.fulfill({ status, json: { data, messageCode, message, pagination }, headers });
  }

  private async problem(route: Route, status: number, code: string, detail: string): Promise<void> {
    await route.fulfill({
      status,
      contentType: 'application/problem+json',
      headers: corsHeaders(),
      body: JSON.stringify({
        type: 'about:blank',
        title: detail,
        status,
        code,
        detail,
        traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
      }),
    });
  }
}

function parseBody(request: Request): unknown {
  const text = request.postData();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}
