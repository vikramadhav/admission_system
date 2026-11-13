import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResult } from '../core/api/api.models';
import { DAHC_PORTAL_CONFIG } from '../core/config/portal-config';
import { CursorQuery, definedOnly, withCursor } from './admission-api.service';
import { BulkWorkflowResult } from './admission.models';
import { BulkActionRequest, CasperImportResult, ScreeningDashboard, ScreeningFilters, ScreeningSort } from './screening.models';

/**
 * Screening and Announcements (screening.yaml), admission supervisor only: the screening
 * dashboard, CASPER import, initial announcement, bulk screen-out and reannouncement (EPIC-04).
 */
@Injectable({ providedIn: 'root' })
export class ScreeningApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${inject(DAHC_PORTAL_CONFIG).apiBaseUrl}/staff/screening`;

  /** GET /staff/screening/dashboard (US-4.1.1). Default order: shortlisting score, highest first. */
  getDashboard(query: CursorQuery<ScreeningSort> & ScreeningFilters): Observable<ApiResult<ScreeningDashboard>> {
    const appealed = query.appealed === null || query.appealed === undefined ? undefined : String(query.appealed);
    const params = withCursor(new HttpParams(), query).appendAll(
      definedOnly({ announcementStatus: query.announcementStatus, casperAttendance: query.casperAttendance, appealed, q: query.q }),
    );

    return this.http.get<ApiResult<ScreeningDashboard>>(`${this.baseUrl}/dashboard`, { params });
  }

  /** POST /staff/screening/casper-imports (US-4.2.1). `cycleId` is required and has no source yet (PQ-12). */
  importCasper(cycleId: string, file: File, idempotencyKey: string, context = new HttpContext()): Observable<ApiResult<CasperImportResult>> {
    const body = new FormData();
    body.append('file', file);

    return this.http.post<ApiResult<CasperImportResult>>(`${this.baseUrl}/casper-imports`, body, {
      params: new HttpParams().set('cycleId', cycleId),
      headers: key(idempotencyKey),
      context,
    });
  }

  /** POST /staff/screening/announcements (US-4.3.1). */
  announce(request: BulkActionRequest, idempotencyKey: string, context = new HttpContext()): Observable<ApiResult<BulkWorkflowResult>> {
    return this.http.post<ApiResult<BulkWorkflowResult>>(`${this.baseUrl}/announcements`, request, { headers: key(idempotencyKey), context });
  }

  /** POST /staff/screening/bulk-screen-outs (US-4.4.1). */
  bulkScreenOut(request: BulkActionRequest, idempotencyKey: string, context = new HttpContext()): Observable<ApiResult<BulkWorkflowResult>> {
    return this.http.post<ApiResult<BulkWorkflowResult>>(`${this.baseUrl}/bulk-screen-outs`, request, { headers: key(idempotencyKey), context });
  }

  /** POST /staff/screening/reannouncements (US-4.5.1). */
  reannounce(request: BulkActionRequest, idempotencyKey: string, context = new HttpContext()): Observable<ApiResult<BulkWorkflowResult>> {
    return this.http.post<ApiResult<BulkWorkflowResult>>(`${this.baseUrl}/reannouncements`, request, { headers: key(idempotencyKey), context });
  }
}

function key(idempotencyKey: string): HttpHeaders {
  return new HttpHeaders({ 'Idempotency-Key': idempotencyKey });
}
