import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResult } from '../core/api/api.models';
import { DAHC_PORTAL_CONFIG } from '../core/config/portal-config';
import { CursorQuery, definedOnly, withCursor } from './admission-api.service';
import { IntegrationClient, IntegrationClientInput, StaffRoleAssignment, StaffUser, StaffUserInput } from './admin.models';

/** Administration: staff users and integration clients, administrator only. */
@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${inject(DAHC_PORTAL_CONFIG).apiBaseUrl}/admin`;

  /** GET /admin/staff-users. */
  listStaffUsers(query: CursorQuery<never> & { readonly roleCode?: string | null; readonly isActive?: boolean | null; readonly q?: string }): Observable<ApiResult<StaffUser[]>> {
    const isActive = query.isActive === null || query.isActive === undefined ? undefined : String(query.isActive);
    const params = withCursor(new HttpParams(), { limit: query.limit ?? 25, cursor: query.cursor ?? null }).appendAll(definedOnly({ roleCode: query.roleCode, isActive, q: query.q }));

    return this.http.get<ApiResult<StaffUser[]>>(`${this.baseUrl}/staff-users`, { params });
  }

  /** POST /admin/staff-users: pre-register (409 staff.already_registered). */
  preRegisterStaffUser(input: StaffUserInput, idempotencyKey: string, context = new HttpContext()): Observable<ApiResult<StaffUser>> {
    return this.http.post<ApiResult<StaffUser>>(`${this.baseUrl}/staff-users`, input, { headers: new HttpHeaders({ 'Idempotency-Key': idempotencyKey }), context });
  }

  getStaffUser(staffUserId: string, context = new HttpContext()): Observable<ApiResult<StaffUser>> {
    return this.http.get<ApiResult<StaffUser>>(`${this.baseUrl}/staff-users/${encodeURIComponent(staffUserId)}`, { context });
  }

  /** PUT /admin/staff-users/{id}/roles with If-Match = the user's `version` (409 when stale). */
  setStaffUserRoles(staffUserId: string, roles: readonly StaffRoleAssignment[], version: string, context = new HttpContext()): Observable<ApiResult<StaffUser>> {
    return this.http.put<ApiResult<StaffUser>>(`${this.baseUrl}/staff-users/${encodeURIComponent(staffUserId)}/roles`, { roles }, { headers: new HttpHeaders({ 'If-Match': version }), context });
  }

  deactivateStaffUser(staffUserId: string, reason: string, context = new HttpContext()): Observable<ApiResult<StaffUser>> {
    return this.http.post<ApiResult<StaffUser>>(`${this.baseUrl}/staff-users/${encodeURIComponent(staffUserId)}/deactivation`, { reason }, { context });
  }

  reactivateStaffUser(staffUserId: string, context = new HttpContext()): Observable<ApiResult<StaffUser>> {
    return this.http.post<ApiResult<StaffUser>>(`${this.baseUrl}/staff-users/${encodeURIComponent(staffUserId)}/reactivation`, null, { context });
  }

  listIntegrationClients(query: CursorQuery<never>): Observable<ApiResult<IntegrationClient[]>> {
    return this.http.get<ApiResult<IntegrationClient[]>>(`${this.baseUrl}/integration-clients`, {
      params: withCursor(new HttpParams(), { limit: query.limit ?? 25, cursor: query.cursor ?? null }),
    });
  }

  /** POST /admin/integration-clients (409 integration.already_registered). */
  registerIntegrationClient(input: IntegrationClientInput, idempotencyKey: string, context = new HttpContext()): Observable<ApiResult<IntegrationClient>> {
    return this.http.post<ApiResult<IntegrationClient>>(`${this.baseUrl}/integration-clients`, input, { headers: new HttpHeaders({ 'Idempotency-Key': idempotencyKey }), context });
  }

  /** PUT /admin/integration-clients/{id} with If-Match = the client's `version` (409 when stale). */
  updateIntegrationClient(integrationClientId: string, input: IntegrationClientInput, version: string, context = new HttpContext()): Observable<ApiResult<IntegrationClient>> {
    return this.http.put<ApiResult<IntegrationClient>>(`${this.baseUrl}/integration-clients/${encodeURIComponent(integrationClientId)}`, input, {
      headers: new HttpHeaders({ 'If-Match': version }),
      context,
    });
  }
}
