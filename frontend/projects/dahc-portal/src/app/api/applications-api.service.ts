import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResult } from '../core/api/api.models';
import { DAHC_PORTAL_CONFIG } from '../core/config/portal-config';
import { Application, CreateApplicationRequest, UpdateDraftRequest } from './application.models';

/** Candidate application operations createCandidateDraftApplication, getCandidateApplication and updateCandidateDraftApplication. */
@Injectable({ providedIn: 'root' })
export class ApplicationsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(DAHC_PORTAL_CONFIG).apiBaseUrl;

  /**
   * POST /applications. The idempotency key is created once per attempt by the caller and
   * reused for retries of the same request, so a retry never creates a second draft.
   */
  createDraft(
    cycleId: string,
    request: CreateApplicationRequest,
    idempotencyKey: string,
  ): Observable<ApiResult<Application>> {
    const params = new HttpParams().set('cycleId', cycleId);
    const headers = new HttpHeaders({ 'Idempotency-Key': idempotencyKey });

    return this.http.post<ApiResult<Application>>(`${this.baseUrl}/applications`, request, { params, headers });
  }

  /** GET /applications/{applicationId}; the result carries the ETag needed to save. */
  getApplication(applicationId: string): Observable<ApiResult<Application>> {
    return this.http.get<ApiResult<Application>>(this.applicationUrl(applicationId));
  }

  /** PATCH /applications/{applicationId} as JSON Merge Patch, guarded by If-Match. */
  updateDraft(applicationId: string, request: UpdateDraftRequest, etag: string): Observable<ApiResult<Application>> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/merge-patch+json',
      'If-Match': etag,
    });

    return this.http.patch<ApiResult<Application>>(this.applicationUrl(applicationId), request, { headers });
  }

  private applicationUrl(applicationId: string): string {
    return `${this.baseUrl}/applications/${encodeURIComponent(applicationId)}`;
  }
}
