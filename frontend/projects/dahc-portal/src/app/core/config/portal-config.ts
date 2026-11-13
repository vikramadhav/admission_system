import { InjectionToken } from '@angular/core';

export type DahcCulture = 'en-AE' | 'ar-AE';

/** IDAM settings for the web client, a public client using authorization code with PKCE. */
export interface DahcIdamConfig {
  /** Issuer of the IDAM definition, exactly as IDAM publishes it (including any trailing slash). */
  readonly authority: string;
  /** IDAM publishes metadata per definition at {authority}mga/sps/oauth/oauth20/metadata/{definition}, not at .well-known. */
  readonly metadataAddress: string;
  readonly clientId: string;
  readonly scopes: string;
  /** Redirect URI per locale build, exactly as registered in IDAM. */
  readonly redirectUris: Readonly<Record<DahcCulture, string>>;
  /** Post-logout redirect URI per locale build, exactly as registered in IDAM. */
  readonly postLogoutRedirectUris: Readonly<Record<DahcCulture, string>>;
  /** IDAM publishes no end_session_endpoint; sign-out navigates to this single sign-out page. */
  readonly singleSignOutUrl: string;
}

/** Per-environment portal configuration. Holds no secrets: the web client is a public client. */
export interface DahcPortalConfig {
  readonly production: boolean;
  /** Base URL of the DAHC API including /api/v1, without a trailing slash. */
  readonly apiBaseUrl: string;
  readonly idam: DahcIdamConfig;
  /** Used until the signed-in user's own time zone is known. */
  readonly defaultTimeZoneId: string;
  /** Path of each locale build, used by the language switch. */
  readonly localeBasePaths: Readonly<Record<DahcCulture, string>>;
  /**
   * Inactivity sign-out, used until the API returns CandidateDashboard.sessionTimeoutMinutes.
   * The BRD gives no value; Figma shows 30 minutes (OQ-C9).
   */
  readonly sessionTimeoutMinutes: number;
  /**
   * Admission cycle used by operations that require a cycleId and have no other source, for
   * example the CASPER import (US-4.2.1). The contract has no "current cycle" operation (OQ-24,
   * PQ-12); when absent those actions explain that they are unavailable.
   */
  readonly admissionCycleId?: string | null;
  /** True only in the mock build: the API is answered in the browser and mock-only routes are enabled. */
  readonly mockApi?: boolean;
}

export const DAHC_PORTAL_CONFIG = new InjectionToken<DahcPortalConfig>('DAHC_PORTAL_CONFIG');
