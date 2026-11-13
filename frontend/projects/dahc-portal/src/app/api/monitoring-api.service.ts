import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResult } from '../core/api/api.models';
import { DAHC_PORTAL_CONFIG } from '../core/config/portal-config';
import { CursorQuery, definedOnly, withCursor } from './admission-api.service';
import { MonitoringApplicationRow, MonitoringDrillDown, MonitoringFilters, MonitoringSort, SiteMonitoringDashboard } from './monitoring.models';

/** Central site monitoring (US-2.1.4): read-only, central monitor and admission supervisor. */
@Injectable({ providedIn: 'root' })
export class MonitoringApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${inject(DAHC_PORTAL_CONFIG).apiBaseUrl}/staff/site-monitoring`;

  /** GET /staff/site-monitoring/dashboard. */
  getDashboard(query: MonitoringFilters, context = new HttpContext()): Observable<ApiResult<SiteMonitoringDashboard>> {
    return this.http.get<ApiResult<SiteMonitoringDashboard>>(`${this.baseUrl}/dashboard`, {
      params: new HttpParams().appendAll(definedOnly({ cycleId: query.cycleId, programId: query.programId, siteId: query.siteId })),
      context,
    });
  }

  /** GET /staff/site-monitoring/applications: the applications behind a chart segment. */
  listApplications(query: CursorQuery<MonitoringSort> & MonitoringDrillDown): Observable<ApiResult<MonitoringApplicationRow[]>> {
    const params = withCursor(new HttpParams(), query).appendAll(
      definedOnly({
        cycleId: query.cycleId,
        programId: query.programId,
        siteId: query.siteId,
        specialtyId: query.specialtyId,
        applicationStatus: query.applicationStatus,
      }),
    );

    return this.http.get<ApiResult<MonitoringApplicationRow[]>>(`${this.baseUrl}/applications`, { params });
  }
}
