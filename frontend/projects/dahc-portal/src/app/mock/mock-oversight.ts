import { IntegrationClient, StaffRoleAssignment, StaffUser } from '../api/admin.models';
import { ApplicationStatus } from '../api/application.models';
import { PaymentRecord } from '../api/finance.models';
import { MonitoringApplicationRow, SiteMonitoringDashboard } from '../api/monitoring.models';
import { MOCK_CYCLE, MOCK_PROGRAMS, MOCK_SITES } from './mock-catalog';
import { MockAdmissionState, MockReviewApplication } from './mock-admission-seed';
import { MockReply, ok, problem } from './mock-http';
import { MockStaffUser } from './mock-store';

const DAY = 86_400_000;

/** The previous admission cycle, so the finance and monitoring cycle filters have a choice. */
export const MOCK_PREVIOUS_CYCLE = { id: '6f1c0000-0000-4000-8000-000000002025', label: '2025-2026' };

export interface MockAdminUser {
  staffUserId: string;
  idamUserId: string;
  displayName: string;
  email: string;
  isActive: boolean;
  hasSignedIn: boolean;
  linkedCandidateId: string | null;
  roles: StaffRoleAssignment[];
  activeRole: string | null;
  version: number;
}

export interface MockOversightState {
  payments: (PaymentRecord & { cycleId: string; programId: string })[];
  adminUsers: MockAdminUser[];
  clients: MockIntegrationClient[];
}

export interface MockIntegrationClient {
  integrationClientId: string;
  idamClientId: string;
  name: string;
  isActive: boolean;
  permissions: string[];
  version: string;
  versionNumber: number;
}

function iso(offsetDays: number, hour = 9): string {
  const date = new Date(Date.now() + offsetDays * DAY);
  date.setUTCHours(hour, 15, 0, 0);

  return date.toISOString();
}

export function seedOversight(staff: readonly MockStaffUser[]): MockOversightState {
  const names = ['Ahmed Al Mazrouei', 'Sara Haddad', 'Hamdan Al Ketbi', 'Mariam Rahman', 'Yousef Al Shamsi', 'Layan Nasser', 'Rashed Al Suwaidi', 'Noor Farouk', 'Khalifa Al Nuaimi', 'Hessa Saleh'];
  const statuses: PaymentRecord['billStatus'][] = ['PAID', 'PAID', 'PAID', 'PENDING', 'PAID', 'FAILED', 'PAID', 'PAID', 'NA', 'PAID'];
  const programs = MOCK_PROGRAMS.filter(program => program.id !== 'p-cert-mls');
  const payments: MockOversightState['payments'] = [];

  for (let index = 0; index < 30; index++) {
    const program = programs[index % programs.length] ?? programs[0];
    const previous = index >= 24;
    const status = statuses[index % statuses.length] ?? 'PAID';
    const name = names[index % names.length] ?? 'Candidate';

    payments.push({
      applicationId: `pay-app-${index}`,
      applicationNumber: `${previous ? '2025' : '2026'}${String(100 + index * 13).padStart(7, '0')}`,
      candidateDisplayName: name,
      email: `${name.toLowerCase().replace(/[^a-z]+/g, '.')}@example.com`,
      program: program?.name ?? 'Medical Residency',
      programId: program?.id ?? 'p-res-med',
      cycleId: previous ? MOCK_PREVIOUS_CYCLE.id : MOCK_CYCLE.id,
      feeType: 'Application Submission Fee',
      billStatus: status,
      billAmount: program?.category === 'INTERNSHIP' ? 230 : 650,
      paymentDate: status === 'PAID' ? iso(-(previous ? 300 + index : index * 2)) : null,
    });
  }

  return {
    payments,
    adminUsers: staff.map((user, index) => ({
      staffUserId: `su-${user.userId}`,
      idamUserId: `idam|${user.userId}`,
      displayName: user.displayName,
      email: user.email,
      isActive: true,
      hasSignedIn: index % 3 !== 2,
      linkedCandidateId: null,
      roles: user.roles.map(roleCode => ({ roleCode, programId: null, specialtyId: null, poolIds: [], validFrom: null, validTo: null })),
      activeRole: user.activeRole,
      version: 1,
    })),
    clients: [
      {
        integrationClientId: 'ic-payments',
        idamClientId: 'dahc-payment-gateway',
        name: 'Payment gateway adapter',
        isActive: true,
        permissions: ['payments.events-write'],
        version: 'v1',
        versionNumber: 1,
      },
    ],
  };
}

