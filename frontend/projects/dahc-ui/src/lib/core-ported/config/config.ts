import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  EnvironmentProviders,
  InjectionToken,
  computed,
  inject,
  input,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
} from '@angular/core';

export type DahcConfigDirection = 'ltr' | 'rtl';

/** Locale, direction and motion defaults for every DAHC-UI component. */
export interface DahcConfig {
  /** BCP 47 locale, for example en-AE or ar-AE. Arabic, Persian, Hebrew and Urdu default to RTL. */
  readonly locale?: string;
  readonly direction?: DahcConfigDirection;
  /** Turns off animations and transitions, whatever the system setting. */
  readonly reducedMotion?: boolean;
}

export const DAHC_CONFIG = new InjectionToken<DahcConfig>('DAHC_CONFIG', { factory: () => ({}) });

const RTL_LOCALE = /^(ar|fa|he|ur)\b/i;

/** The motion tokens set to zero; inline custom properties win over the theme's values. */
const MOTION_OFF: Readonly<Record<string, string>> = {
  '--dahc-motion-duration-fast': '0ms',
  '--dahc-motion-duration-normal': '0ms',
  '--dahc-motion-duration-slow': '0ms',
};

export function dahcDirectionFor(locale: string | undefined, direction: DahcConfigDirection | undefined): DahcConfigDirection | null {
  if (direction) {
    return direction;
  }

  return locale ? (RTL_LOCALE.test(locale) ? 'rtl' : 'ltr') : null;
}

/**
 * App-wide DAHC-UI defaults, applied to <html> at start-up (lang, dir and, with reducedMotion,
 * zero motion tokens): providers: [provideDahcConfig({ locale: 'ar-AE' })].
 * Ported from dubai-health-ui dh-config-provider (utility/dh-config.ts) as an Angular provider.
 */
export function provideDahcConfig(config: DahcConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: DAHC_CONFIG, useValue: config },
    provideEnvironmentInitializer(() => {
      const root = inject(DOCUMENT).documentElement;
      const direction = dahcDirectionFor(config.locale, config.direction);

      if (config.locale) {
        root.lang = config.locale;
      }

      if (direction) {
        root.dir = direction;
      }

      if (config.reducedMotion) {
        for (const [name, value] of Object.entries(MOTION_OFF)) {
          root.style.setProperty(name, value);
        }
      }
    }),
  ]);
}

/**
 * Sets locale, direction and motion for the DAHC-UI components inside it (one region of a page,
 * for example an Arabic preview): <dahc-config-provider locale="ar-AE">…</dahc-config-provider>.
 * The element itself takes no space (display: contents). Inputs default to DAHC_CONFIG.
 * Ported from dubai-health-ui dh-config-provider (utility/dh-config.ts).
 */
@Component({
  selector: 'dahc-config-provider',
  template: '<ng-content />',
  styles: ':host { display: contents; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.lang]': 'locale() || null',
    '[attr.dir]': 'resolvedDirection()',
    '[style.--dahc-motion-duration-fast]': "reducedMotion() ? '0ms' : null",
    '[style.--dahc-motion-duration-normal]': "reducedMotion() ? '0ms' : null",
    '[style.--dahc-motion-duration-slow]': "reducedMotion() ? '0ms' : null",
  },
})
export class DahcConfigProviderComponent {
  private readonly defaults = inject(DAHC_CONFIG);

  readonly locale = input<string>(this.defaults.locale ?? '');
  /** Empty: from the locale. */
  readonly direction = input<DahcConfigDirection | ''>(this.defaults.direction ?? '');
  readonly reducedMotion = input<boolean>(this.defaults.reducedMotion ?? false);

  protected readonly resolvedDirection = computed<DahcConfigDirection | null>(() =>
    dahcDirectionFor(this.locale(), this.direction() || undefined),
  );
}
