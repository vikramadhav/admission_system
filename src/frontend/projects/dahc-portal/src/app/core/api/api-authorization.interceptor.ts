import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { first, switchMap } from 'rxjs';

import { AuthService } from '../auth/auth.service';
import { DAHC_PORTAL_CONFIG } from '../config/portal-config';
import { LocaleService } from '../locale/locale.service';
import { isDahcApiUrl } from './api-request';

/**
 * Adds the IDAM access token, and the UI culture for localized API messages, to requests
 * for the configured API base URL only. Requests to any other origin are passed through untouched.
 */
export const apiAuthorizationInterceptor: HttpInterceptorFn = (request, next) => {
  const config = inject(DAHC_PORTAL_CONFIG);

  if (!isDahcApiUrl(request.url, config.apiBaseUrl)) {
    return next(request);
  }

  const auth = inject(AuthService);
  const culture = inject(LocaleService).culture;

  return auth.getAccessToken().pipe(
    first(),
    switchMap(accessToken => {
      const headers: Record<string, string> = { 'Accept-Language': culture };

      if (accessToken !== '') {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      return next(request.clone({ setHeaders: headers }));
    }),
  );
};
