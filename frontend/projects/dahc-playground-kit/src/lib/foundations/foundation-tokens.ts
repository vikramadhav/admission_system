import { DOCUMENT, Signal, computed, inject } from '@angular/core';
import { DahcThemeService } from 'dahc-ui';

import { injectPlaygroundConfig } from '../config';
import { TokenEntry, readTokens } from './token-reader';

/**
 * Tokens whose name starts with <tokenPrefix><group>, re-read whenever the theme changes.
 * Call from an injection context (a component field initialiser).
 */
export function injectTokens(group: string): Signal<readonly TokenEntry[]> {
  const document = inject(DOCUMENT);
  const themeService = inject(DahcThemeService);
  const { tokenPrefix } = injectPlaygroundConfig();

  return computed(() => readTokens(document, tokenPrefix + group, themeService.theme()));
}

/** Builds var() references and short names for the configured token prefix. */
export function injectTokenNames(): {
  readonly cssVar: (name: string) => string;
  readonly shortName: (token: TokenEntry, group?: string) => string;
} {
  const { tokenPrefix } = injectPlaygroundConfig();

  return {
    cssVar: name => `var(${tokenPrefix}${name})`,
    shortName: (token, group = '') => token.name.slice(`${tokenPrefix}${group}`.length),
  };
}
