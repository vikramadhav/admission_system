import { Injectable, inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';

import { AuthService } from './auth.service';
import { SessionService } from './session.service';

const DUPLICATE_ACCOUNT = 'account.duplicate';

/**
 * The signed-in check shared by the guards: IDAM tokens, then the DAHC session. Without
 * tokens a new sign-in starts and returns to `returnUrl` afterwards.
 */
@Injectable({ providedIn: 'root' })
export class SessionAccessService {
  private readonly auth = inject(AuthService);
  private readonly sessions = inject(SessionService);
  private readonly router = inject(Router);

  /** True when signed in with a session, otherwise where to go instead (false: a sign-in started). */
  async ensure(returnUrl: string): Promise<true | false | UrlTree> {
    if (this.auth.failure() !== null) {
      return this.router.parseUrl('/auth/callback');
    }

    if (!this.auth.isAuthenticated()) {
      this.auth.signIn(returnUrl);

      return false;
    }

    const session = await this.sessions.ensureSession();

    if (session !== null) {
      return true;
    }

    const problem = this.sessions.problem();

    if (problem?.code === DUPLICATE_ACCOUNT) {
      return this.router.parseUrl('/duplicate-account');
    }

    if (problem?.status === 403) {
      return this.router.parseUrl('/unauthorised');
    }

    return this.router.parseUrl('/auth/callback');
  }
}
