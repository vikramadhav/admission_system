import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResult } from '../core/api/api.models';
import { DAHC_PORTAL_CONFIG } from '../core/config/portal-config';
import { AuthSession } from './auth.models';

/** Identity operations signIn and getCurrentSession. */
@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(DAHC_PORTAL_CONFIG).apiBaseUrl;

  /** POST /auth/sign-in: provisions a candidate or matches a pre-registered staff user. */
  signIn(context: HttpContext = new HttpContext()): Observable<ApiResult<AuthSession>> {
    return this.http.post<ApiResult<AuthSession>>(this.signInUrl(), null, { context });
  }

  /** GET /auth/me: the current session, without provisioning. */
  getCurrentSession(context: HttpContext = new HttpContext()): Observable<ApiResult<AuthSession>> {
    return this.http.get<ApiResult<AuthSession>>(`${this.baseUrl}/auth/me`, { context });
  }

  isSignInRequest(url: string): boolean {
    return url === this.signInUrl();
  }

  private signInUrl(): string {
    return `${this.baseUrl}/auth/sign-in`;
  }
}
