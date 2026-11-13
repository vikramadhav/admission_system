import { EnvironmentProviders, LOCALE_ID, inject, makeEnvironmentProviders } from '@angular/core';
import {
  AbstractSecurityStorage,
  LogLevel,
  OpenIdConfiguration,
  StsConfigLoader,
  StsConfigStaticLoader,
  provideAuth,
} from 'angular-auth-oidc-client';

import { DAHC_PORTAL_CONFIG, DahcCulture, DahcPortalConfig } from '../config/portal-config';
import { AuthRedirectStorage } from './auth-redirect-storage';

/**
 * Configures the OIDC library for IDAM: authorization code with PKCE as a public client,
 * endpoints from the configured metadata address, tokens in memory, no refresh tokens or
 * silent renewal until IDAM confirms its renewal method (standard s.30).
 */
export function provideDahcAuth(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideAuth({
      loader: {
        provide: StsConfigLoader,
        useFactory: (): StsConfigLoader =>
          new StsConfigStaticLoader(createOidcConfiguration(inject(DAHC_PORTAL_CONFIG), inject(LOCALE_ID))),
      },
    }),
    { provide: AbstractSecurityStorage, useExisting: AuthRedirectStorage },
  ]);
}

function createOidcConfiguration(config: DahcPortalConfig, localeId: string): OpenIdConfiguration {
  const culture: DahcCulture = localeId === 'ar-AE' ? 'ar-AE' : 'en-AE';

  return {
    configId: 'idam',
    authority: config.idam.authority,
    authWellknownEndpointUrl: config.idam.metadataAddress,
    authWellknownUrlSuffix: metadataPathAfterIssuer(config.idam.authority, config.idam.metadataAddress),
    clientId: config.idam.clientId,
    scope: config.idam.scopes,
    responseType: 'code',
    redirectUrl: config.idam.redirectUris[culture],
    postLogoutRedirectUri: config.idam.postLogoutRedirectUris[culture],
    silentRenew: false,
    useRefreshToken: false,
    startCheckSession: false,
    // Identity comes from the DAHC API, which calls UserInfo itself; the browser does not.
    autoUserInfo: false,
    renewUserInfoAfterTokenRenew: false,
    triggerAuthorizationResultEvent: true,
    logLevel: config.production ? LogLevel.None : LogLevel.Warn,
  };
}

/**
 * IDAM publishes metadata at {authority}mga/sps/oauth/oauth20/metadata/{definition}, not at
 * /.well-known/openid-configuration. The library appends its suffix unless the address already
 * contains it, and checks the issuer against the address without the suffix, so the suffix is
 * the metadata path after the issuer.
 */
function metadataPathAfterIssuer(authority: string, metadataAddress: string): string {
  const issuerWithoutSlash = authority.replace(/\/+$/, '');

  return metadataAddress.startsWith(issuerWithoutSlash) ? metadataAddress.slice(issuerWithoutSlash.length) : metadataAddress;
}
