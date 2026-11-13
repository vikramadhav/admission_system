import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResult } from '../core/api/api.models';
import { DAHC_PORTAL_CONFIG } from '../core/config/portal-config';
import {
  Application,
  ApplicationSummary,
  CreateApplicationRequest,
  Preference,
  UpdateDraftRequest,
} from './application.models';
import {
  ApplicationSection,
  ApplicationSectionInput,
  ApplicationSectionKey,
  ReinstatementRequestInput,
  SiteExclusionInput,
  WorkflowActionResult,
} from './candidate-lifecycle.models';

/**
 * Candidate application operations: list, create, read and save drafts, sections, discard,
 * preference changes, site exclusion and reinstatement (applications.yaml, candidate-lifecycle.yaml).
 * Withdrawal, payment, attachments and the portfolio have their own services.
 */
@Injectable({ providedIn: 'root' })
export class ApplicationsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(DAHC_PORTAL_CONFIG).apiBaseUrl;

  /** GET /applications: every application of the signed-in candidate. */
  listApplications(): Observable<ApiResult<ApplicationSummary[]>> {
    const params = new HttpParams().set('limit', 100);

    return this.http.get<ApiResult<ApplicationSummary[]>>(`${this.baseUrl}/applications`, { params });
  }

  /**
   * POST /applications. The idempotency key is created once per attempt by the caller and
   * reused for retries of the same request, so a retry never creates a second draft.
   */
  createDraft(
    cycleId: string,
    request: CreateApplicationRequest,
    idempotencyKey: string,
    context: HttpContext = new HttpContext(),
  ): Observable<ApiResult<Application>> {
    const params = new HttpParams().set('cycleId', cycleId);
    const headers = new HttpHeaders({ 'Idempotency-Key': idempotencyKey });

    return this.http.post<ApiResult<Application>>(`${this.baseUrl}/applications`, request, { params, headers, context });
  }

  /** GET /applications/{applicationId}; the result carries the ETag needed to save. */
  getApplication(applicationId: string, context = new HttpContext()): Observable<ApiResult<Application>> {
    return this.http.get<ApiResult<Application>>(this.applicationUrl(applicationId), { context });
  }

  /** PATCH /applications/{applicationId} as JSON Merge Patch, guarded by If-Match. */
  updateDraft(
    applicationId: string,
    request: UpdateDraftRequest,
    etag: string,
    context: HttpContext = new HttpContext(),
  ): Observable<ApiResult<Application>> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/merge-patch+json',
      'If-Match': etag,
    });

    return this.http.patch<ApiResult<Application>>(this.applicationUrl(applicationId), request, { headers, context });
  }

  /** DELETE /applications/{applicationId}/draft: discards a draft (it becomes Archived). */
  discardDraft(applicationId: string, context = new HttpContext()): Observable<ApiResult<WorkflowActionResult>> {
    return this.http.delete<ApiResult<WorkflowActionResult>>(`${this.applicationUrl(applicationId)}/draft`, { context });
  }

  /** GET /applications/{applicationId}/sections/{sectionKey}; 404 when the section does not apply. */
  getSection(
    applicationId: string,
    sectionKey: ApplicationSectionKey,
    context: HttpContext = new HttpContext(),
  ): Observable<ApiResult<ApplicationSection>> {
    return this.http.get<ApiResult<ApplicationSection>>(this.sectionUrl(applicationId, sectionKey), { context });
  }

  /** PUT /applications/{applicationId}/sections/{sectionKey}: saves without completeness checks. */
  saveSection(
    applicationId: string,
    sectionKey: ApplicationSectionKey,
    input: ApplicationSectionInput,
    etag: string,
    context: HttpContext = new HttpContext(),
  ): Observable<ApiResult<ApplicationSection>> {
    const headers = new HttpHeaders({ 'If-Match': etag });

    return this.http.put<ApiResult<ApplicationSection>>(this.sectionUrl(applicationId, sectionKey), input, { headers, context });
  }

  /** PUT /applications/{applicationId}/preferences: edit preferences after submission (US-1.2.6). */
  updatePreferences(
    applicationId: string,
    preferences: readonly Preference[],
    etag: string,
    context = new HttpContext(),
  ): Observable<ApiResult<Application>> {
    const headers = new HttpHeaders({ 'If-Match': etag });

    return this.http.put<ApiResult<Application>>(`${this.applicationUrl(applicationId)}/preferences`, { preferences }, { headers, context });
  }

  /** POST /applications/{applicationId}/site-exclusions (US-1.2.8). */
  excludeTrainingSites(
    applicationId: string,
    input: SiteExclusionInput,
    context = new HttpContext(),
  ): Observable<ApiResult<Application>> {
    return this.http.post<ApiResult<Application>>(`${this.applicationUrl(applicationId)}/site-exclusions`, input, {
      headers: idempotent(),
      context,
    });
  }

  /** POST /applications/{applicationId}/reinstatement-requests (US-1.2.5). */
  requestReinstatement(
    applicationId: string,
    input: ReinstatementRequestInput,
    context = new HttpContext(),
  ): Observable<ApiResult<WorkflowActionResult>> {
    return this.http.post<ApiResult<WorkflowActionResult>>(
      `${this.applicationUrl(applicationId)}/reinstatement-requests`,
      input,
      { headers: idempotent(), context },
    );
  }

  private applicationUrl(applicationId: string): string {
    return `${this.baseUrl}/applications/${encodeURIComponent(applicationId)}`;
  }

  private sectionUrl(applicationId: string, sectionKey: ApplicationSectionKey): string {
    return `${this.applicationUrl(applicationId)}/sections/${encodeURIComponent(sectionKey)}`;
  }
}

/** A new Idempotency-Key for a one-off action (the contract requires 16 to 128 characters). */
export function idempotent(): HttpHeaders {
  return new HttpHeaders({ 'Idempotency-Key': crypto.randomUUID() });
}
