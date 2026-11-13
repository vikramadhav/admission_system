import { HttpInterceptorFn } from '@angular/common/http';
import { EnvironmentProviders, Provider } from '@angular/core';

import { DahcPortalConfig } from '../app/core/config/portal-config';

// Local development: the portal runs on the Angular dev server and the API on its
// development port. IDAM values are placeholders until the development IDAM client is registered.
export const environment: DahcPortalConfig = {
  production: false,
  apiBaseUrl: 'https://localhost:5001/api/v1',
  idam: {
    authority: 'https://idam.example.invalid/',
    metadataAddress: 'https://idam.example.invalid/mga/sps/oauth/oauth20/metadata/DahcDefinition',
    clientId: 'dahc-portal-development',
    scopes: 'openid profile email api',
    redirectUris: {
      'en-AE': 'http://localhost:4200/auth/callback',
      'ar-AE': 'http://localhost:4200/auth/callback',
    },
    postLogoutRedirectUris: {
      'en-AE': 'http://localhost:4200/signed-out',
      'ar-AE': 'http://localhost:4200/signed-out',
    },
    singleSignOutUrl: 'https://idam.example.invalid/pkmslogout',
  },
  defaultTimeZoneId: 'Asia/Dubai',
  sessionTimeoutMinutes: 30,
  localeBasePaths: {
    'en-AE': '/',
    'ar-AE': '/',
  },
};

/** Extra providers of this environment; the mock environment adds the mock backend here. */
export const environmentProviders: (Provider | EnvironmentProviders)[] = [];

/** Extra HTTP interceptors of this environment, run after the portal's own. */
export const environmentInterceptors: HttpInterceptorFn[] = [];
