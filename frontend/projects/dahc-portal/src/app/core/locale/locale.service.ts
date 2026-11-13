import { DOCUMENT, Injectable, LOCALE_ID, inject } from '@angular/core';
import { Router } from '@angular/router';

import { DAHC_PORTAL_CONFIG, DahcCulture } from '../config/portal-config';

export interface LanguageLink {
  readonly href: string;
  readonly label: string;
  readonly languageCode: string;
}

/**
 * The active locale build (en-AE or ar-AE). Each locale is its own build, so switching
 * language loads the same route from the other build.
 */
@Injectable({ providedIn: 'root' })
export class LocaleService {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly config = inject(DAHC_PORTAL_CONFIG);

  readonly culture: DahcCulture = inject(LOCALE_ID) === 'ar-AE' ? 'ar-AE' : 'en-AE';
  readonly direction: 'ltr' | 'rtl' = this.culture === 'ar-AE' ? 'rtl' : 'ltr';

  /** The localize build sets lang on <html>; direction is set here for both builds. */
  applyDocumentLanguage(): void {
    const root = this.document.documentElement;
    root.lang = this.culture;
    root.dir = this.direction;
  }

  /** Link to the current route in the other language, or null when both builds share one path (local development). */
  otherLanguageLink(): LanguageLink | null {
    const otherCulture: DahcCulture = this.culture === 'ar-AE' ? 'en-AE' : 'ar-AE';
    const currentBase = this.config.localeBasePaths[this.culture];
    const otherBase = this.config.localeBasePaths[otherCulture];

    if (currentBase === otherBase) {
      return null;
    }

    const routePath = this.router.url.replace(/^\//, '');

    return {
      href: `${otherBase}${routePath}`,
      label: otherCulture === 'ar-AE' ? 'العربية' : 'English',
      languageCode: otherCulture === 'ar-AE' ? 'ar' : 'en',
    };
  }
}
