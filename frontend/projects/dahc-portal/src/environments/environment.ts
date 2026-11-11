import { DahcPortalConfig } from '../app/core/config/portal-config';

// Template for deployed environments. Each environment replaces this file through its own
// build configuration (fileReplacements). The .invalid hosts can never resolve, so a build
// that was not configured fails visibly instead of calling a real system.
export const environment: DahcPortalConfig = {
  production: true,
  apiBaseUrl: 'https://api.example.invalid/api/v1',
  idam: {
    authority: 'https://idam.example.invalid/',
    metadataAddress: 'https://idam.example.invalid/mga/sps/oauth/oauth20/metadata/DahcDefinition',
    clientId: 'dahc-portal',
    scopes: 'openid profile email api',
    redirectUris: {
      'en-AE': 'https://portal.example.invalid/en/auth/callback',
      'ar-AE': 'https://portal.example.invalid/ar/auth/callback',
    },
    postLogoutRedirectUris: {
      'en-AE': 'https://portal.example.invalid/en/signed-out',
      'ar-AE': 'https://portal.example.invalid/ar/signed-out',
    },
    singleSignOutUrl: 'https://idam.example.invalid/pkmslogout',
  },
  defaultTimeZoneId: 'Asia/Dubai',
  localeBasePaths: {
    'en-AE': '/en/',
    'ar-AE': '/ar/',
  },
};
