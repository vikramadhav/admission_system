import { DOCUMENT, Injectable, inject } from '@angular/core';
import { AbstractSecurityStorage } from 'angular-auth-oidc-client';

/**
 * Values of an authorization request in progress that must survive the full-page redirect
 * to IDAM and back. None of them is a token or personal data: the PKCE verifier, state,
 * nonce and flow flags are single-use and removed once the code is exchanged.
 */
const REDIRECT_KEYS = [
  'codeVerifier',
  'authStateControl',
  'authNonce',
  'storageCodeFlowInProgress',
  'storageCustomParamsAuthRequest',
] as const;

const STORAGE_PREFIX = 'dahc.auth.redirect.';
const RETURN_PATH_KEY = 'dahc.auth.returnPath';
const SESSION_STARTED_KEY = 'dahc.auth.sessionStarted';

type StoredState = Record<string, unknown>;

/**
 * Storage for the OIDC library. Everything, including tokens and user data, is held in memory
 * only. The only values copied to sessionStorage are the authorization-request values above,
 * the route to return to after sign-in, and a flag saying the DAHC session was started in this
 * tab (so a reload restores it with GET /auth/me instead of signing in again).
 */
@Injectable({ providedIn: 'root' })
export class AuthRedirectStorage implements AbstractSecurityStorage {
  private readonly document = inject(DOCUMENT);
  private readonly memory = new Map<string, string>();

  read(key: string): string | null {
    const inMemory = this.memory.get(key);

    if (inMemory !== undefined) {
      return inMemory;
    }

    const persisted = this.readSession(`${STORAGE_PREFIX}${key}`);

    if (persisted !== null) {
      this.memory.set(key, persisted);
    }

    return persisted;
  }

  write(key: string, value: string): void {
    this.memory.set(key, value);
    this.persistRedirectValues(key, value);
  }

  remove(key: string): void {
    this.memory.delete(key);
    this.removeSession(`${STORAGE_PREFIX}${key}`);
  }

  clear(): void {
    [...this.memory.keys()].forEach(key => this.removeSession(`${STORAGE_PREFIX}${key}`));
    this.memory.clear();
  }

  saveReturnPath(path: string): void {
    this.writeSession(RETURN_PATH_KEY, path);
  }

  /** Returns the saved route once and forgets it. Only same-application paths are accepted. */
  consumeReturnPath(): string | null {
    const path = this.readSession(RETURN_PATH_KEY);
    this.removeSession(RETURN_PATH_KEY);

    if (path === null || !path.startsWith('/') || path.startsWith('//')) {
      return null;
    }

    return path;
  }

  markSessionStarted(): void {
    this.writeSession(SESSION_STARTED_KEY, 'true');
  }

  isSessionStarted(): boolean {
    return this.readSession(SESSION_STARTED_KEY) === 'true';
  }

  forgetSession(): void {
    this.removeSession(SESSION_STARTED_KEY);
    this.removeSession(RETURN_PATH_KEY);
  }

  private persistRedirectValues(key: string, value: string): void {
    const storageKey = `${STORAGE_PREFIX}${key}`;
    const parsed = this.parse(value);
    const redirectValues: StoredState = {};

    for (const redirectKey of REDIRECT_KEYS) {
      if (parsed[redirectKey] !== undefined) {
        redirectValues[redirectKey] = parsed[redirectKey];
      }
    }

    // Once tokens exist the redirect is complete, so nothing about it is kept outside memory.
    if (Object.keys(redirectValues).length === 0 || parsed['authzData'] !== undefined) {
      this.removeSession(storageKey);

      return;
    }

    this.writeSession(storageKey, JSON.stringify(redirectValues));
  }

  private parse(value: string): StoredState {
    try {
      const parsed: unknown = JSON.parse(value);

      return typeof parsed === 'object' && parsed !== null ? (parsed as StoredState) : {};
    } catch {
      return {};
    }
  }

  private readSession(key: string): string | null {
    try {
      return this.document.defaultView?.sessionStorage.getItem(key) ?? null;
    } catch {
      return null;
    }
  }

  private writeSession(key: string, value: string): void {
    try {
      this.document.defaultView?.sessionStorage.setItem(key, value);
    } catch {
      // Without sessionStorage the redirect cannot be completed; IDAM sign-in then starts again.
    }
  }

  private removeSession(key: string): void {
    try {
      this.document.defaultView?.sessionStorage.removeItem(key);
    } catch {
      // Nothing was stored if storage is unavailable.
    }
  }
}
