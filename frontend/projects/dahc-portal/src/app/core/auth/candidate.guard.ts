import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';
import { SessionService } from './session.service';

const DUPLICATE_ACCOUNT = 'account.duplicate';

/**
 * Lets a signed-in candidate into the candidate screens. A usability aid only: the API
 * authorizes every request. Without IDAM tokens a new sign-in starts.
 */
export const candidateGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthService);
  const sessions = inject(SessionService);
  const router = inject(Router);

  if (auth.failure() !== null) {
    return router.parseUrl('/auth/callback');
  }

  if (!auth.isAuthenticated()) {
    auth.signIn(state.url);

    return false;
  }

  const session = await sessions.ensureSession();

  if (session === null) {
    const problem = sessions.problem();

    if (problem?.code === DUPLICATE_ACCOUNT) {
      return router.parseUrl('/duplicate-account');
    }

    if (problem?.status === 403) {
      return router.parseUrl('/not-allowed');
    }

    return router.parseUrl('/auth/callback');
  }

  return session.userType === 'CANDIDATE' ? true : router.parseUrl('/not-allowed');
};
