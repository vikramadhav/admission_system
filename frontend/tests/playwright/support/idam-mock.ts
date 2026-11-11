import { createSign, generateKeyPairSync } from 'node:crypto';

import { Page, Route } from '@playwright/test';

import { corsHeaders } from './cors';

/** Values of the portal's development environment (environment.development.ts). */
const AUTHORITY = 'https://idam.example.invalid/';
const OAUTH_BASE = `${AUTHORITY}mga/sps/oauth/oauth20`;
const METADATA_ADDRESS = `${OAUTH_BASE}/metadata/DahcDefinition`;
const SINGLE_SIGN_OUT = `${AUTHORITY}pkmslogout`;
const CLIENT_ID = 'dahc-portal-development';
const KEY_ID = 'playwright-test-key';

export const ACCESS_TOKEN = 'opaque-test-access-token';

/**
 * Stands in for IDAM so portal tests never call it (standard s.25): serves the per-definition
 * metadata, answers the authorization request with a code, issues an RS256-signed ID token
 * for the nonce the portal sent, accepts revocation and single sign-out.
 */
export class IdamMock {
  readonly revokedTokens: string[] = [];
  signOutRequest: URL | null = null;
  /** When set, the metadata address fails as if IDAM were down. */
  unavailable = false;

  private readonly keys = generateKeyPairSync('rsa', { modulusLength: 2048 });
  private nonce = '';

  async install(page: Page): Promise<void> {
    await page.route(url => url.href.startsWith(AUTHORITY), route => this.handle(route));
  }

  private async handle(route: Route): Promise<void> {
    const request = route.request();
    const url = new URL(request.url());

    if (request.method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: corsHeaders() });

      return;
    }

    if (url.href === METADATA_ADDRESS) {
      if (this.unavailable) {
        await route.fulfill({ status: 503, body: 'Service unavailable', headers: corsHeaders() });

        return;
      }

      await route.fulfill({ json: this.metadata(), headers: corsHeaders() });

      return;
    }

    if (url.pathname.endsWith('/jwks')) {
      await route.fulfill({ json: { keys: [this.publicJwk()] }, headers: corsHeaders() });

      return;
    }

    if (url.pathname.endsWith('/authorize')) {
      this.nonce = url.searchParams.get('nonce') ?? '';
      const redirect = new URL(url.searchParams.get('redirect_uri') ?? '');
      redirect.searchParams.set('code', 'test-authorization-code');
      redirect.searchParams.set('state', url.searchParams.get('state') ?? '');
      await route.fulfill({ status: 302, headers: { location: redirect.href } });

      return;
    }

    if (url.pathname.endsWith('/token')) {
      await route.fulfill({
        json: {
          access_token: ACCESS_TOKEN,
          id_token: this.idToken(),
          token_type: 'Bearer',
          expires_in: 3600,
          scope: 'openid profile email api',
        },
        headers: corsHeaders(),
      });

      return;
    }

    if (url.pathname.endsWith('/revoke')) {
      this.revokedTokens.push(request.postData() ?? '');
      await route.fulfill({ status: 200, body: '', headers: corsHeaders() });

      return;
    }

    if (url.href.startsWith(SINGLE_SIGN_OUT)) {
      this.signOutRequest = url;
      await route.fulfill({
        status: 302,
        headers: { location: url.searchParams.get('post_logout_redirect_uri') ?? '/' },
      });

      return;
    }

    await route.fulfill({ status: 404, body: 'Not mocked', headers: corsHeaders() });
  }

  private metadata(): Record<string, unknown> {
    return {
      issuer: AUTHORITY,
      authorization_endpoint: `${OAUTH_BASE}/authorize`,
      token_endpoint: `${OAUTH_BASE}/token`,
      userinfo_endpoint: `${OAUTH_BASE}/userinfo`,
      revocation_endpoint: `${OAUTH_BASE}/revoke`,
      introspection_endpoint: `${OAUTH_BASE}/introspect`,
      jwks_uri: `${OAUTH_BASE}/jwks`,
      response_types_supported: ['code'],
      code_challenge_methods_supported: ['S256'],
      id_token_signing_alg_values_supported: ['RS256'],
      scopes_supported: ['openid', 'profile', 'email', 'api'],
    };
  }

  private publicJwk(): Record<string, unknown> {
    return { ...this.keys.publicKey.export({ format: 'jwk' }), kid: KEY_ID, alg: 'RS256', use: 'sig' };
  }

  private idToken(): string {
    const now = Math.floor(Date.now() / 1000);
    const header = { alg: 'RS256', typ: 'JWT', kid: KEY_ID };
    const payload = {
      iss: AUTHORITY,
      sub: 'test-candidate',
      aud: CLIENT_ID,
      iat: now,
      exp: now + 3600,
      auth_time: now,
      nonce: this.nonce,
    };
    const signingInput = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(payload))}`;
    const signature = createSign('RSA-SHA256').update(signingInput).sign(this.keys.privateKey).toString('base64url');

    return `${signingInput}.${signature}`;
  }
}

function base64Url(text: string): string {
  return Buffer.from(text).toString('base64url');
}
