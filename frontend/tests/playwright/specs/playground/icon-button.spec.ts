import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { DISPLAY_MODES, PlaygroundPage } from '../../support/playground';

for (const mode of DISPLAY_MODES) {
  test.describe(`icon button (${mode.theme}, ${mode.direction})`, () => {
    let playground: PlaygroundPage;

    test.beforeEach(async ({ page }) => {
      playground = new PlaygroundPage(page);
      await playground.open('icon-button', mode);
    });

    test('has no WCAG 2.2 AA violations', async () => {
      await expectNoAccessibilityViolations(playground.page);
    });

    test('is named by its hidden text and activates with the keyboard', async () => {
      const button = playground.preview.getByRole('button', { name: 'Search' });

      await expect(button).toBeVisible();
      await button.focus();
      await playground.page.keyboard.press('Enter');
      await playground.page.keyboard.press('Space');
      await expect(playground.outputs().getByRole('listitem')).toHaveText(['click (Search)', 'click (Search)']);

      await playground.property('content').fill('Find a programme');
      await expect(playground.preview.getByRole('button', { name: 'Find a programme' })).toBeVisible();
    });

    test('meets the Figma sizes and shows a focus ring', async () => {
      const button = playground.preview.getByRole('button', { name: 'Search' });
      const box = await button.boundingBox();

      expect(box?.width).toBe(48);
      expect(box?.height).toBe(48);

      await playground.property('size').selectOption({ label: 'md' });
      expect((await button.boundingBox())?.width).toBe(40);

      await button.focus();
      await playground.page.keyboard.press('Shift+Tab');
      await playground.page.keyboard.press('Tab');
      await expect(button).toBeFocused();
      await expect(button).not.toHaveCSS('outline-style', 'none');
    });

    test('is disabled natively', async () => {
      await playground.property('disabled').check();
      await expect(playground.preview.getByRole('button', { name: 'Search' })).toBeDisabled();
    });
  });
}

test('icon button serves its real source and reflows at 320 pixels', async ({ page }) => {
  const playground = new PlaygroundPage(page);
  await page.setViewportSize({ width: 320, height: 800 });
  await playground.open('icon-button', { theme: 'light', direction: 'ltr' });

  await playground.expectSourceFile('actions/icon-button/icon-button.component.ts', "selector: 'button[dahc-icon-button], a[dahc-icon-button]'");
  await expectNoHorizontalScroll(page);
});
