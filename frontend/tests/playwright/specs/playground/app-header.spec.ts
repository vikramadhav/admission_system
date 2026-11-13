import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { DISPLAY_MODES, PlaygroundPage } from '../../support/playground';

for (const mode of DISPLAY_MODES) {
  test.describe(`app header (${mode.theme}, ${mode.direction})`, () => {
    let playground: PlaygroundPage;

    test.beforeEach(async ({ page }) => {
      playground = new PlaygroundPage(page);
      await playground.open('app-header', mode);
    });

    test('has no WCAG 2.2 AA violations', async () => {
      await expectNoAccessibilityViolations(playground.page);
    });

    test('the skip link moves focus to the main content', async () => {
      const skipLink = playground.preview.getByRole('link', { name: 'Skip to main content' });

      await skipLink.focus();
      await expect(skipLink).toBeVisible();
      await playground.page.keyboard.press('Enter');

      await expect(playground.page.locator('#main-content')).toBeFocused();
    });

    test('marks the language link with its language', async () => {
      const languageLink = playground.preview.getByRole('link', { name: 'العربية' });

      await expect(languageLink).toHaveAttribute('hreflang', 'ar');
      await expect(languageLink).toHaveAttribute('lang', 'ar');
    });

    test('emits signOut from the sign-out button and hides it when signed out', async () => {
      await playground.preview.getByRole('button', { name: 'Sign out' }).click();
      await expect(playground.outputs().getByRole('listitem')).toHaveText(['signOut']);

      await playground.property('signedIn').uncheck();
      await expect(playground.preview.getByRole('button', { name: 'Sign out' })).toHaveCount(0);
      await expect(playground.preview.getByText('Aisha Al Mansoori')).toHaveCount(0);
    });
  });
}

test('app header serves its real source and reflows at 320 pixels', async ({ page }) => {
  const playground = new PlaygroundPage(page);
  await page.setViewportSize({ width: 320, height: 800 });
  await playground.open('app-header', { theme: 'light', direction: 'ltr' });

  await playground.expectSourceFile('navigation/app-header/app-header.component.ts', 'skipToMainContent');
  await expectNoHorizontalScroll(page);
});
