import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { DISPLAY_MODES, PlaygroundPage } from '../../support/playground';

for (const mode of DISPLAY_MODES) {
  test.describe(`empty state (${mode.theme}, ${mode.direction})`, () => {
    let playground: PlaygroundPage;

    test.beforeEach(async ({ page }) => {
      playground = new PlaygroundPage(page);
      await playground.open('empty-state', mode);
    });

    test('has no WCAG 2.2 AA violations', async () => {
      await expectNoAccessibilityViolations(playground.page);
    });

    test('uses a real heading at the chosen level', async () => {
      await expect(playground.preview.getByRole('heading', { level: 2, name: 'You have no applications yet' })).toBeVisible();

      await playground.property('headingLevel').selectOption({ label: '3' });
      await expect(playground.preview.getByRole('heading', { level: 3, name: 'You have no applications yet' })).toBeVisible();
    });

    test('shows the projected action only when given', async () => {
      await expect(playground.preview.getByRole('button', { name: 'Start new application' })).toBeVisible();

      await playground.property('projected action').uncheck();
      await expect(playground.preview.getByRole('button', { name: 'Start new application' })).toHaveCount(0);
    });
  });
}

test('empty state serves its real source and reflows at 320 pixels', async ({ page }) => {
  const playground = new PlaygroundPage(page);
  await page.setViewportSize({ width: 320, height: 800 });
  await playground.open('empty-state', { theme: 'light', direction: 'ltr' });

  await playground.expectSourceFile('feedback/empty-state/empty-state.component.ts', "selector: 'dahc-empty-state'");
  await expectNoHorizontalScroll(page);
});
