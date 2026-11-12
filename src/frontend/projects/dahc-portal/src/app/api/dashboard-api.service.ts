import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResult } from '../core/api/api.models';
import { DAHC_PORTAL_CONFIG } from '../core/config/portal-config';
import { CandidateDashboard } from './dashboard.models';

/** Candidate lifecycle operation getCandidateDashboard. */
@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(DAHC_PORTAL_CONFIG).apiBaseUrl;

  /** GET /me/dashboard: inbox items with their allowed actions and the start-new state. */
  getCandidateDashboard(): Observable<ApiResult<CandidateDashboard>> {
    return this.http.get<ApiResult<CandidateDashboard>>(`${this.baseUrl}/me/dashboard`);
  }
}
