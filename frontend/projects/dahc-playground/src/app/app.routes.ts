import { Routes } from '@angular/router';

/** One page per dahc-ui component; the path is the component's folder name. */
export interface PlaygroundEntry {
  readonly path: string;
  readonly title: string;
}

export const PLAYGROUND_ENTRIES: readonly PlaygroundEntry[] = [
  { path: 'alert', title: 'Alert' },
  { path: 'app-header', title: 'App header' },
  { path: 'badge', title: 'Badge' },
  { path: 'button', title: 'Button' },
  { path: 'card', title: 'Card' },
  { path: 'detail-list', title: 'Detail list' },
  { path: 'empty-state', title: 'Empty state' },
  { path: 'page-header', title: 'Page header' },
  { path: 'ranked-selection', title: 'Ranked selection' },
  { path: 'select', title: 'Select' },
  { path: 'theme-switch', title: 'Theme switch' },
];

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'button' },
  {
    path: 'alert',
    title: 'Alert - DAHC UI',
    loadComponent: () => import('./pages/alert-page.component').then(module => module.AlertPageComponent),
  },
  {
    path: 'app-header',
    title: 'App header - DAHC UI',
    loadComponent: () => import('./pages/app-header-page.component').then(module => module.AppHeaderPageComponent),
  },
  {
    path: 'badge',
    title: 'Badge - DAHC UI',
    loadComponent: () => import('./pages/badge-page.component').then(module => module.BadgePageComponent),
  },
  {
    path: 'button',
    title: 'Button - DAHC UI',
    loadComponent: () => import('./pages/button-page.component').then(module => module.ButtonPageComponent),
  },
  {
    path: 'card',
    title: 'Card - DAHC UI',
    loadComponent: () => import('./pages/card-page.component').then(module => module.CardPageComponent),
  },
  {
    path: 'detail-list',
    title: 'Detail list - DAHC UI',
    loadComponent: () => import('./pages/detail-list-page.component').then(module => module.DetailListPageComponent),
  },
  {
    path: 'empty-state',
    title: 'Empty state - DAHC UI',
    loadComponent: () => import('./pages/empty-state-page.component').then(module => module.EmptyStatePageComponent),
  },
  {
    path: 'page-header',
    title: 'Page header - DAHC UI',
    loadComponent: () => import('./pages/page-header-page.component').then(module => module.PageHeaderPageComponent),
  },
  {
    path: 'ranked-selection',
    title: 'Ranked selection - DAHC UI',
    loadComponent: () =>
      import('./pages/ranked-selection-page.component').then(module => module.RankedSelectionPageComponent),
  },
  {
    path: 'select',
    title: 'Select - DAHC UI',
    loadComponent: () => import('./pages/select-page.component').then(module => module.SelectPageComponent),
  },
  {
    path: 'theme-switch',
    title: 'Theme switch - DAHC UI',
    loadComponent: () => import('./pages/theme-switch-page.component').then(module => module.ThemeSwitchPageComponent),
  },
];
