import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { DISPLAY_MODES, PlaygroundPage } from '../../support/playground';

for (const mode of DISPLAY_MODES) {
  test.describe(`badge (${mode.theme}, ${mode.direction})`, () => {
    let playground: PlaygroundPage;

    test.beforeEach(async ({ page }) => {
      playground = new PlaygroundPage(page);
      await playground.open('badge', mode);
    });

    test('has no WCAG 2.2 AA violations in every tone', async () => {
      await expectNoAccessibilityViolations(playground.page);
    });

    test('shows the count visually and the label to screen readers', async () => {
      const badge = playground.preview.locator('dahc-badge').last();

      await expect(badge).toHaveAccessibleName('');
      await expect(badge.locator('[aria-hidden="true"]')).toHaveText('3');
      await expect(badge.locator('.dahc-visually-hidden')).toHaveText('3 unread notifications');

      await playground.property('count').selectOption({ label: '150' });
      await expect(badge.locator('[aria-hidden="true"]')).toHaveText('99+');

      await playground.property('count').selectOption({ label: '0' });
      await expect(badge).toBeHidden();

      await playground.property('dot').check();
      await expect(badge).toBeVisible();
      await expect(badge.locator('[aria-hidden="true"]')).toHaveCount(0);
    });
  });
}

test('badge serves its real source and reflows at 320 pixels', async ({ page }) => {
  const playground = new PlaygroundPage(page);
  await page.setViewportSize({ width: 320, height: 800 });
  await playground.open('badge', { theme: 'light', direction: 'ltr' });

  await playground.expectSourceFile('data-display/badge/badge.component.ts', "selector: 'dahc-badge'");
  await expectNoHorizontalScroll(page);
});
