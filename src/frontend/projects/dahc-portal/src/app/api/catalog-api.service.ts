import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResult } from '../core/api/api.models';
import { DAHC_PORTAL_CONFIG } from '../core/config/portal-config';
import { Program, Specialty, TrainingSite } from './catalog.models';

/** The contract's maximum page size; D1 catalogs are far smaller, so one page is enough. */
const CATALOG_PAGE_LIMIT = 100;

/** Catalog operations listPrograms, listProgramSpecialties and listSpecialtyTrainingSites. */
@Injectable({ providedIn: 'root' })
export class CatalogApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(DAHC_PORTAL_CONFIG).apiBaseUrl;

  /**
   * GET /programs. The contract requires cycleId but offers no operation that returns the
   * open cycle, so the portal omits it and expects the currently open cycle (open question).
   */
  listPrograms(): Observable<ApiResult<Program[]>> {
    const params = new HttpParams().set('limit', CATALOG_PAGE_LIMIT);

    return this.http.get<ApiResult<Program[]>>(`${this.baseUrl}/programs`, { params });
  }

  /** GET /programs/{programId}/specialties: active specialties only. */
  listProgramSpecialties(programId: string): Observable<ApiResult<Specialty[]>> {
    const params = new HttpParams().set('limit', CATALOG_PAGE_LIMIT);
    const url = `${this.baseUrl}/programs/${encodeURIComponent(programId)}/specialties`;

    return this.http.get<ApiResult<Specialty[]>>(url, { params });
  }

  /** GET /specialties/{specialtyId}/sites: active training sites only. */
  listSpecialtyTrainingSites(specialtyId: string): Observable<ApiResult<TrainingSite[]>> {
    const params = new HttpParams().set('limit', CATALOG_PAGE_LIMIT);
    const url = `${this.baseUrl}/specialties/${encodeURIComponent(specialtyId)}/sites`;

    return this.http.get<ApiResult<TrainingSite[]>>(url, { params });
  }
}
