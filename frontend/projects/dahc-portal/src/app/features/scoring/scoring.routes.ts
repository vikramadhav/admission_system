import { Routes } from '@angular/router';

import { permissionGuard } from '../../core/auth/permission.guard';
import { unsavedChangesGuard } from '../../core/auth/unsaved-changes.guard';
import { routeData } from '../../core/routing/route-data';
import { staffArea } from '../staff/staff-routes';

/**
 * Scoring area (EPIC-03) for the referee, third referee, 2nd evaluation referee and senior
 * referee, behind roleGuard in app.routes.ts. Candidate identity is never shown in this area.
 */
export const SCORING_ROUTES: Routes = staffArea([
  {
    path: 'referee',
    title: $localize`:@@portal.title.scoring.referee:My portfolios - GME Admissions`,
    canActivate: [permissionGuard('scoring.referee.dashboard')],
    loadComponent: () => import('./referee-dashboard/referee-dashboard-page.component').then(module => module.RefereeDashboardPageComponent),
    data: routeData({ stories: ['US-3.1.2', 'US-3.2.1'] }),
  },
  {
    path: 'referee/portfolios/:portfolioId',
    title: $localize`:@@portal.title.scoring.portfolio:Score portfolio - GME Admissions`,
    canActivate: [permissionGuard('scoring.portfolio.read')],
    canDeactivate: [unsavedChangesGuard],
    loadComponent: () => import('./portfolio-scoring/portfolio-scoring-page.component').then(module => module.PortfolioScoringPageComponent),
    data: routeData({ stories: ['US-3.3.1', 'US-3.3.2', 'US-3.3.3', 'US-3.3.4'] }),
  },
  {
    path: 'senior',
    title: $localize`:@@portal.title.scoring.senior:Scoring oversight - GME Admissions`,
    canActivate: [permissionGuard('scoring.senior.dashboard')],
    loadComponent: () => import('./senior-dashboard/senior-dashboard-page.component').then(module => module.SeniorDashboardPageComponent),
    data: routeData({ stories: ['US-3.1.3'] }),
  },
  {
    path: 'senior/referees/:refereeId',
    title: $localize`:@@portal.title.scoring.refereeInbox:Referee portfolios - GME Admissions`,
    canActivate: [permissionGuard('scoring.senior.dashboard')],
    loadComponent: () => import('./referee-inbox/referee-inbox-page.component').then(module => module.RefereeInboxPageComponent),
    data: routeData({ stories: ['US-3.1.3', 'US-3.2.2'] }),
  },
  {
    path: 'senior/portfolios/:portfolioId',
    title: $localize`:@@portal.title.scoring.seniorPortfolio:Portfolio oversight - GME Admissions`,
    canActivate: [permissionGuard('scoring.portfolio.readAll')],
    loadComponent: () => import('./senior-portfolio/senior-portfolio-page.component').then(module => module.SeniorPortfolioPageComponent),
    data: routeData({ stories: ['US-3.1.3', 'US-3.2.2', 'US-3.2.3'] }),
  },
]);