/**
 * Mock of the finance payments, central site monitoring and administration operations. Charts
 * are derived from the admission back-office applications, each given one or two training sites.
 */
export class MockOversight {
  constructor(
    private readonly state: () => MockOversightState,
    private readonly admission: () => MockAdmissionState,
    private readonly save: () => void,
    private readonly user: () => MockStaffUser | null,
    private readonly staffRecords: () => Record<string, MockStaffUser>,
  ) {}

  handle(method: string, fullPath: string, body: unknown, headers: { get(name: string): string | null }): MockReply | null {
    const [path = '', queryString = ''] = fullPath.split('?');
    const query = new URLSearchParams(queryString);
    let m: RegExpMatchArray | null;

    if (method === 'GET' && path === '/finance/payments') {
      this.requireRole('FINANCE_OFFICER');

      return this.paged(this.payments(query), query);
    }

    if (method === 'GET' && path === '/staff/site-monitoring/dashboard') {
      this.requireRole('CENTRAL_MONITOR', 'ADMISSION_SUPERVISOR');

      return ok(this.dashboard(query));
    }

    if (method === 'GET' && path === '/staff/site-monitoring/applications') {
      this.requireRole('CENTRAL_MONITOR', 'ADMISSION_SUPERVISOR');

      return this.paged(this.monitoringRows(query), query);
    }

    if (path.startsWith('/admin/')) {
      this.requireRole('ADMINISTRATOR');
    }

    if (method === 'GET' && path === '/admin/staff-users') {
      const q = query.get('q')?.toLowerCase() ?? '';
      const role = query.get('roleCode');
      const active = query.get('isActive');
      const users = this.state()
        .adminUsers.filter(user => !q || user.displayName.toLowerCase().includes(q) || user.email.toLowerCase().includes(q))
        .filter(user => !role || user.roles.some(entry => entry.roleCode === role))
        .filter(user => active === null || String(user.isActive) === active)
        .map(user => staffUser(user));

      return this.paged(users, query);
    }

    if (method === 'POST' && path === '/admin/staff-users') {
      return this.preRegister(body as Partial<MockAdminUser> & { roles?: StaffRoleAssignment[] });
    }

    if ((m = path.match(/^\/admin\/staff-users\/([^/]+)(\/.*)?$/))) {
      return this.staffUserOperation(method, decodeURIComponent(m[1] ?? ''), m[2] ?? '', body, headers);
    }

    if (method === 'GET' && path === '/admin/integration-clients') {
      return this.paged(this.state().clients.map(client => publicClient(client)), query);
    }

    if (method === 'POST' && path === '/admin/integration-clients') {
      const input = body as { idamClientId?: string; name?: string; isActive?: boolean; permissions?: string[] };
      requireText(input.idamClientId, 'idamClientId', 'Enter the IDAM client id.');
      requireText(input.name, 'name', 'Enter a name.');

      if (this.state().clients.some(client => client.idamClientId === input.idamClientId)) {
        throw problem(409, 'integration.already_registered', 'An integration client with this IDAM client id is already registered.');
      }

      const client = { integrationClientId: crypto.randomUUID(), idamClientId: input.idamClientId ?? '', name: input.name ?? '', isActive: input.isActive ?? true, permissions: input.permissions ?? [], version: 'v1', versionNumber: 1 };
      this.state().clients.push(client);
      this.save();

      return ok(publicClient(client), undefined, 201);
    }

    if (method === 'PUT' && (m = path.match(/^\/admin\/integration-clients\/([^/]+)$/))) {
      const client = this.state().clients.find(entry => entry.integrationClientId === decodeURIComponent(m?.[1] ?? ''));

      if (!client) {
        throw problem(404, 'resource.not_found', 'The integration client was not found.');
      }

      requireVersion(headers, client.version);
      const input = body as { name?: string; isActive?: boolean; permissions?: string[] };
      requireText(input.name, 'name', 'Enter a name.');
      client.name = input.name ?? client.name;
      client.isActive = input.isActive ?? client.isActive;
      client.permissions = input.permissions ?? client.permissions;
      client.versionNumber += 1;
      client.version = `v${client.versionNumber}`;
      this.save();

      return ok(publicClient(client));
    }

    return null;
  }

