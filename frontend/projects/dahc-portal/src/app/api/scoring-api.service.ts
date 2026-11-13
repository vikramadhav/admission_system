import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResult } from '../core/api/api.models';
import { DAHC_PORTAL_CONFIG } from '../core/config/portal-config';
import { CursorQuery, definedOnly, withCursor } from './admission-api.service';
import { PortfolioStatus, StaffUserSummary } from './admission.models';
import { AttachmentMetadata, WorkflowActionResult } from './candidate-lifecycle.models';
import {
  PortfolioReview,
  PortfolioScoringResult,
  RefereeDashboard,
  RefereeInboxItem,
  RefereeInboxSort,
  ScoreOverrideRequest,
  ScoreSet,
  ScoringRound,
  SeniorPortfolioReview,
  SeniorRefereeDashboard,
} from './scoring.models';

/**
 * Portfolio Scoring (portfolio-scoring.yaml): the referee dashboard, retrieval, anonymised
 * portfolio, conflict of interest, scores and submission, and the senior referee's oversight
 * (dashboard, a referee's inbox, reassignment, score override, evidence replacement).
 */
@Injectable({ providedIn: 'root' })
export class ScoringApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(DAHC_PORTAL_CONFIG).apiBaseUrl;

  /** GET /referee/dashboard (US-3.1.2). */
  getRefereeDashboard(
    query: CursorQuery<RefereeInboxSort> & { readonly round?: ScoringRound | null; readonly portfolioStatus?: PortfolioStatus | null; readonly q?: string },
  ): Observable<ApiResult<RefereeDashboard>> {
    const params = withCursor(new HttpParams(), query).appendAll(definedOnly({ round: query.round, portfolioStatus: query.portfolioStatus, q: query.q }));

    return this.http.get<ApiResult<RefereeDashboard>>(`${this.baseUrl}/referee/dashboard`, { params });
  }

  /** POST /referee/pools/{poolId}/portfolio-retrievals (US-3.2.1). */
  retrievePortfolios(poolId: string, idempotencyKey: string, context = new HttpContext()): Observable<ApiResult<RefereeInboxItem[]>> {
    return this.http.post<ApiResult<RefereeInboxItem[]>>(`${this.baseUrl}/referee/pools/${encodeURIComponent(poolId)}/portfolio-retrievals`, null, {
      headers: key(idempotencyKey),
      context,
    });
  }

  /** GET /referee/portfolios/{portfolioId} (US-3.3.1); the result carries the ETag for the first save. */
  getPortfolio(portfolioId: string, context = new HttpContext()): Observable<ApiResult<PortfolioReview>> {
    return this.http.get<ApiResult<PortfolioReview>>(`${this.baseUrl}/referee/portfolios/${encodeURIComponent(portfolioId)}`, { context });
  }

  /** GET .../evidence/{evidenceId}/content: Bearer-authenticated, fetched as a blob. */
  downloadEvidence(portfolioId: string, evidenceId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/referee/portfolios/${encodeURIComponent(portfolioId)}/evidence/${encodeURIComponent(evidenceId)}/content`, {
      responseType: 'blob',
    });
  }

  /** POST .../conflict-of-interest (US-3.3.2). The contract has no idempotency key here. */
  declareConflictOfInterest(portfolioId: string, reason: string, context = new HttpContext()): Observable<ApiResult<WorkflowActionResult>> {
    return this.http.post<ApiResult<WorkflowActionResult>>(`${this.baseUrl}/referee/portfolios/${encodeURIComponent(portfolioId)}/conflict-of-interest`, { reason }, { context });
  }

  /** PUT .../scores with If-Match (US-3.3.3): saves the draft; 412 when another save happened first. */
  saveScores(portfolioId: string, scores: ScoreSet, etag: string, context = new HttpContext()): Observable<ApiResult<ScoreSet>> {
    return this.http.put<ApiResult<ScoreSet>>(`${this.baseUrl}/referee/portfolios/${encodeURIComponent(portfolioId)}/scores`, scores, {
      headers: new HttpHeaders({ 'If-Match': etag }),
      context,
    });
  }

  /** POST .../score-submission (US-3.3.4): completes the round and runs discrepancy processing. */
  submitRound(portfolioId: string, idempotencyKey: string, context = new HttpContext()): Observable<ApiResult<PortfolioScoringResult>> {
    return this.http.post<ApiResult<PortfolioScoringResult>>(
      `${this.baseUrl}/referee/portfolios/${encodeURIComponent(portfolioId)}/score-submission`,
      { confirmed: true },
      { headers: key(idempotencyKey), context },
    );
  }

  /** GET /senior-referee/dashboard (US-3.1.3). */
  getSeniorDashboard(): Observable<ApiResult<SeniorRefereeDashboard>> {
    return this.http.get<ApiResult<SeniorRefereeDashboard>>(`${this.baseUrl}/senior-referee/dashboard`);
  }

  /** GET /senior-referee/referees/{refereeId}/portfolios (US-3.1.3, US-3.2.2). */
  listRefereePortfolios(refereeId: string, query: CursorQuery<RefereeInboxSort>): Observable<ApiResult<RefereeInboxItem[]>> {
    return this.http.get<ApiResult<RefereeInboxItem[]>>(`${this.baseUrl}/senior-referee/referees/${encodeURIComponent(refereeId)}/portfolios`, {
      params: withCursor(new HttpParams(), query),
    });
  }

  /** GET /senior-referee/portfolios/{portfolioId} (US-3.1.3). */
  getSeniorPortfolio(portfolioId: string, context = new HttpContext()): Observable<ApiResult<SeniorPortfolioReview>> {
    return this.http.get<ApiResult<SeniorPortfolioReview>>(`${this.baseUrl}/senior-referee/portfolios/${encodeURIComponent(portfolioId)}`, { context });
  }

  /** GET .../eligible-referees: reassignment targets (US-3.2.2). */
  listEligibleReferees(portfolioId: string): Observable<ApiResult<StaffUserSummary[]>> {
    return this.http.get<ApiResult<StaffUserSummary[]>>(`${this.baseUrl}/senior-referee/portfolios/${encodeURIComponent(portfolioId)}/eligible-referees`, {
      params: new HttpParams().set('limit', 100),
    });
  }

  /** PUT .../assignment (US-3.2.2). The contract has no idempotency key here. */
  reassignPortfolio(portfolioId: string, targetUserId: string, justification: string, context = new HttpContext()): Observable<ApiResult<RefereeInboxItem>> {
    return this.http.put<ApiResult<RefereeInboxItem>>(
      `${this.baseUrl}/senior-referee/portfolios/${encodeURIComponent(portfolioId)}/assignment`,
      { targetUserId, justification },
      { context },
    );
  }

  /** POST .../score-overrides (US-3.2.2). */
  overrideRoundScore(portfolioId: string, request: ScoreOverrideRequest, idempotencyKey: string, context = new HttpContext()): Observable<ApiResult<PortfolioScoringResult>> {
    return this.http.post<ApiResult<PortfolioScoringResult>>(`${this.baseUrl}/senior-referee/portfolios/${encodeURIComponent(portfolioId)}/score-overrides`, request, {
      headers: key(idempotencyKey),
      context,
    });
  }

  /** PUT .../evidence/{evidenceId}/replacement (US-3.2.3): a new version; scores are not recomputed. */
  replaceEvidence(portfolioId: string, evidenceId: string, file: File, reason: string, context = new HttpContext()): Observable<ApiResult<AttachmentMetadata>> {
    const body = new FormData();
    body.append('file', file);
    body.append('reason', reason);

    return this.http.put<ApiResult<AttachmentMetadata>>(
      `${this.baseUrl}/senior-referee/portfolios/${encodeURIComponent(portfolioId)}/evidence/${encodeURIComponent(evidenceId)}/replacement`,
      body,
      { context },
    );
  }

  /** GET senior-referee evidence content, including earlier versions. */
  downloadSeniorEvidence(portfolioId: string, evidenceId: string, version?: number): Observable<Blob> {
    const params = version === undefined ? new HttpParams() : new HttpParams().set('version', version);

    return this.http.get(`${this.baseUrl}/senior-referee/portfolios/${encodeURIComponent(portfolioId)}/evidence/${encodeURIComponent(evidenceId)}/content`, {
      params,
      responseType: 'blob',
    });
  }
}

function key(idempotencyKey: string): HttpHeaders {
  return new HttpHeaders({ 'Idempotency-Key': idempotencyKey });
}
