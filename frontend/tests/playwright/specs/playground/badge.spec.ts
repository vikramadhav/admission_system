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

    test('shows the configured text and tone', async () => {
      const badge = playground.preview.locator('dahc-badge');

      await expect(badge).toHaveText('Review completed');
      await expect(badge).toHaveClass(/dahc-badge--success/);

      await playground.property('tone').selectOption({ label: 'danger' });
      await playground.property('content').fill('Screened out');

      await expect(badge).toHaveText('Screened out');
      await expect(badge).toHaveClass(/dahc-badge--danger/);
    });
  });
}

test('badge serves its real source and reflows at 320 pixels', async ({ page }) => {
  const playground = new PlaygroundPage(page);
  await page.setViewportSize({ width: 320, height: 800 });
  await playground.open('badge', { theme: 'light', direction: 'ltr' });

  await playground.expectSourceFile('badge/badge.component.ts', "selector: 'dahc-badge'");
  await expectNoHorizontalScroll(page);
});
