import { PlaygroundEntry } from 'dahc-playground-kit';

/** Playground pages of the General components (group 'General'). */
export const GENERAL_ENTRIES: readonly PlaygroundEntry[] = [
  {
    path: 'button',
    title: 'Button',
    group: 'General',
    description: 'Starts an immediate action or, on a link, navigates to another page.',
    selector: 'button[dahc-button]',
    loadComponent: () => import('../pages/button-page.component').then(module => module.ButtonPageComponent),
  },
  {
    path: 'icon-button',
    title: 'Icon button',
    group: 'General',
    description: 'A square button that shows only an icon, for compact, familiar actions.',
    selector: 'button[dahc-icon-button]',
    loadComponent: () => import('../pages/icon-button-page.component').then(module => module.IconButtonPageComponent),
  },
  {
    path: 'button-group',
    title: 'Button group',
    group: 'General',
    description: 'A segmented control for choosing one of a few related options.',
    selector: 'dahc-button-group',
    loadComponent: () => import('../pages/button-group-page.component').then(module => module.ButtonGroupPageComponent),
  },
  {
    path: 'theme-switch',
    title: 'Theme switch',
    group: 'General',
    description: 'A toggle that switches the whole interface between the light and dark theme.',
    selector: 'dahc-theme-switch',
    loadComponent: () => import('../pages/theme-switch-page.component').then(module => module.ThemeSwitchPageComponent),
  },
];
