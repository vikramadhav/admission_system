import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { DISPLAY_MODES, PlaygroundPage } from '../../support/playground';

for (const mode of DISPLAY_MODES) {
  test.describe(`theme switch (${mode.theme}, ${mode.direction})`, () => {
    let playground: PlaygroundPage;

    test.beforeEach(async ({ page }) => {
      playground = new PlaygroundPage(page);
      await playground.open('theme-switch', mode);
    });

    test('has no WCAG 2.2 AA violations', async () => {
      await expectNoAccessibilityViolations(playground.page);
    });

    test('toggles the theme with the keyboard, reports it and remembers it', async () => {
      const toggle = playground.preview.getByRole('button', { name: 'Dark theme' });
      const expected = mode.theme === 'dark' ? 'light' : 'dark';

      await toggle.focus();
      await playground.page.keyboard.press('Space');

      await expect(toggle).toHaveAttribute('aria-pressed', String(expected === 'dark'));
      await expect(playground.page.locator('html')).toHaveAttribute('data-theme', expected);
      await expect(playground.outputs().getByRole('listitem')).toHaveText([`themeChange: ${expected}`]);
      expect(await playground.page.evaluate(() => localStorage.getItem('dahc.theme'))).toBe(expected);
    });
  });
}

test('the theme follows the operating system until the user chooses', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  const playground = new PlaygroundPage(page);
  await page.goto('/theme-switch');

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(playground.preview.getByTestId('theme-state')).toHaveText('theme: dark, follows system: true');

  await playground.preview.getByRole('button', { name: 'Dark theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

  await playground.properties.getByRole('button', { name: 'DahcThemeService.followSystem()' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(await page.evaluate(() => localStorage.getItem('dahc.theme'))).toBeNull();
});

test('theme switch serves its real source and reflows at 320 pixels', async ({ page }) => {
  const playground = new PlaygroundPage(page);
  await page.setViewportSize({ width: 320, height: 800 });
  await playground.open('theme-switch', { theme: 'light', direction: 'ltr' });

  await playground.expectSourceFile('theme/theme.service.ts', 'prefers-color-scheme');
  await expectNoHorizontalScroll(page);
});
