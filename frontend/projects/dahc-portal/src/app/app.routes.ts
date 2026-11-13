import { Routes } from '@angular/router';

import { candidateGuard } from './core/auth/candidate.guard';

/**
 * Top-level routes: each role has its own lazy area with its own layout and guard (only the
 * candidate area exists today), public pages share the public layout, and the addresses used
 * before the role areas existed redirect to their candidate pages.
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'candidate/dashboard' },
  { path: 'dashboard', redirectTo: 'candidate/dashboard' },
  { path: 'applications/new', redirectTo: 'candidate/applications/new' },
  { path: 'applications/:applicationId', redirectTo: 'candidate/applications/:applicationId' },
  {
    path: 'candidate',
    canActivate: [candidateGuard],
    loadChildren: () => import('./features/candidate/candidate.routes').then(module => module.CANDIDATE_ROUTES),
  },
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
        path: 'not-allowed',
        title: $localize`:@@portal.title.notAllowed:Not allowed - GME Admissions`,
        loadComponent: () => import('./features/status/status-page.component').then(module => module.StatusPageComponent),
        data: { kind: 'not-allowed' },
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
