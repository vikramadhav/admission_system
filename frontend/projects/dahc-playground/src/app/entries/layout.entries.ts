import { PlaygroundEntry } from 'dahc-playground-kit';

/** Playground pages of the Layout components ported from dubai-health-ui (group 'Layout'). */
export const LAYOUT_ENTRIES: readonly PlaygroundEntry[] = [
  {
    path: 'affix',
    title: 'Affix',
    group: 'Layout',
    description: 'Pins a toolbar or filter bar to the top of the viewport while the page scrolls.',
    selector: 'dahc-affix',
    loadComponent: () => import('../pages/affix-page.component').then(module => module.AffixPageComponent),
  },
  {
    path: 'divider',
    title: 'Divider',
    group: 'Layout',
    description: 'A line between sections, optionally labelled, or vertical between inline items.',
    selector: 'dahc-divider',
    loadComponent: () => import('../pages/divider-page.component').then(module => module.DividerPageComponent),
  },
  {
    path: 'flex',
    title: 'Flex',
    group: 'Layout',
    description: 'Lays out items in a row or column with a gap from the spacing scale.',
    selector: 'dahc-flex',
    loadComponent: () => import('../pages/flex-page.component').then(module => module.FlexPageComponent),
  },
  {
    path: 'grid',
    title: 'Grid (row and col)',
    group: 'Layout',
    description: 'A 24-column responsive grid for page and form layouts.',
    selector: 'dahc-row / dahc-col',
    loadComponent: () => import('../pages/grid-page.component').then(module => module.GridPageComponent),
  },
  {
    path: 'layout',
    title: 'Layout',
    group: 'Layout',
    description: 'A page frame of header, content, footer and an optional side navigation.',
    selector: 'dahc-layout',
    loadComponent: () => import('../pages/layout-page.component').then(module => module.LayoutPageComponent),
  },
  {
    path: 'space',
    title: 'Space',
    group: 'Layout',
    description: 'Even spacing between inline items such as buttons and tags.',
    selector: 'dahc-space',
    loadComponent: () => import('../pages/space-page.component').then(module => module.SpacePageComponent),
  },
  {
    path: 'splitter',
    title: 'Splitter',
    group: 'Layout',
    description: 'Resizable panes that users drag or move with the arrow keys.',
    selector: 'dahc-splitter',
    loadComponent: () => import('../pages/splitter-page.component').then(module => module.SplitterPageComponent),
  },
];
