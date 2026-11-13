import { Routes } from '@angular/router';

import { permissionGuard } from '../../core/auth/permission.guard';
import { routeData } from '../../core/routing/route-data';
import { staffArea } from '../staff/staff-routes';

/** Finance area (US-1.3.13) for the finance officer, behind roleGuard in app.routes.ts. */
export const FINANCE_ROUTES: Routes = staffArea([
  {
    path: 'payments',
    title: $localize`:@@portal.title.finance.payments:Payments - GME Admissions`,
    canActivate: [permissionGuard('finance.payments.read')],
    loadComponent: () => import('./payments/payments-page.component').then(module => module.PaymentsPageComponent),
    data: routeData({ stories: ['US-1.3.13'] }),
  },
]);
