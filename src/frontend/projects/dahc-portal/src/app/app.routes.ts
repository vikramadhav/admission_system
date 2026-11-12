import { Routes } from '@angular/router';

import { candidateGuard } from './core/auth/candidate.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    canActivate: [candidateGuard],
    title: $localize`:@@portal.title.dashboard:Dashboard - GME Admissions`,
    loadComponent: () => import('./features/dashboard/dashboard.component').then(module => module.DashboardComponent),
  },
  {
    path: 'applications/new',
    canActivate: [candidateGuard],
    title: $localize`:@@portal.title.newApplication:New application - GME Admissions`,
    loadComponent: () =>
      import('./features/application-draft/application-draft.component').then(module => module.ApplicationDraftComponent),
  },
  {
    path: 'applications/:applicationId',
    canActivate: [candidateGuard],
    title: $localize`:@@portal.title.draft:Application draft - GME Admissions`,
    loadComponent: () =>
      import('./features/application-draft/application-draft.component').then(module => module.ApplicationDraftComponent),
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
];
