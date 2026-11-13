import { Locator, Page, expect } from '@playwright/test';

export type Theme = 'light' | 'dark';
export type Direction = 'ltr' | 'rtl';

export interface DisplayMode {
  readonly theme: Theme;
  readonly direction: Direction;
}

/** Every component is checked in both themes and both directions (standard s.25). */
export const DISPLAY_MODES: readonly DisplayMode[] = [
  { theme: 'light', direction: 'ltr' },
  { theme: 'light', direction: 'rtl' },
  { theme: 'dark', direction: 'ltr' },
  { theme: 'dark', direction: 'rtl' },
];

/** The parts of a playground component page, located by landmark name. */
export class PlaygroundPage {
  readonly preview: Locator;
  readonly properties: Locator;
  readonly states: Locator;
  readonly source: Locator;

  constructor(readonly page: Page) {
    this.preview = page.getByRole('region', { name: 'Preview' });
    this.properties = page.getByRole('region', { name: 'Properties' });
    this.states = page.getByRole('region', { name: 'States' });
    this.source = page.getByRole('region', { name: 'Source' });
  }

  /** Opens a component page in the given theme and direction using the playground's own switchers. */
  async open(path: string, mode: DisplayMode): Promise<void> {
    // Reduced motion sets the motion tokens to 0ms, so colour transitions after the theme switch
    // cannot be caught half-way by the accessibility scan.
    await this.page.emulateMedia({ reducedMotion: 'reduce' });
    await this.page.goto(`/${path}`);
    await expect(this.page.getByRole('heading', { level: 1 }).first()).toBeVisible();

    const themeSwitch = this.page.getByRole('banner').getByRole('button', { name: 'Dark theme' });
    const isDark = (await themeSwitch.getAttribute('aria-pressed')) === 'true';

    if ((mode.theme === 'dark') !== isDark) {
      await themeSwitch.click();
    }

    if (mode.direction === 'rtl') {
      await this.page.getByRole('button', { name: 'Right-to-left' }).click();
    }

    await expect(this.page.locator('html')).toHaveAttribute('data-theme', mode.theme);
    await expect(this.page.locator('html')).toHaveAttribute('dir', mode.direction);
  }

  property(name: string): Locator {
    return this.properties.getByLabel(name, { exact: true });
  }

  outputs(): Locator {
    return this.properties.getByRole('list', { name: 'Emitted outputs' });
  }

  /** The copy buttons serve the real component files that the build copied as assets. */
  async expectSourceFile(fileName: string, expectedText: string): Promise<void> {
    await this.source.getByRole('button', { name: fileName, exact: true }).click();
    await expect(this.source.getByLabel(fileName, { exact: true })).toContainText(expectedText);
  }
}
