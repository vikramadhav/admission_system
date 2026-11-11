import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { apiAuthorizationInterceptor } from './core/api/api-authorization.interceptor';
import { apiResponseInterceptor } from './core/api/api-response.interceptor';
import { provideDahcAuth } from './core/auth/auth.providers';
import { AuthService } from './core/auth/auth.service';
import { DAHC_PORTAL_CONFIG } from './core/config/portal-config';
import { LocaleService } from './core/locale/locale.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: DAHC_PORTAL_CONFIG, useValue: environment },
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch(), withInterceptors([apiAuthorizationInterceptor, apiResponseInterceptor])),
    provideDahcAuth(),
    provideAppInitializer(() => {
      inject(LocaleService).applyDocumentLanguage();

      return inject(AuthService).initialize();
    }),
  ],
};
