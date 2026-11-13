import { Routes } from '@angular/router';

import { FOUNDATIONS_GROUP, OVERVIEW_PATH, PlaygroundConfig, PlaygroundEntry, resolveConfig } from './config';

/** The kit's own pages, built from the design system's tokens. */
export function foundationEntries(config: PlaygroundConfig): readonly PlaygroundEntry[] {
  const entries: PlaygroundEntry[] = [
    {
      path: 'foundations/colour',
      title: 'Colour',
      group: FOUNDATIONS_GROUP,
      loadComponent: () => import('./foundations/colour-page.component').then(module => module.ColourPageComponent),
    },
    {
      path: 'foundations/typography',
      title: 'Typography',
      group: FOUNDATIONS_GROUP,
      loadComponent: () =>
        import('./foundations/typography-page.component').then(module => module.TypographyPageComponent),
    },
    {
      path: 'foundations/layout',
      title: 'Layout and elevation',
      group: FOUNDATIONS_GROUP,
      loadComponent: () => import('./foundations/layout-page.component').then(module => module.LayoutPageComponent),
    },
  ];

  if ((config.iconNames ?? []).length > 0 || (config.iconGroups ?? []).length > 0) {
    entries.push({
      path: 'foundations/icons',
      title: 'Icons',
      group: FOUNDATIONS_GROUP,
      loadComponent: () => import('./foundations/icons-page.component').then(module => module.IconsPageComponent),
    });
  }

  return entries;
}

/** The kit's components overview: every component group as a grid of cards. */
export const OVERVIEW_ENTRY: PlaygroundEntry = {
  path: OVERVIEW_PATH,
  title: 'Overview',
  group: '',
  description: 'Every component, grouped by purpose.',
  loadComponent: () => import('./docs/overview-page.component').then(module => module.OverviewPageComponent),
};

/** All navigation entries: Foundations first, then the project's pages, then the overview. */
export function playgroundEntries(config: PlaygroundConfig): readonly PlaygroundEntry[] {
  return [...foundationEntries(config), ...config.entries, OVERVIEW_ENTRY];
}

/** Router configuration for the playground app: provideRouter(playgroundRoutes(config)). */
export function playgroundRoutes(config: PlaygroundConfig): Routes {
  const resolved = resolveConfig(config);

  return [
    { path: '', pathMatch: 'full', redirectTo: resolved.homePath },
    ...playgroundEntries(config).map(entry => ({
      path: entry.path,
      title: `${entry.title} - ${config.titleSuffix}`,
      loadComponent: entry.loadComponent,
    })),
  ];
}
