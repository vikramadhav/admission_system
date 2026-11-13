import { HttpErrorResponse, HttpEvent, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, switchMap, throwError } from 'rxjs';

import { AuthApiService } from '../../api/auth-api.service';
import { AuthService } from '../auth/auth.service';
import { DAHC_PORTAL_CONFIG } from '../config/portal-config';
import { ApiProblemError } from './api-problem-error';
import { DAHC_CALLER_HANDLES_PROBLEMS, isDahcApiUrl } from './api-request';
import { ApiProblemDetails, ApiResponseBody, ApiResult } from './api.models';
import { ProblemNotificationService } from './problem-notification.service';

const NOT_REGISTERED = 'account.not_registered';
const DUPLICATE_ACCOUNT = 'account.duplicate';

/**
 * Translates API responses into typed results: the ApiResponse envelope becomes an
 * ApiResult (with the ETag), and Problem Details become an ApiProblemError. It also applies
 * the portal-wide reactions: 401 starts a new sign-in, 403 account.not_registered calls the
 * sign-in endpoint and retries once, any other 403 shows the unauthorised page, 409
 * account.duplicate shows the duplicate-account guidance, and every other problem is shown
 * with its localized message and trace id.
 */
export const apiResponseInterceptor: HttpInterceptorFn = (request, next) => {
  const config = inject(DAHC_PORTAL_CONFIG);

  if (!isDahcApiUrl(request.url, config.apiBaseUrl)) {
    return next(request);
  }

  const authApi = inject(AuthApiService);
  const auth = inject(AuthService);
  const router = inject(Router);
  const notifications = inject(ProblemNotificationService);
  const callerHandlesProblems = request.context.get(DAHC_CALLER_HANDLES_PROBLEMS);

  const send = (outgoing: HttpRequest<unknown>): Observable<HttpEvent<unknown>> =>
    next(outgoing).pipe(map(event => toTypedEvent(event)));

  return send(request).pipe(
    catchError((error: unknown) => {
      const problem = toProblem(error);

      if (problem.status === 403 && problem.code === NOT_REGISTERED && !authApi.isSignInRequest(request.url)) {
        return authApi.signIn().pipe(switchMap(() => send(request)));
      }

      return throwError(() => new ApiProblemError(problem));
    }),
    catchError((error: unknown) => {
      const problemError = error instanceof ApiProblemError ? error : new ApiProblemError(toProblem(error));
      const problem = problemError.problem;

      if (problem.status === 401) {
        auth.signIn(router.url);
      } else if (!callerHandlesProblems) {
        if (problem.status === 409 && problem.code === DUPLICATE_ACCOUNT) {
          void router.navigateByUrl('/duplicate-account');
        } else if (problem.status === 403) {
          void router.navigateByUrl('/unauthorised');
        } else {
          notifications.show(problem);
        }
      }

      return throwError(() => problemError);
    }),
  );
};

function toTypedEvent(event: HttpEvent<unknown>): HttpEvent<unknown> {
  if (!(event instanceof HttpResponse) || !isEnvelope(event.body)) {
    return event;
  }

  const envelope = event.body;
  const result: ApiResult<unknown> = {
    data: envelope.data,
    messageCode: envelope.messageCode ?? null,
    message: envelope.message ?? null,
    pagination: envelope.pagination ?? null,
    etag: event.headers.get('ETag'),
  };

  return event.clone({ body: result });
}

function isEnvelope(body: unknown): body is ApiResponseBody<unknown> {
  return typeof body === 'object' && body !== null && 'data' in body;
}

function toProblem(error: unknown): ApiProblemDetails {
  if (error instanceof ApiProblemError) {
    return error.problem;
  }

  if (!(error instanceof HttpErrorResponse)) {
    return localProblem(0, 'client.unexpected_error');
  }

  if (isProblemBody(error.error)) {
    return error.error;
  }

  if (error.status === 0) {
    return localProblem(0, 'network.unavailable');
  }

  return localProblem(error.status, 'server.unexpected_response');
}

function isProblemBody(body: unknown): body is ApiProblemDetails {
  return (
    typeof body === 'object' &&
    body !== null &&
    typeof (body as Partial<ApiProblemDetails>).code === 'string' &&
    typeof (body as Partial<ApiProblemDetails>).status === 'number'
  );
}

/** A problem for failures that never reached the API or returned no Problem Details; there is no trace id. */
function localProblem(status: number, code: string): ApiProblemDetails {
  const detail =
    status === 0
      ? $localize`:@@portal.problem.network:We could not reach the admission service. Check your connection and try again.`
      : $localize`:@@portal.problem.unexpected:Something went wrong. Please try again later.`;

  return { type: 'about:blank', title: detail, status, code, traceId: null, detail };
}
