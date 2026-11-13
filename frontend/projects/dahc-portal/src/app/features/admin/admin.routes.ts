import { Routes } from '@angular/router';

import { permissionGuard } from '../../core/auth/permission.guard';
import { routeData } from '../../core/routing/route-data';
import { staffArea } from '../staff/staff-routes';

/**
 * Administration area for the administrator (contract Administration tag: staff users and
 * integration clients; owner decision 2026-11-13, PQ-06). Behind roleGuard in app.routes.ts.
 */
export const ADMIN_ROUTES: Routes = staffArea([
  {
    path: 'staff-users',
    title: $localize`:@@portal.title.admin.staffUsers:Staff users - GME Admissions`,
    canActivate: [permissionGuard('admin.staffUsers.manage')],
    loadComponent: () => import('./staff-users/staff-users-page.component').then(module => module.StaffUsersPageComponent),
    data: routeData({ stories: [] }),
  },
  {
    path: 'staff-users/:staffUserId',
    title: $localize`:@@portal.title.admin.staffUser:Staff user - GME Admissions`,
    canActivate: [permissionGuard('admin.staffUsers.manage')],
    loadComponent: () => import('./staff-users/staff-user-page.component').then(module => module.StaffUserPageComponent),
    data: routeData({ stories: [] }),
  },
  {
    path: 'integration-clients',
    title: $localize`:@@portal.title.admin.integrationClients:Integration clients - GME Admissions`,
    canActivate: [permissionGuard('admin.integrationClients.manage')],
    loadComponent: () => import('./integration-clients/integration-clients-page.component').then(module => module.IntegrationClientsPageComponent),
    data: routeData({ stories: [] }),
  },
]);
