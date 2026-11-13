import { EnvironmentProviders, InjectionToken, Type, inject, makeEnvironmentProviders } from '@angular/core';

/** One page in the playground navigation. */
export interface PlaygroundEntry {
  /** Route path, for example "button" or "foundations/colour". */
  readonly path: string;
  readonly title: string;
  /** Navigation group heading. The kit's own pages use "Foundations". */
  readonly group: string;
  readonly loadComponent: () => Promise<Type<unknown>>;
  /** One sentence for search results and the components overview. */
  readonly description?: string;
  /** The component's selector, shown in search and on the overview, for example "dahc-button". */
  readonly selector?: string;
}

/**
 * A colour pair checked on the Colour page: names of semantic colour tokens without the prefix,
 * and the WCAG minimum (4.5 for text, 3 for borders, icons and focus indicators).
 */
export interface PlaygroundContrastPair {
  readonly foreground: string;
  readonly background: string;
  readonly minimum: 3 | 4.5;
}

export interface PlaygroundIconGroup {
  readonly label: string;
  readonly names: readonly string[];
}

export interface PlaygroundBreakpoint {
  readonly name: string;
  readonly value: string;
  readonly use: string;
}

/** Everything a project tells the playground kit about its design system. */
export interface PlaygroundConfig {
  /** Shown in the header, for example "DAHC UI playground". */
  readonly title: string;
  /** Appended to page titles: "Button - DAHC UI". */
  readonly titleSuffix: string;
  /** Prefix of the design system's custom properties, for example "--dahc-". */
  readonly tokenPrefix: string;
  /** Token name segment of semantic colours (default "color-"). */
  readonly colorPrefix?: string;
  /** Token name segment of type roles: <prefix><role>-size and friends (default "type-"). */
  readonly typePrefix?: string;
  /** Component pages; the kit adds its Foundations pages in front of them. */
  readonly entries: readonly PlaygroundEntry[];
  /** Order of navigation groups after Foundations. */
  readonly groups: readonly string[];
  readonly contrastPairs?: readonly PlaygroundContrastPair[];
  readonly breakpoints?: readonly PlaygroundBreakpoint[];
  /** Icon names for the Icons page; the page is left out when empty. */
  readonly iconNames?: readonly string[];
  /** Optional grouping of iconNames into sets, shown as sections on the Icons page. */
  readonly iconGroups?: readonly PlaygroundIconGroup[];
  /** Icons that mirror in right-to-left layouts, marked on the Icons page. */
  readonly directionalIconNames?: ReadonlySet<string>;
  /** URL of the library sources copied into the build (default "source/lib/"). */
  readonly sourceBaseUrl?: string;
  /** First page shown (default the first Foundations page). */
  readonly homePath?: string;
  /** Version shown in the header, for example "1.0.0". */
  readonly version?: string;
  /**
   * Groups shown under "Docs" in the header navigation (default ["Docs", "Foundations"]); every
   * other group is a component group shown under "Components" with the overview page first.
   */
  readonly docsGroups?: readonly string[];
  /** URL of the playground's own page templates copied into the build, for example code (default "source/pages/"). */
  readonly pageSourceBaseUrl?: string;
}

export interface ResolvedPlaygroundConfig extends Required<Omit<PlaygroundConfig, 'homePath' | 'version'>> {
  readonly homePath: string;
  readonly version: string;
}

export const PLAYGROUND_CONFIG = new InjectionToken<ResolvedPlaygroundConfig>('PLAYGROUND_CONFIG');

export const FOUNDATIONS_GROUP = 'Foundations';
export const DOCS_GROUP = 'Docs';
/** Path of the kit's components overview page. */
export const OVERVIEW_PATH = 'components/overview';

/** Registers the playground configuration. Use with the routes from playgroundRoutes(). */
export function providePlayground(config: PlaygroundConfig): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: PLAYGROUND_CONFIG, useValue: resolveConfig(config) }]);
}

export function resolveConfig(config: PlaygroundConfig): ResolvedPlaygroundConfig {
  return {
    colorPrefix: 'color-',
    typePrefix: 'type-',
    contrastPairs: [],
    breakpoints: [],
    iconNames: [],
    iconGroups: [],
    directionalIconNames: new Set<string>(),
    sourceBaseUrl: 'source/lib/',
    pageSourceBaseUrl: 'source/pages/',
    docsGroups: [DOCS_GROUP, FOUNDATIONS_GROUP],
    ...config,
    homePath: config.homePath ?? 'foundations/colour',
    version: config.version ?? '',
  };
}

export function injectPlaygroundConfig(): ResolvedPlaygroundConfig {
  return inject(PLAYGROUND_CONFIG);
}