  // Finance.

  private payments(query: URLSearchParams): PaymentRecord[] {
    const from = query.get('from');
    const to = query.get('to');

    if (from && to && to < from) {
      throw problem(400, 'request.validation_failed', 'The "to" date must be on or after the "from" date.', [{ code: 'range', detail: 'Must be on or after the from date.', pointer: '/to' }]);
    }

    const number = query.get('applicationNumber')?.trim();

    return this.state()
      .payments.filter(item => !query.get('cycleId') || item.cycleId === query.get('cycleId'))
      .filter(item => !query.get('programId') || item.programId === query.get('programId'))
      .filter(item => !number || item.applicationNumber.includes(number))
      .filter(item => !from || (item.paymentDate !== null && item.paymentDate !== undefined && item.paymentDate.slice(0, 10) >= from))
      .filter(item => !to || (item.paymentDate !== null && item.paymentDate !== undefined && item.paymentDate.slice(0, 10) <= to))
      .sort((first, second) => (second.paymentDate ?? '').localeCompare(first.paymentDate ?? ''))
      .map(item => ({
        applicationId: item.applicationId,
        applicationNumber: item.applicationNumber,
        candidateDisplayName: item.candidateDisplayName ?? '',
        email: item.email ?? '',
        program: item.program,
        feeType: item.feeType,
        billStatus: item.billStatus,
        billAmount: item.billAmount,
        paymentDate: item.paymentDate ?? null,
      }));
  }

