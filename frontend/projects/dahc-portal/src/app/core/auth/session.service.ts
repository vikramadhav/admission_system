import { HttpContext } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { AuthApiService } from '../../api/auth-api.service';
import { AuthSession } from '../../api/auth.models';
import { isApiProblemError } from '../api/api-problem-error';
import { DAHC_CALLER_HANDLES_PROBLEMS } from '../api/api-request';
import { ApiProblemDetails } from '../api/api.models';
import { DAHC_PORTAL_CONFIG } from '../config/portal-config';
import { AuthRedirectStorage } from './auth-redirect-storage';

/**
 * The DAHC session (profile, roles, active role, preferences) as returned by the API. It is
 * held in memory only: the first sign-in in a tab calls POST /auth/sign-in, a reload of the
 * same tab restores it with GET /auth/me.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly authApi = inject(AuthApiService);
  private readonly storage = inject(AuthRedirectStorage);
  private readonly defaultTimeZoneId = inject(DAHC_PORTAL_CONFIG).defaultTimeZoneId;
  private readonly currentSession = signal<AuthSession | null>(null);
  private readonly currentProblem = signal<ApiProblemDetails | null>(null);
  private pending: Promise<AuthSession | null> | null = null;

  readonly session = this.currentSession.asReadonly();
  /** Why the session could not be established, shown on the sign-in page. */
  readonly problem = this.currentProblem.asReadonly();
  readonly timeZoneId = computed<string>(() => this.currentSession()?.preferences.timeZoneId ?? this.defaultTimeZoneId);

  /** Establishes the session once per page load; later calls share the same result. */
  ensureSession(): Promise<AuthSession | null> {
    this.pending ??= this.establish();

    return this.pending;
  }

  private async establish(): Promise<AuthSession | null> {
    const context = new HttpContext().set(DAHC_CALLER_HANDLES_PROBLEMS, true);
    const request = this.storage.isSessionStarted()
      ? this.authApi.getCurrentSession(context)
      : this.authApi.signIn(context);

    try {
      const result = await firstValueFrom(request);
      this.currentSession.set(result.data);
      this.storage.markSessionStarted();

      return result.data;
    } catch (error: unknown) {
      if (!isApiProblemError(error)) {
        throw error;
      }

      this.currentProblem.set(error.problem);

      return null;
    }
  }
}
