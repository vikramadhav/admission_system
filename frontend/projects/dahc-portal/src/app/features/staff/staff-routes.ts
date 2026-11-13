import { Routes } from '@angular/router';

import { roleHomeGuard } from '../../core/auth/role.guard';

/**
 * Routes of a staff area: the staff layout as the parent, the area root redirecting to the
 * active role's home, and the area's pages. Each page also checks its permission with permissionGuard.
 */
export function staffArea(children: Routes): Routes {
  return [
    {
      path: '',
      loadComponent: () => import('../../layouts/staff-layout/staff-layout.component').then(module => module.StaffLayoutComponent),
      children: [{ path: '', pathMatch: 'full', canActivate: [roleHomeGuard], children: [] }, ...children],
    },
  ];
}
