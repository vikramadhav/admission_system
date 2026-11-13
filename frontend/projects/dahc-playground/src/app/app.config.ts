import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { playgroundRoutes, providePlayground } from 'dahc-playground-kit';

import { DAHC_PLAYGROUND_CONFIG } from './playground.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    providePlayground(DAHC_PLAYGROUND_CONFIG),
    provideRouter(playgroundRoutes(DAHC_PLAYGROUND_CONFIG), withComponentInputBinding()),
    provideHttpClient(withFetch()),
  ],
};
