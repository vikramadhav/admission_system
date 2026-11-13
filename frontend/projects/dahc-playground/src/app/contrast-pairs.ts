import { PlaygroundContrastPair } from 'dahc-playground-kit';

/**
 * Semantic colour pairs that components actually combine, with the WCAG 2.2 AA minimum:
 * 4.5:1 for text (1.4.3) and 3:1 for control borders and focus indicators (1.4.11).
 * The colour foundations page shows each ratio; the Playwright foundations spec fails the build
 * when any pair drops below its minimum in any theme.
 */

const text = (foreground: string, background: string): PlaygroundContrastPair => ({ foreground, background, minimum: 4.5 });
const graphic = (foreground: string, background: string): PlaygroundContrastPair => ({ foreground, background, minimum: 3 });

export const DAHC_CONTRAST_PAIRS: readonly PlaygroundContrastPair[] = [
  text('text-primary', 'background'),
  text('text-primary', 'surface'),
  text('text-primary', 'surface-highlight'),
  text('text-primary', 'surface-muted'),
  text('text-primary', 'surface-raised-1'),
  text('text-primary', 'surface-raised-2'),
  text('text-secondary', 'background'),
  text('text-secondary', 'surface'),
  text('text-tertiary', 'background'),
  text('text-tertiary', 'surface'),
  text('text-placeholder', 'surface'),
  text('text-link', 'surface'),
  text('text-link', 'background'),
  text('text-link', 'surface-highlight'),
  text('text-link-hover', 'surface'),
  text('text-inverse', 'surface-inverse'),
  text('text-inverse', 'action-primary'),
  text('text-inverse', 'action-primary-hover'),
  text('text-inverse', 'action-primary-active'),
  text('text-inverse', 'action-danger'),
  text('text-inverse', 'action-danger-hover'),
  text('text-on-special', 'action-special-blue'),
  text('text-on-special', 'action-special-blue-hover'),
  text('text-on-special', 'action-special-green'),
  text('text-on-special', 'action-special-green-hover'),
  text('text-on-special', 'tag-information'),
  text('text-on-special', 'tag-in-progress'),
  text('text-on-special', 'tag-warning'),
  text('text-on-special', 'tag-error'),
  text('text-on-special', 'tag-success'),
  text('text-on-special', 'tag-news'),
  text('text-on-special', 'tag-informative-blue'),
  text('text-on-special', 'tag-informative-purple'),
  text('text-on-tab-bar', 'surface-tab-bar'),
  text('text-on-footer', 'surface-footer'),
  text('text-on-footer-muted', 'surface-footer'),
  text('text-on-footer-accent', 'surface-footer'),
  text('error-text', 'surface'),
  text('info-text', 'info-surface'),
  text('success-text', 'success-surface'),
  text('warning-text', 'warning-surface'),
  text('error-text', 'error-surface'),
  text('text-primary', 'category-blue-surface'),
  text('text-primary', 'category-light-blue-surface'),
  text('text-primary', 'category-green-surface'),
  text('text-primary', 'category-orange-surface'),
  text('text-primary', 'category-red-surface'),
  text('text-primary', 'category-purple-surface'),
  text('text-primary', 'category-pink-surface'),
  graphic('border-control', 'surface'),
  graphic('control-checked', 'surface'),
  graphic('control-checked-mark', 'control-checked'),
  graphic('border-strong', 'surface'),
  graphic('focus-ring', 'background'),
  graphic('focus-ring', 'surface'),
];
