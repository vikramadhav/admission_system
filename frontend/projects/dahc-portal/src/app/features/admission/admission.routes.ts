import { Routes } from '@angular/router';

import { permissionGuard } from '../../core/auth/permission.guard';
import { routeData } from '../../core/routing/route-data';
import { staffArea } from '../staff/staff-routes';

/**
 * Admission area (EPIC-02 verification, EPIC-04 screening) for the admission officer and
 * supervisor, behind roleGuard in app.routes.ts. Every page also checks its permission.
 */
export const ADMISSION_ROUTES: Routes = staffArea([
  {
    path: 'officer',
    title: $localize`:@@portal.title.admission.officer:My applications - GME Admissions`,
    canActivate: [permissionGuard('admission.officer.dashboard')],
    loadComponent: () => import('./officer-dashboard/officer-dashboard-page.component').then(module => module.OfficerDashboardPageComponent),
    data: routeData({ stories: ['US-2.1.2', 'US-2.2.1'] }),
  },
  {
    path: 'applications/:applicationId',
    title: $localize`:@@portal.title.admission.application:Application review - GME Admissions`,
    canActivate: [permissionGuard('admission.application.read')],
    loadComponent: () => import('./application-review/application-review-page.component').then(module => module.ApplicationReviewPageComponent),
    data: routeData({ stories: ['US-2.3.1', 'US-2.3.2', 'US-2.3.3', 'US-2.3.5', 'US-2.3.6', 'US-2.4.1', 'US-2.4.2', 'US-2.4.3', 'US-2.4.4', 'US-2.4.5', 'US-2.5.2', 'US-2.5.3'] }),
  },
  {
    path: 'supervisor',
    title: $localize`:@@portal.title.admission.supervisor:Supervision - GME Admissions`,
    canActivate: [permissionGuard('admission.supervisor.dashboard')],
    loadComponent: () => import('./supervisor-dashboard/supervisor-dashboard-page.component').then(module => module.SupervisorDashboardPageComponent),
    data: routeData({ stories: ['US-2.1.3', 'US-2.2.2', 'US-3.1.3'] }),
  },
  {
    path: 'supervisor/officers/:officerId',
    title: $localize`:@@portal.title.admission.officerWorkload:Officer workload - GME Admissions`,
    canActivate: [permissionGuard('admission.workload.read')],
    loadComponent: () => import('./officer-workload/officer-workload-page.component').then(module => module.OfficerWorkloadPageComponent),
    data: routeData({ stories: ['US-2.2.2', 'US-2.2.3'] }),
  },
  {
    path: 'supervisor/reinstatements',
    title: $localize`:@@portal.title.admission.reinstatements:Reinstatement requests - GME Admissions`,
    canActivate: [permissionGuard('admission.reinstatement.read')],
    loadComponent: () => import('./reinstatements/reinstatement-queue-page.component').then(module => module.ReinstatementQueuePageComponent),
    data: routeData({ stories: ['US-2.5.1'] }),
  },
  {
    path: 'supervisor/reinstatements/:requestId',
    title: $localize`:@@portal.title.admission.reinstatement:Reinstatement request - GME Admissions`,
    canActivate: [permissionGuard('admission.reinstatement.read')],
    loadComponent: () => import('./reinstatements/reinstatement-request-page.component').then(module => module.ReinstatementRequestPageComponent),
    data: routeData({ stories: ['US-2.5.1', 'US-2.5.2'] }),
  },
  {
    path: 'supervisor/duplicate-accounts',
    title: $localize`:@@portal.title.admission.duplicates:Duplicate accounts - GME Admissions`,
    canActivate: [permissionGuard('admission.duplicates.read')],
    loadComponent: () => import('./duplicate-accounts/duplicate-accounts-page.component').then(module => module.DuplicateAccountsPageComponent),
    data: routeData({ stories: ['US-1.1.1'] }),
  },
  {
    path: 'screening',
    title: $localize`:@@portal.title.admission.screening:Screening - GME Admissions`,
    canActivate: [permissionGuard('admission.screening.read')],
    loadComponent: () => import('./screening/screening-dashboard-page.component').then(module => module.ScreeningDashboardPageComponent),
    data: routeData({ stories: ['US-4.1.1', 'US-4.2.1', 'US-4.3.1', 'US-4.4.1', 'US-4.5.1'] }),
  },
]);
