import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResult } from '../core/api/api.models';
import { DAHC_PORTAL_CONFIG } from '../core/config/portal-config';
import {
  ApplicationAttachment,
  BulkReassignmentRequest,
  BulkWorkflowResult,
  CorrectionFlagSet,
  DuplicateAccountPair,
  IcpRefreshPreview,
  IcpRefreshResult,
  OfficerDashboard,
  OfficerInsight,
  OfficerWorkload,
  ReinstatementDecision,
  ReinstatementRequestDetail,
  ReinstatementRequestStatus,
  ReinstatementRequestSummary,
  ScreenOutDecision,
  StaffApplication,
  StaffUserSummary,
  SupervisorDashboard,
  SupervisorQueue,
  VerificationFeedbackAction,
  VerificationInboxItem,
} from './admission.models';
import { AttachmentMetadata, LookupItem, WorkflowActionResult } from './candidate-lifecycle.models';

/** Sort keys allowed by the officer dashboard and officer workload (contract allow-list). */
export type VerificationInboxSort =
  | 'dueAt'
  | 'retrievedAt'
  | 'submittedAt'
  | 'applicationId'
  | 'candidateName'
  | 'verificationStatus'
  | 'gpaShortlistingScore'
  | 'examShortlistingScore';

/** Sort keys allowed by the supervisor dashboard inbox. */
export type SupervisorInboxSort = 'requestedAt' | 'applicationId' | 'candidateName' | 'queue';

export type LookupType =
  | 'WITHDRAWAL_REASON'
  | 'CORRECTION_NOTE_TEMPLATE'
  | 'SCREEN_OUT_REASON'
  | 'REINSTATEMENT_REJECTION_REASON'
  | 'PORTFOLIO_REJECTION_REASON'
  | 'PORTFOLIO_CLASSIFICATION';

export type IcpRefreshReason = 'IDENTITY_EXPIRY' | 'DETAILS_CHANGE';

/** A cursor-paged list request: `sort` is an allow-listed key, prefixed with `-` for descending. */
export interface CursorQuery<TSort extends string> {
  readonly limit?: number;
  readonly cursor?: string | null;
  readonly sort?: TSort | `-${TSort}`;
}

/**
 * Admission Operations (admission-operations.yaml): officer and supervisor dashboards, pool
 * retrieval, workload and reassignment, verification actions, screen-out and escalation
 * decisions, reinstatement requests, duplicate accounts and ICP refresh. Operations with an
 * Idempotency-Key take it from the caller, created once per user intent and reused on retry.
 */
