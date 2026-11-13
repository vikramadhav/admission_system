import { PlaygroundEntry } from 'dahc-playground-kit';

/** Docs pages (group 'Docs'), shown before Foundations in the Docs section. */
export const DOCS_ENTRIES: readonly PlaygroundEntry[] = [
  {
    path: 'docs/introduce',
    title: 'Introduction',
    group: 'Docs',
    description: 'What DAHC UI is, its principles and where to start.',
    loadComponent: () => import('../pages/docs/introduce-page.component').then(module => module.IntroducePageComponent),
  },
  {
    path: 'docs/getting-started',
    title: 'Getting started',
    group: 'Docs',
    description: 'Add DAHC UI to an Angular application and use your first component.',
    loadComponent: () =>
      import('../pages/docs/getting-started-page.component').then(module => module.GettingStartedPageComponent),
  },
  {
    path: 'docs/themes-and-languages',
    title: 'Themes and languages',
    group: 'Docs',
    description: 'Dark theme, right-to-left and translating built-in texts.',
    loadComponent: () => import('../pages/docs/themes-page.component').then(module => module.ThemesPageComponent),
  },
];
