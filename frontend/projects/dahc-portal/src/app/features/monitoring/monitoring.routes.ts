import { Routes } from '@angular/router';

import { permissionGuard } from '../../core/auth/permission.guard';
import { routeData } from '../../core/routing/route-data';

/**
 * Central monitoring area (US-2.1.4) for the central monitor and, as the contract allows, the
 * admission supervisor (PQ-07). Behind roleGuard in app.routes.ts. Everything here is read-only.
 */
export const MONITORING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('../../layouts/staff-layout/staff-layout.component').then(module => module.StaffLayoutComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: $localize`:@@portal.title.monitoring.dashboard:Site monitoring - GME Admissions`,
        canActivate: [permissionGuard('monitoring.dashboard.read')],
        loadComponent: () => import('./dashboard/monitoring-dashboard-page.component').then(module => module.MonitoringDashboardPageComponent),
        data: routeData({ stories: ['US-2.1.4'] }),
      },
      {
        path: 'applications',
        title: $localize`:@@portal.title.monitoring.applications:Applications - GME Admissions`,
        canActivate: [permissionGuard('monitoring.applications.read')],
        loadComponent: () => import('./applications/monitoring-applications-page.component').then(module => module.MonitoringApplicationsPageComponent),
        data: routeData({ stories: ['US-2.1.4'] }),
      },
      {
        path: 'applications/:applicationId',
        title: $localize`:@@portal.title.monitoring.application:Application details - GME Admissions`,
        canActivate: [permissionGuard('monitoring.applications.read')],
        loadComponent: () => import('./application/monitoring-application-page.component').then(module => module.MonitoringApplicationPageComponent),
        data: routeData({ stories: ['US-2.1.4'] }),
      },
    ],
  },
];