@Injectable({ providedIn: 'root' })
export class AdmissionApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(DAHC_PORTAL_CONFIG).apiBaseUrl;

  /** GET /staff/admission/dashboard (US-2.1.2). */
  getOfficerDashboard(
    query: CursorQuery<VerificationInboxSort> & { readonly insight?: OfficerInsight | null; readonly q?: string },
  ): Observable<ApiResult<OfficerDashboard>> {
    const params = withCursor(new HttpParams(), query).appendAll(definedOnly({ insight: query.insight, q: query.q }));

    return this.http.get<ApiResult<OfficerDashboard>>(`${this.staff}/admission/dashboard`, { params });
  }

  /** POST /staff/pools/{poolId}/application-retrievals (US-2.2.1). */
  retrieveApplications(poolId: string, idempotencyKey: string, context = new HttpContext()): Observable<ApiResult<VerificationInboxItem[]>> {
    return this.http.post<ApiResult<VerificationInboxItem[]>>(`${this.staff}/pools/${encodeURIComponent(poolId)}/application-retrievals`, null, {
      headers: key(idempotencyKey),
      context,
    });
  }

  /** GET /staff/supervisor/dashboard (US-2.1.3). */
  getSupervisorDashboard(
    query: CursorQuery<SupervisorInboxSort> & { readonly queue?: SupervisorQueue | null; readonly q?: string },
  ): Observable<ApiResult<SupervisorDashboard>> {
    const params = withCursor(new HttpParams(), query).appendAll(definedOnly({ queue: query.queue, q: query.q }));

    return this.http.get<ApiResult<SupervisorDashboard>>(`${this.staff}/supervisor/dashboard`, { params });
  }

  /** GET /staff/officers/{officerId}/workload (US-2.2.2). */
  getOfficerWorkload(
    officerId: string,
    query: CursorQuery<VerificationInboxSort> & { readonly overdue?: boolean | null },
  ): Observable<ApiResult<OfficerWorkload>> {
    const overdue = query.overdue === true ? 'true' : undefined;
    const params = withCursor(new HttpParams(), query).appendAll(definedOnly({ overdue }));

    return this.http.get<ApiResult<OfficerWorkload>>(`${this.staff}/officers/${encodeURIComponent(officerId)}/workload`, { params });
  }

  /** GET /staff/pools/{poolId}/officers: reassignment targets (US-2.2.3). */
  listPoolOfficers(poolId: string): Observable<ApiResult<StaffUserSummary[]>> {
    const params = new HttpParams().set('limit', 100);

    return this.http.get<ApiResult<StaffUserSummary[]>>(`${this.staff}/pools/${encodeURIComponent(poolId)}/officers`, { params });
  }

  /** POST /staff/application-reassignments (US-2.2.3). */
  reassignApplications(request: BulkReassignmentRequest, idempotencyKey: string, context = new HttpContext()): Observable<ApiResult<BulkWorkflowResult>> {
    return this.http.post<ApiResult<BulkWorkflowResult>>(`${this.staff}/application-reassignments`, request, { headers: key(idempotencyKey), context });
  }

  /** GET /staff/applications/{applicationId} (US-2.3.1, also the Central Monitor's read-only view). */
  getApplication(applicationId: string, context = new HttpContext()): Observable<ApiResult<StaffApplication>> {
    return this.http.get<ApiResult<StaffApplication>>(this.application(applicationId), { context });
  }

  /** GET /staff/applications/{applicationId}/attachments. */
  listAttachments(applicationId: string, context = new HttpContext()): Observable<ApiResult<ApplicationAttachment[]>> {
    const params = new HttpParams().set('limit', 100);

    return this.http.get<ApiResult<ApplicationAttachment[]>>(`${this.application(applicationId)}/attachments`, { params, context });
  }

  /** GET .../attachments/{attachmentId}/content: a Bearer-authenticated file, fetched as a blob. */
  downloadAttachment(applicationId: string, attachmentId: string): Observable<Blob> {
    return this.http.get(`${this.application(applicationId)}/attachments/${encodeURIComponent(attachmentId)}/content`, { responseType: 'blob' });
  }

  /** PUT .../correction-flags: the complete set of flags with candidate-facing notes (US-2.3.2). */
  saveCorrectionFlags(applicationId: string, flags: CorrectionFlagSet, context = new HttpContext()): Observable<ApiResult<CorrectionFlagSet>> {
    return this.http.put<ApiResult<CorrectionFlagSet>>(`${this.application(applicationId)}/correction-flags`, flags, { context });
  }

  /** POST .../correction-requests (US-2.3.3). `correctionDeadline` is a timestamp with offset (PQ-11). */
  returnForCorrection(applicationId: string, correctionDeadline: string, idempotencyKey: string, context = new HttpContext()): Observable<ApiResult<WorkflowActionResult>> {
    return this.http.post<ApiResult<WorkflowActionResult>>(
      `${this.application(applicationId)}/correction-requests`,
      { correctionDeadline },
      { headers: key(idempotencyKey), context },
    );
  }

  /** POST .../verification-completion (US-2.3.5). */
  completeVerification(applicationId: string, idempotencyKey: string, context = new HttpContext()): Observable<ApiResult<WorkflowActionResult>> {
    return this.http.post<ApiResult<WorkflowActionResult>>(
      `${this.application(applicationId)}/verification-completion`,
      { confirmed: true },
      { headers: key(idempotencyKey), context },
    );
  }

  /** POST .../verification-actions: an action after supervisor feedback (US-2.4.5). */
  continueAfterFeedback(
    applicationId: string,
    request: { readonly action: VerificationFeedbackAction; readonly reasonCode?: string; readonly note?: string },
    idempotencyKey: string,
    context = new HttpContext(),
  ): Observable<ApiResult<WorkflowActionResult>> {
    return this.http.post<ApiResult<WorkflowActionResult>>(`${this.application(applicationId)}/verification-actions`, request, {
      headers: key(idempotencyKey),
      context,
    });
  }

  /** PUT .../attachments/{attachmentId}/replacement (US-2.3.6): a new version with the justification. */
  replaceAttachment(applicationId: string, attachmentId: string, file: File, reason: string, context = new HttpContext()): Observable<ApiResult<AttachmentMetadata>> {
    const body = new FormData();
    body.append('file', file);
    body.append('reason', reason);

    return this.http.put<ApiResult<AttachmentMetadata>>(`${this.application(applicationId)}/attachments/${encodeURIComponent(attachmentId)}/replacement`, body, {
      context,
    });
  }

  /** POST .../screen-out-recommendations (US-2.4.1). The contract has no idempotency key here. */
  recommendScreenOut(applicationId: string, reasonCode: string, note: string | null, context = new HttpContext()): Observable<ApiResult<WorkflowActionResult>> {
    return this.http.post<ApiResult<WorkflowActionResult>>(`${this.application(applicationId)}/screen-out-recommendations`, { reasonCode, note }, { context });
  }

  /** POST .../screen-out-decisions (US-2.4.3). */
  decideScreenOut(applicationId: string, decision: ScreenOutDecision, idempotencyKey: string, context = new HttpContext()): Observable<ApiResult<WorkflowActionResult>> {
    return this.http.post<ApiResult<WorkflowActionResult>>(`${this.application(applicationId)}/screen-out-decisions`, decision, {
      headers: key(idempotencyKey),
      context,
    });
  }

  /** POST .../clarification-requests (US-2.4.2). */
  escalate(applicationId: string, note: string, context = new HttpContext()): Observable<ApiResult<WorkflowActionResult>> {
    return this.http.post<ApiResult<WorkflowActionResult>>(`${this.application(applicationId)}/clarification-requests`, { note }, { context });
  }

  /** POST .../clarification-responses (US-2.4.4). */
  returnWithGuidance(applicationId: string, note: string, context = new HttpContext()): Observable<ApiResult<WorkflowActionResult>> {
    return this.http.post<ApiResult<WorkflowActionResult>>(`${this.application(applicationId)}/clarification-responses`, { note }, { context });
  }

  /** GET /staff/reinstatement-requests (US-2.5.1). */
  listReinstatementRequests(
    query: CursorQuery<'requestedAt' | 'applicationId' | 'candidateName'> & { readonly status?: ReinstatementRequestStatus | null },
  ): Observable<ApiResult<ReinstatementRequestSummary[]>> {
    const params = withCursor(new HttpParams(), query).appendAll(definedOnly({ status: query.status }));

    return this.http.get<ApiResult<ReinstatementRequestSummary[]>>(`${this.staff}/reinstatement-requests`, { params });
  }

  getReinstatementRequest(requestId: string): Observable<ApiResult<ReinstatementRequestDetail>> {
    return this.http.get<ApiResult<ReinstatementRequestDetail>>(`${this.staff}/reinstatement-requests/${encodeURIComponent(requestId)}`);
  }

  /** POST /staff/reinstatement-requests/{requestId}/decision (US-2.5.2). */
  decideReinstatement(requestId: string, decision: ReinstatementDecision, idempotencyKey: string, context = new HttpContext()): Observable<ApiResult<WorkflowActionResult>> {
    return this.http.post<ApiResult<WorkflowActionResult>>(`${this.staff}/reinstatement-requests/${encodeURIComponent(requestId)}/decision`, decision, {
      headers: key(idempotencyKey),
      context,
    });
  }

  /** POST .../reinstatement: the supervisor directly reinstates a screened-out application (US-2.5.2). */
  reinstateScreenedOut(applicationId: string, justification: string, idempotencyKey: string, context = new HttpContext()): Observable<ApiResult<WorkflowActionResult>> {
    return this.http.post<ApiResult<WorkflowActionResult>>(
      `${this.application(applicationId)}/reinstatement`,
      { justification, confirmed: true },
      { headers: key(idempotencyKey), context },
    );
  }

  /** GET /staff/duplicate-accounts (US-1.1.1 report). */
  listDuplicateAccounts(query: CursorQuery<'detectedAt'>): Observable<ApiResult<DuplicateAccountPair[]>> {
    return this.http.get<ApiResult<DuplicateAccountPair[]>>(`${this.staff}/duplicate-accounts`, { params: withCursor(new HttpParams(), query) });
  }

  /** POST /staff/candidates/{candidateId}/icp-refresh-preview (US-2.5.3). */
  previewIcpRefresh(candidateId: string, requestReason: IcpRefreshReason, context = new HttpContext()): Observable<ApiResult<IcpRefreshPreview>> {
    return this.http.post<ApiResult<IcpRefreshPreview>>(`${this.staff}/candidates/${encodeURIComponent(candidateId)}/icp-refresh-preview`, { requestReason }, { context });
  }

  /** POST /staff/candidates/{candidateId}/icp-refresh: applies the selected ICP values (US-2.5.3). */
  applyIcpRefresh(
    candidateId: string,
    request: { readonly requestReason: IcpRefreshReason; readonly previewToken: string; readonly fieldCodes: readonly string[] },
    context = new HttpContext(),
  ): Observable<ApiResult<IcpRefreshResult>> {
    return this.http.post<ApiResult<IcpRefreshResult>>(`${this.staff}/candidates/${encodeURIComponent(candidateId)}/icp-refresh`, { ...request, confirmed: true }, { context });
  }

  /** GET /lookups/{lookupType}: configured drop-down values (note templates, reasons). */
  listLookup(lookupType: LookupType): Observable<ApiResult<LookupItem[]>> {
    const params = new HttpParams().set('limit', 100);

    return this.http.get<ApiResult<LookupItem[]>>(`${this.baseUrl}/lookups/${lookupType}`, { params });
  }

  private get staff(): string {
    return `${this.baseUrl}/staff`;
  }

  private application(applicationId: string): string {
    return `${this.staff}/applications/${encodeURIComponent(applicationId)}`;
  }
}

function key(idempotencyKey: string): HttpHeaders {
  return new HttpHeaders({ 'Idempotency-Key': idempotencyKey });
}

/** Adds limit, cursor and sort; the cursor is opaque and bound to the same filters and sort. */
export function withCursor<TSort extends string>(params: HttpParams, query: CursorQuery<TSort>): HttpParams {
  return params.appendAll(definedOnly({ limit: query.limit ?? 25, cursor: query.cursor, sort: query.sort }));
}

export function definedOnly(values: Readonly<Record<string, string | number | boolean | null | undefined>>): Record<string, string | number | boolean> {
  const result: Record<string, string | number | boolean> = {};

  for (const [name, value] of Object.entries(values)) {
    if (value !== null && value !== undefined && value !== '') {
      result[name] = value;
    }
  }

  return result;
}
