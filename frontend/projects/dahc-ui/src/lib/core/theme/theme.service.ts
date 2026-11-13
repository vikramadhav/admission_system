import { DOCUMENT, Injectable, OnDestroy, computed, inject, signal } from '@angular/core';

/** Built-in themes; a custom theme is any other name with token overrides under [data-theme]. */
export type DahcThemeName = 'light' | 'dark' | (string & Record<never, never>);

const STORAGE_KEY = 'dahc.theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

/**
 * Sets data-theme on the root element. Follows prefers-color-scheme until the user
 * chooses a theme, then remembers that choice in localStorage (a display preference only).
 */
@Injectable({ providedIn: 'root' })
export class DahcThemeService implements OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly mediaQuery: MediaQueryList | null;
  private readonly chosenTheme = signal<DahcThemeName | null>(null);
  private readonly systemTheme = signal<DahcThemeName>('light');
  private readonly systemListener = (event: MediaQueryListEvent): void => {
    this.systemTheme.set(event.matches ? 'dark' : 'light');
    this.apply();
  };

  /** The theme currently applied. */
  readonly theme = computed<DahcThemeName>(() => this.chosenTheme() ?? this.systemTheme());

  /** True while the theme follows the operating system setting. */
  readonly followsSystem = computed<boolean>(() => this.chosenTheme() === null);

  constructor() {
    const view = this.document.defaultView;
    this.mediaQuery = view?.matchMedia ? view.matchMedia(DARK_QUERY) : null;

    if (this.mediaQuery) {
      this.systemTheme.set(this.mediaQuery.matches ? 'dark' : 'light');
      this.mediaQuery.addEventListener('change', this.systemListener);
    }

    this.chosenTheme.set(this.readStoredTheme());
    this.apply();
  }

  setTheme(theme: DahcThemeName): void {
    this.chosenTheme.set(theme);
    this.writeStoredTheme(theme);
    this.apply();
  }

  /** Forgets the user's choice and follows the operating system again. */
  followSystem(): void {
    this.chosenTheme.set(null);
    this.writeStoredTheme(null);
    this.apply();
  }

  ngOnDestroy(): void {
    this.mediaQuery?.removeEventListener('change', this.systemListener);
  }

  private apply(): void {
    this.document.documentElement.setAttribute('data-theme', this.theme());
  }

  private readStoredTheme(): DahcThemeName | null {
    try {
      return this.document.defaultView?.localStorage.getItem(STORAGE_KEY) ?? null;
    } catch {
      return null;
    }
  }

  private writeStoredTheme(theme: DahcThemeName | null): void {
    try {
      const storage = this.document.defaultView?.localStorage;

      if (theme === null) {
        storage?.removeItem(STORAGE_KEY);
      } else {
        storage?.setItem(STORAGE_KEY, theme);
      }
    } catch {
      // Storage can be unavailable (private mode, blocked site data); the theme still applies for this page.
    }
  }
}
