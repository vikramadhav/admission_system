import { HttpErrorResponse, HttpHeaders, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, defer, delay, dematerialize, materialize, of, throwError } from 'rxjs';

import { isDahcApiUrl } from '../core/api/api-request';
import { DAHC_PORTAL_CONFIG } from '../core/config/portal-config';
import { MockBackendService, MockProblem } from './mock-backend.service';

/** Network-like latency so loading states are visible. */
const LATENCY_MS = 250;

/**
 * Answers every request for the configured API base URL from MockBackendService. It is the
 * last interceptor, so the portal's own interceptors (token, envelope, problems) run unchanged.
 */
export const mockApiInterceptor: HttpInterceptorFn = (request, next) => {
  const config = inject(DAHC_PORTAL_CONFIG);

  if (!isDahcApiUrl(request.url, config.apiBaseUrl)) {
    return next(request);
  }

  const backend = inject(MockBackendService);
  const path = request.urlWithParams.slice(config.apiBaseUrl.replace(/\/+$/, '').length);
  const pathOnly = path.split('?')[0] ?? '';

  const reply: Observable<HttpResponse<unknown>> = defer(() => {
    try {
      if (request.method === 'GET' && pathOnly === '/finance/payments/export') {
        return of(new HttpResponse({ status: 200, body: backend.financeExport(path), url: request.url }));
      }

      if (request.method === 'GET' && /\/(attachments|evidence)\/[^/]+\/content$/.test(pathOnly)) {
        return of(new HttpResponse({ status: 200, body: backend.attachmentContent(pathOnly), url: request.url }));
      }

      // Staff operations read their query parameters (filters, sort, cursor).
      const routed = (pathOnly === '/applications' && request.method === 'POST') || /^\/(staff|referee|senior-referee|finance|admin)\//.test(pathOnly) ? path : pathOnly;
      const result = backend.handle(request.method, routed, request.body, request.headers);

      if (request.method === 'PUT' && request.body instanceof FormData) {
        const file = request.body.get('file');

        if (file instanceof File) {
          backend.storeUpload(pathOnly, file);
        }
      }

      const headers = result.etag ? new HttpHeaders({ ETag: result.etag }) : new HttpHeaders();

      return of(new HttpResponse({ status: result.status, body: result.body, headers, url: request.url }));
    } catch (error: unknown) {
      if (error instanceof MockProblem) {
        return throwError(
          () =>
            new HttpErrorResponse({
              status: error.problem.status,
              error: error.problem,
              headers: new HttpHeaders({ 'Content-Type': 'application/problem+json' }),
              url: request.url,
            }),
        );
      }

      return throwError(() => error);
    }
  });

  // Delay errors as well as successes.
  return reply.pipe(materialize(), delay(LATENCY_MS), dematerialize());
};
