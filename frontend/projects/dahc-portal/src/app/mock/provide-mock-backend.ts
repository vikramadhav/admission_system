import { EnvironmentProviders, inject, makeEnvironmentProviders } from '@angular/core';
import { ROUTES } from '@angular/router';

import { DAHC_ALTERNATIVE_SIGN_IN, DahcAlternativeSignIn } from '../core/auth/alternative-sign-in';
import { AuthService } from '../core/auth/auth.service';
import { MockAuthService } from './mock-auth.service';
import { MockBackendService } from './mock-backend.service';
import { MOCK_PERSONAS } from './mock-personas';

/**
 * What the mock build adds besides its interceptor: persona sign-in instead of IDAM and the mock
 * payment gateway page. Imported only by environment.mock.ts.
 */
export function provideMockBackend(): EnvironmentProviders {
  return makeEnvironmentProviders([
    MockAuthService,
    { provide: AuthService, useExisting: MockAuthService },
    {
      provide: DAHC_ALTERNATIVE_SIGN_IN,
      useFactory: (): DahcAlternativeSignIn => {
        const auth = inject(MockAuthService);
        const backend = inject(MockBackendService);

        return {
          personas: MOCK_PERSONAS,
          signInAs: (personaId, returnPath) => auth.signInAs(personaId, returnPath),
          reset: () => backend.reset(),
        };
      },
    },
    {
      // Registered before the application routes (environment providers come first), so the
      // not-found route does not hide it.
      provide: ROUTES,
      multi: true,
      useValue: [
        {
          path: 'mock-payment-gateway',
          title: 'Payment gateway (mock)',
          loadComponent: () => import('./mock-payment-gateway.component').then(module => module.MockPaymentGatewayComponent),
        },
      ],
    },
  ]);
}
