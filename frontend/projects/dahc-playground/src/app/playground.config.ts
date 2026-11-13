import { PlaygroundConfig } from 'dahc-playground-kit';
import { DAHC_DIRECTIONAL_ICONS, DAHC_ICON_NAMES, DAHC_ICON_SETS } from 'dahc-ui';

import { DAHC_CONTRAST_PAIRS } from './contrast-pairs';
import { DISPLAY_ENTRIES } from './entries/display.entries';
import { DOCS_ENTRIES } from './entries/docs.entries';
import { ENTRY_ENTRIES } from './entries/entry.entries';
import { GENERAL_ENTRIES } from './entries/general.entries';
import { FEEDBACK_ENTRIES } from './entries/feedback.entries';
import { LAYOUT_ENTRIES } from './entries/layout.entries';
import { NAVIGATION_ENTRIES } from './entries/navigation.entries';

/**
 * The DAHC-UI playground: everything project-specific the playground kit needs. A component page
 * is added here and in pages/; the kit supplies the shell, navigation and Foundations pages.
 */
export const DAHC_PLAYGROUND_CONFIG: PlaygroundConfig = {
  title: 'DAHC UI',
  version: '1.0.0',
  homePath: 'docs/introduce',
  titleSuffix: 'DAHC UI',
  tokenPrefix: '--dahc-',
  groups: ['Docs', 'General', 'Layout', 'Navigation', 'Data entry', 'Data display', 'Feedback'],
  contrastPairs: DAHC_CONTRAST_PAIRS,
  iconNames: DAHC_ICON_NAMES,
  iconGroups: DAHC_ICON_SETS,
  directionalIconNames: DAHC_DIRECTIONAL_ICONS,
  // Breakpoints live in Sass (dahc-ui/src/styles/tokens/_breakpoints.scss); keep in step.
  breakpoints: [
    { name: 'sm', value: '36rem (576px)', use: 'Large phones' },
    { name: 'md', value: '48rem (768px)', use: 'Tablet; mobile type roles switch to web' },
    { name: 'lg', value: '64rem (1024px)', use: 'Header switches from hamburger to full navigation' },
    { name: 'xl', value: '80rem (1280px)', use: 'GME desktop frame' },
    { name: 'xxl', value: '90rem (1440px)', use: 'Wide desktop (grid xxl columns)' },
  ],
  entries: [
    ...DOCS_ENTRIES,
    ...GENERAL_ENTRIES,
    ...LAYOUT_ENTRIES,
    ...NAVIGATION_ENTRIES,
    ...ENTRY_ENTRIES,
    ...DISPLAY_ENTRIES,
    ...FEEDBACK_ENTRIES,
  ],
};
