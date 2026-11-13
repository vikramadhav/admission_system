import { Routes } from '@angular/router';

import { applicationEntryRedirect } from './application-wizard/application-entry';

/** Candidate area (lazy, behind candidateGuard in app.routes.ts), rendered in the candidate layout. */
export const CANDIDATE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../layouts/candidate-layout/candidate-layout.component').then(module => module.CandidateLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: $localize`:@@portal.title.dashboard:Dashboard - GME Admissions`,
        loadComponent: () => import('./dashboard/dashboard-page.component').then(module => module.DashboardPageComponent),
      },
      {
        path: 'applications',
        title: $localize`:@@portal.title.applications:My applications - GME Admissions`,
        loadComponent: () => import('./applications/applications-page.component').then(module => module.ApplicationsPageComponent),
      },
      {
        path: 'applications/new',
        title: $localize`:@@portal.title.newApplication:New application - GME Admissions`,
        loadComponent: () => import('./application-wizard/wizard-page.component').then(module => module.WizardPageComponent),
        data: { create: true },
      },
      {
        path: 'applications/:applicationId',
        pathMatch: 'full',
        canActivate: [applicationEntryRedirect],
        children: [],
      },
      {
        path: 'applications/:applicationId/steps/:stepId',
        title: $localize`:@@portal.title.application:Medical application - GME Admissions`,
        loadComponent: () => import('./application-wizard/wizard-page.component').then(module => module.WizardPageComponent),
      },
      {
        path: 'applications/:applicationId/payment-return',
        title: $localize`:@@portal.title.paymentReturn:Payment - GME Admissions`,
        loadComponent: () => import('./payment/payment-return-page.component').then(module => module.PaymentReturnPageComponent),
      },
      {
        path: 'applications/:applicationId/portfolio-result',
        title: $localize`:@@portal.title.portfolioResult:Portfolio result - GME Admissions`,
        loadComponent: () =>
          import('./portfolio-result/portfolio-result-page.component').then(module => module.PortfolioResultPageComponent),
      },
      {
        path: 'account',
        title: $localize`:@@portal.title.account:My account - GME Admissions`,
        loadComponent: () => import('./account/account-page.component').then(module => module.AccountPageComponent),
      },
    ],
  },
];
