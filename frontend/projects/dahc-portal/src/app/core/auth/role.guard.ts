import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router, UrlSegment } from '@angular/router';

import { RoleCode, roleHome } from './roles';
import { SessionAccessService } from './session-access.service';
import { SessionService } from './session.service';

/**
 * Lets the area match only when the active role is one of `roles`, so the lazy chunk of an
 * area the user cannot use is never loaded. Not signed in: a sign-in starts and comes back here.
 * Wrong role: the unauthorised page. A usability aid only: the API authorizes every request
 * with the server-stored active role.
 */
export function roleGuard(...roles: readonly RoleCode[]): CanMatchFn {
  return async (_route, segments) => {
    const access = inject(SessionAccessService);
    const sessions = inject(SessionService);
    const router = inject(Router);
    const signedIn = await access.ensure(returnUrlOf(router, segments));

    if (signedIn !== true) {
      return signedIn;
    }

    const activeRole = sessions.session()?.activeRole ?? '';

    return (roles as readonly string[]).includes(activeRole) ? true : router.parseUrl('/unauthorised');
  };
}

/** Sends a signed-in user to the home page of their active role (the portal root, an area root). */
export const roleHomeGuard: CanActivateFn = async (_route, state) => {
  const access = inject(SessionAccessService);
  const sessions = inject(SessionService);
  const router = inject(Router);
  const signedIn = await access.ensure(state.url);

  if (signedIn !== true) {
    return signedIn;
  }

  return router.parseUrl(roleHome(sessions.session()?.activeRole));
};

function returnUrlOf(router: Router, segments: readonly UrlSegment[]): string {
  const navigation = router.currentNavigation();

  return navigation ? router.serializeUrl(navigation.extractedUrl) : '/' + segments.map(segment => segment.path).join('/');
}
