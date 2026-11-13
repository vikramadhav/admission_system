import { HttpInterceptorFn } from '@angular/common/http';
import { EnvironmentProviders, Provider } from '@angular/core';

import { DahcPortalConfig } from '../app/core/config/portal-config';
import { mockApiInterceptor } from '../app/mock/mock-api.interceptor';
import { provideMockBackend } from '../app/mock/provide-mock-backend';

// Mock build (npm run start:mock): the API is answered in the browser from an in-memory store
// with the contract's shapes, and sign-in is a persona chooser instead of IDAM. Only this file
// imports the mock folder, so no other build contains it.
export const environment: DahcPortalConfig = {
  production: false,
  apiBaseUrl: '/api/v1',
  idam: {
    authority: 'https://idam.example.invalid/',
    metadataAddress: 'https://idam.example.invalid/mga/sps/oauth/oauth20/metadata/DahcDefinition',
    clientId: 'dahc-portal-mock',
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
  mockApi: true,
};

export const environmentProviders: (Provider | EnvironmentProviders)[] = [provideMockBackend()];

/** The mock API answers last, after the portal's own interceptors. */
export const environmentInterceptors: HttpInterceptorFn[] = [mockApiInterceptor];
