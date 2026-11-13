import { DOCUMENT, Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';

import { AuthService, SignInFailure } from '../core/auth/auth.service';
import { AuthRedirectStorage } from '../core/auth/auth-redirect-storage';
import { MockBackendService } from './mock-backend.service';

type PublicAuth = Pick<
  AuthService,
  'isAuthenticated' | 'failure' | 'initialize' | 'signIn' | 'consumeReturnPath' | 'getAccessToken' | 'signOut'
>;

/**
 * Replaces IDAM in the mock build: "signing in" means choosing a persona on the sign-in page.
 * A full page load follows every sign-in and sign-out, so the in-memory session starts clean.
 */
@Injectable()
export class MockAuthService implements PublicAuth {
  private readonly backend = inject(MockBackendService);
  private readonly router = inject(Router);
  private readonly storage = inject(AuthRedirectStorage);
  private readonly document = inject(DOCUMENT);
  private readonly authenticatedState = signal<boolean>(this.backend.signedInUserId() !== null);
  private readonly failureState = signal<SignInFailure | null>(null);

  readonly isAuthenticated = this.authenticatedState.asReadonly();
  readonly failure = this.failureState.asReadonly();

  initialize(): Promise<void> {
    return Promise.resolve();
  }

  signIn(returnPath = '/candidate/dashboard'): void {
    void this.router.navigate(['/auth/sign-in'], { queryParams: { returnUrl: returnPath } });
  }

  /** Called by the sign-in page with the chosen persona. */
  signInAs(personaId: string, returnPath: string): void {
    this.storage.forgetSession();
    this.backend.signIn(personaId);
    this.document.location.assign(returnPath.startsWith('/') ? returnPath : '/candidate/dashboard');
  }

  consumeReturnPath(): string {
    return this.storage.consumeReturnPath() ?? '/candidate/dashboard';
  }

  getAccessToken(): Observable<string> {
    return of(this.authenticatedState() ? 'mock-access-token' : '');
  }

  signOut(): Promise<void> {
    this.backend.signOut();
    this.storage.forgetSession();
    this.authenticatedState.set(false);
    this.document.location.assign('/signed-out');

    return Promise.resolve();
  }
}
