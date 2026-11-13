import { DOCUMENT, Injectable, inject, signal } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Observable, catchError, firstValueFrom, of } from 'rxjs';

import { DAHC_PORTAL_CONFIG } from '../config/portal-config';
import { LocaleService } from '../locale/locale.service';
import { AuthRedirectStorage } from './auth-redirect-storage';

export type SignInFailure = 'idam_unavailable' | 'sign_in_not_completed';

/**
 * IDAM sign-in and sign-out through the approved OIDC library (authorization code with PKCE,
 * public client). Tokens stay in the library's memory; this service never decodes them.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly oidc = inject(OidcSecurityService);
  private readonly storage = inject(AuthRedirectStorage);
  private readonly config = inject(DAHC_PORTAL_CONFIG);
  private readonly locale = inject(LocaleService);
  private readonly document = inject(DOCUMENT);
  private readonly authenticatedState = signal<boolean>(false);
  private readonly failureState = signal<SignInFailure | null>(null);

  /** True when IDAM tokens are held in memory. */
  readonly isAuthenticated = this.authenticatedState.asReadonly();
  /** Why the last sign-in could not be completed, if it could not. */
  readonly failure = this.failureState.asReadonly();

  /** Completes an IDAM redirect if the URL carries one; run once before the first navigation. */
  async initialize(): Promise<void> {
    try {
      // Endpoints live in memory only, so after the IDAM redirect they are loaded again
      // before the code is exchanged.
      await firstValueFrom(this.oidc.preloadAuthWellKnownDocument());
      const response = await firstValueFrom(this.oidc.checkAuth());
      this.authenticatedState.set(response.isAuthenticated);

      if (!response.isAuthenticated && response.errorMessage) {
        this.failureState.set('sign_in_not_completed');
      }
    } catch {
      // The metadata address or token endpoint could not be reached: fail closed.
      this.authenticatedState.set(false);
      this.failureState.set('idam_unavailable');
    }
  }

  /** Starts a new IDAM sign-in and returns to the given route afterwards. */
  signIn(returnPath = '/'): void {
    this.storage.saveReturnPath(returnPath);

    if (this.authenticatedState()) {
      // The tokens in memory were rejected (401); drop them before asking IDAM again.
      this.oidc.logoffLocal();
      this.authenticatedState.set(false);
    }

    this.oidc.authorize();
  }

  consumeReturnPath(): string {
    return this.storage.consumeReturnPath() ?? '/';
  }

  /** The access token, or an empty string when signed out. */
  getAccessToken(): Observable<string> {
    return this.oidc.getAccessToken().pipe(catchError(() => of('')));
  }

  /**
   * Revokes the tokens at IDAM, clears them from memory and navigates to the IDAM single
   * sign-out page with id_token_hint, the registered post-logout redirect URI and state.
   */
  async signOut(): Promise<void> {
    const idToken = await firstValueFrom(this.oidc.getIdToken().pipe(catchError(() => of(''))));

    try {
      await firstValueFrom(this.oidc.revokeAccessToken());
    } catch {
      // Revocation is best effort: the local sign-out and IDAM single sign-out still happen.
    }

    this.oidc.logoffLocal();
    this.storage.forgetSession();
    this.authenticatedState.set(false);

    const signOutUrl = new URL(this.config.idam.singleSignOutUrl);
    signOutUrl.searchParams.set('id_token_hint', idToken);
    signOutUrl.searchParams.set('post_logout_redirect_uri', this.config.idam.postLogoutRedirectUris[this.locale.culture]);
    signOutUrl.searchParams.set('state', crypto.randomUUID());
    this.document.location.assign(signOutUrl.toString());
  }
}
