import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResult } from '../core/api/api.models';
import { DAHC_PORTAL_CONFIG } from '../core/config/portal-config';
import { CursorQuery, definedOnly, withCursor } from './admission-api.service';
import { PaymentFilters, PaymentRecord } from './finance.models';

/** Finance payments (US-1.3.13): search and Excel export, finance officer only. */
@Injectable({ providedIn: 'root' })
export class FinanceApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${inject(DAHC_PORTAL_CONFIG).apiBaseUrl}/finance/payments`;

  /** GET /finance/payments: default order newest payment first; no sort allow-list (PQ-14). */
  listPayments(query: CursorQuery<never> & PaymentFilters, context = new HttpContext()): Observable<ApiResult<PaymentRecord[]>> {
    return this.http.get<ApiResult<PaymentRecord[]>>(this.baseUrl, { params: withCursor(filters(query), { limit: query.limit ?? 25, cursor: query.cursor ?? null }), context });
  }

  /** GET /finance/payments/export: the same filters, no paging, an .xlsx file (header-only when empty; 422 export.too_large). */
  exportPayments(query: PaymentFilters, context = new HttpContext()): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/export`, { params: filters(query), responseType: 'blob', context });
  }
}

function filters(query: PaymentFilters): HttpParams {
  return new HttpParams().appendAll(
    definedOnly({ cycleId: query.cycleId, programId: query.programId, applicationNumber: query.applicationNumber, from: query.from, to: query.to }),
  );
}