  /** The export file (the interceptor turns this into an .xlsx-typed blob). */
  exportFile(fullPath: string): Blob {
    this.requireRole('FINANCE_OFFICER');
    const rows = this.payments(new URLSearchParams(fullPath.split('?')[1] ?? ''));
    const lines = [
      'Application ID,English full name,Email,Program,Fee type,Bill status,Amount (AED),Payment date',
      ...rows.map(row => [row.applicationNumber, row.candidateDisplayName, row.email, row.program, row.feeType, row.billStatus, row.billAmount, row.paymentDate ?? ''].join(',')),
    ];

    return new Blob([lines.join('\n')], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  // Monitoring.

  private dashboard(query: URLSearchParams): SiteMonitoringDashboard {
    const applications = this.filteredApplications(query);
    const siteInterest = new Map<string, { siteId: string; siteName: string; specialtyId: string; specialtyName: string; selectionCount: number }>();
    const byStatus = new Map<string, { applicationStatus: ApplicationStatus; siteId: string; siteName: string; applicationCount: number }>();
    const byProgram = new Map<string, { programId: string; programName: string; siteId: string; siteName: string; applicationCount: number }>();

    for (const item of applications) {
      for (const site of sitesOf(item)) {
        const specialtyId = `sp-${item.specialtyName.toLowerCase().replace(/[^a-z]+/g, '-')}`;
        const interest = siteInterest.get(`${site.id}|${specialtyId}`) ?? { siteId: site.id, siteName: site.name, specialtyId, specialtyName: item.specialtyName, selectionCount: 0 };
        interest.selectionCount += 1;
        siteInterest.set(`${site.id}|${specialtyId}`, interest);
        const status = byStatus.get(`${item.applicationStatus}|${site.id}`) ?? { applicationStatus: item.applicationStatus, siteId: site.id, siteName: site.name, applicationCount: 0 };
        status.applicationCount += 1;
        byStatus.set(`${item.applicationStatus}|${site.id}`, status);
        const program = byProgram.get(`${item.programId}|${site.id}`) ?? { programId: item.programId, programName: item.programName, siteId: site.id, siteName: site.name, applicationCount: 0 };
        program.applicationCount += 1;
        byProgram.set(`${item.programId}|${site.id}`, program);
      }
    }

    const count = (statuses: readonly string[]): number => applications.filter(item => statuses.includes(item.verificationStatus)).length;

    return {
      poolInsights: {
        submitted: count(['PENDING']),
        underVerification: count(['IN_PROGRESS', 'CLARIFICATION_SUBMITTED', 'RE_EVALUATING', 'CORRECTION_SUBMITTED']),
        pendingWithCandidate: count(['CORRECTION_REQUIRED']),
        screenedOut: count(['SCREEN_OUT_PENDING_APPROVAL', 'SCREENED_OUT']),
        completed: count(['COMPLETE']),
      },
      siteInterestBySpecialty: [...siteInterest.values()],
      siteApplicationsByStatus: [...byStatus.values()],
      siteApplicationsByProgram: [...byProgram.values()],
      generatedAt: new Date().toISOString(),
    };
  }

  private monitoringRows(query: URLSearchParams): MonitoringApplicationRow[] {
    const specialtyId = query.get('specialtyId');
    const status = query.get('applicationStatus');

    return this.filteredApplications(query)
      .filter(item => !specialtyId || `sp-${item.specialtyName.toLowerCase().replace(/[^a-z]+/g, '-')}` === specialtyId)
      .filter(item => !status || item.applicationStatus === status)
      .sort((first, second) => second.submittedAt.localeCompare(first.submittedAt))
      .map(item => ({
        applicationId: item.applicationId,
        applicationNumber: item.applicationNumber,
        candidateName: item.candidateName,
        cycleId: MOCK_CYCLE.id,
        cycleName: MOCK_CYCLE.label,
        programName: item.programName,
        applicationStatus: item.applicationStatus,
        verificationStatus: item.verificationStatus,
        portfolioStatus: item.portfolioStatus,
        submittedAt: item.submittedAt,
      }));
  }

  private filteredApplications(query: URLSearchParams): MockReviewApplication[] {
    const cycle = query.get('cycleId');
    const program = query.get('programId');
    const site = query.get('siteId');

    if (cycle && cycle !== MOCK_CYCLE.id) {
      return [];
    }

    return this.admission()
      .applications.filter(item => !program || item.programId === program)
      .filter(item => !site || sitesOf(item).some(entry => entry.id === site));
  }

  // Administration.

  private preRegister(input: Partial<MockAdminUser> & { roles?: StaffRoleAssignment[] }): MockReply {
    requireText(input.idamUserId, 'idamUserId', 'Enter the IDAM user id.');
    requireText(input.displayName, 'displayName', 'Enter the name.');
    requireText(input.email, 'email', 'Enter the email address.');

    if (!input.roles?.length) {
      throw problem(422, 'request.validation_failed', 'Grant at least one role.', [{ code: 'required', detail: 'Grant at least one role.', pointer: '/roles' }]);
    }

    if (this.state().adminUsers.some(user => user.idamUserId === input.idamUserId || user.email.toLowerCase() === input.email?.toLowerCase())) {
      throw problem(409, 'staff.already_registered', 'A staff user with this IDAM user id or email address is already registered.');
    }

    const user: MockAdminUser = {
      staffUserId: crypto.randomUUID(),
      idamUserId: input.idamUserId ?? '',
      displayName: input.displayName ?? '',
      email: input.email ?? '',
      isActive: true,
      hasSignedIn: false,
      linkedCandidateId: input.linkedCandidateId ?? null,
      roles: input.roles,
      activeRole: input.roles[0]?.roleCode ?? null,
      version: 1,
    };
    this.state().adminUsers.push(user);
    this.save();

    return ok(staffUser(user), undefined, 201);
  }

  private staffUserOperation(method: string, staffUserId: string, rest: string, body: unknown, headers: { get(name: string): string | null }): MockReply {
    const user = this.state().adminUsers.find(entry => entry.staffUserId === staffUserId);

    if (!user) {
      throw problem(404, 'resource.not_found', 'The staff user was not found.');
    }

    if (method === 'GET' && rest === '') {
      return ok(staffUser(user));
    }

    if (method === 'PUT' && rest === '/roles') {
      requireVersion(headers, `v${user.version}`);
      const roles = (body as { roles?: StaffRoleAssignment[] }).roles ?? [];

      if (roles.length === 0) {
        throw problem(422, 'request.validation_failed', 'Keep at least one role, or deactivate the user instead.');
      }

      user.roles = roles;

      if (!roles.some(role => role.roleCode === user.activeRole)) {
        // Standards s.15: a removed active role falls back to the user's first remaining role.
        user.activeRole = roles[0]?.roleCode ?? null;
      }

      user.version += 1;
      this.syncSignIn(user);
      this.save();

      return ok(staffUser(user));
    }

    if (method === 'POST' && rest === '/deactivation') {
      requireText((body as { reason?: string }).reason, 'reason', 'Enter the reason for deactivating.');
      user.isActive = false;
      user.version += 1;
      this.save();

      return ok(staffUser(user));
    }

    if (method === 'POST' && rest === '/reactivation') {
      user.isActive = true;
      user.version += 1;
      this.save();

      return ok(staffUser(user));
    }

    throw problem(404, 'resource.not_found', 'The requested resource was not found.');
  }

  /** Role changes apply to the persona's next sign-in in the mock. */
  private syncSignIn(user: MockAdminUser): void {
    const record = this.staffRecords()[user.idamUserId.replace(/^idam\|/, '')];

    if (record) {
      record.roles = user.roles.map(role => role.roleCode);
      record.activeRole = user.activeRole ?? record.roles[0] ?? record.activeRole;
    }
  }

  private paged<T>(items: readonly T[], query: URLSearchParams): MockReply {
    const limit = Math.min(100, Math.max(1, Number(query.get('limit') ?? 25)));
    const offset = Number(query.get('cursor') ? atob(query.get('cursor') ?? '') : 0) || 0;
    const next = offset + limit < items.length ? btoa(String(offset + limit)) : null;

    return { status: 200, body: { data: items.slice(offset, offset + limit), pagination: { limit, nextCursor: next } } };
  }

  private requireRole(...roles: string[]): void {
    const user = this.user();

    if (user === null || !roles.includes(user.activeRole)) {
      throw problem(403, 'auth.forbidden', 'Your active role cannot use this operation.');
    }
  }
}

function sitesOf(item: MockReviewApplication): readonly { id: string; name: string }[] {
  const index = Number(item.applicationId.replace(/\D+/g, '')) || 0;
  const general = MOCK_SITES.filter(site => site.id !== 's-dental');
  const first = general[index % general.length];
  const second = general[(index + 2) % general.length];
  const sites = index % 3 === 0 && second ? [first, second] : [first];

  return sites.filter((site): site is NonNullable<typeof site> => site !== undefined).map(site => ({ id: site.id, name: site.name }));
}

function staffUser(user: MockAdminUser): StaffUser {
  return {
    staffUserId: user.staffUserId,
    displayName: user.displayName,
    email: user.email,
    isActive: user.isActive,
    hasSignedIn: user.hasSignedIn,
    linkedCandidateId: user.linkedCandidateId,
    roles: user.roles,
    activeRole: user.activeRole,
    version: `v${user.version}`,
  };
}

function publicClient(client: MockIntegrationClient): IntegrationClient {
  return {
    integrationClientId: client.integrationClientId,
    idamClientId: client.idamClientId,
    name: client.name,
    isActive: client.isActive,
    permissions: client.permissions,
    version: client.version,
  };
}

function requireText(value: unknown, field: string, message: string): void {
  if (typeof value !== 'string' || value.trim() === '') {
    throw problem(422, 'request.validation_failed', message, [{ code: 'required', detail: message, pointer: `/${field}` }]);
  }
}

/** Administration uses the body `version` as If-Match and answers 409 when stale (contract). */
function requireVersion(headers: { get(name: string): string | null }, version: string): void {
  const ifMatch = headers.get('If-Match');

  if (!ifMatch) {
    throw problem(428, 'request.precondition_required', 'The If-Match header is required.');
  }

  if (ifMatch !== version) {
    throw problem(409, 'request.precondition_failed', 'Someone else changed this record. Reload to see the latest version.');
  }
}
