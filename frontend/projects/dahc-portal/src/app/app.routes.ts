import { Routes } from '@angular/router';

import { roleGuard, roleHomeGuard } from './core/auth/role.guard';
import { AREA_ROLES } from './core/auth/roles';

/**
 * Top-level routes. Each role family has its own lazy area; canMatch lets an area match only
 * for its roles, so a user never even downloads an area their active role cannot use. The root
 * opens the active role's home. Public pages share the public layout, and the addresses used
 * before the role areas existed redirect to their candidate pages.
 *
 * The guards are a usability aid only: the API authorizes every request with the
 * server-stored active role.
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', canActivate: [roleHomeGuard], children: [] },
  { path: 'dashboard', redirectTo: 'candidate/dashboard' },
  { path: 'applications/new', redirectTo: 'candidate/applications/new' },
  { path: 'applications/:applicationId', redirectTo: 'candidate/applications/:applicationId' },
  {
    path: 'candidate',
    canMatch: [roleGuard(...AREA_ROLES.candidate)],
    loadChildren: () => import('./features/candidate/candidate.routes').then(module => module.CANDIDATE_ROUTES),
  },
  {
    path: 'admission',
    canMatch: [roleGuard(...AREA_ROLES.admission)],
    loadChildren: () => import('./features/admission/admission.routes').then(module => module.ADMISSION_ROUTES),
  },
  {
    path: 'scoring',
    canMatch: [roleGuard(...AREA_ROLES.scoring)],
    loadChildren: () => import('./features/scoring/scoring.routes').then(module => module.SCORING_ROUTES),
  },
  {
    path: 'finance',
    canMatch: [roleGuard(...AREA_ROLES.finance)],
    loadChildren: () => import('./features/finance/finance.routes').then(module => module.FINANCE_ROUTES),
  },
  {
    path: 'monitoring',
    canMatch: [roleGuard(...AREA_ROLES.monitoring)],
    loadChildren: () => import('./features/monitoring/monitoring.routes').then(module => module.MONITORING_ROUTES),
  },
  {
    path: 'admin',
    canMatch: [roleGuard(...AREA_ROLES.admin)],
    loadChildren: () => import('./features/admin/admin.routes').then(module => module.ADMIN_ROUTES),
  },
  { path: 'not-allowed', redirectTo: 'unauthorised' },
  {
    path: '',
    loadComponent: () => import('./layouts/public-layout/public-layout.component').then(module => module.PublicLayoutComponent),
    children: [
      {
        path: 'auth/sign-in',
        title: $localize`:@@portal.title.signInPage:Sign in - GME Admissions`,
        loadComponent: () => import('./features/auth/sign-in-page.component').then(module => module.SignInPageComponent),
      },
      {
        path: 'auth/callback',
        title: $localize`:@@portal.title.signIn:Signing in - GME Admissions`,
        loadComponent: () => import('./features/status/sign-in-status.component').then(module => module.SignInStatusComponent),
      },
      {
        path: 'signed-out',
        title: $localize`:@@portal.title.signedOut:Signed out - GME Admissions`,
        loadComponent: () => import('./features/status/status-page.component').then(module => module.StatusPageComponent),
        data: { kind: 'signed-out' },
      },
      {
        path: 'unauthorised',
        title: $localize`:@@portal.title.notAllowed:Not allowed - GME Admissions`,
        loadComponent: () => import('./features/status/status-page.component').then(module => module.StatusPageComponent),
        data: { kind: 'not-allowed' },
      },
      {
        path: 'no-area',
        title: $localize`:@@portal.title.noArea:No portal area for your role - GME Admissions`,
        loadComponent: () => import('./features/status/status-page.component').then(module => module.StatusPageComponent),
        data: { kind: 'no-area' },
      },
      {
        path: 'duplicate-account',
        title: $localize`:@@portal.title.duplicateAccount:Use your original account - GME Admissions`,
        loadComponent: () => import('./features/status/status-page.component').then(module => module.StatusPageComponent),
        data: { kind: 'duplicate-account' },
      },
      {
        path: '**',
        title: $localize`:@@portal.title.notFound:Page not found - GME Admissions`,
        loadComponent: () => import('./features/status/status-page.component').then(module => module.StatusPageComponent),
        data: { kind: 'not-found' },
      },
    ],
  },
];
