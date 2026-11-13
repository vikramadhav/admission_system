import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { DISPLAY_MODES, PlaygroundPage } from '../../support/playground';

for (const mode of DISPLAY_MODES) {
  test.describe(`page header (${mode.theme}, ${mode.direction})`, () => {
    let playground: PlaygroundPage;

    test.beforeEach(async ({ page }) => {
      playground = new PlaygroundPage(page);
      await playground.open('page-header', mode);
    });

    test('has no WCAG 2.2 AA violations', async () => {
      await expectNoAccessibilityViolations(playground.page);
    });

    test('renders the page heading as a focusable h1 target', async () => {
      const heading = playground.preview.getByRole('heading', { level: 1, name: 'Dashboard' });

      await expect(heading).toHaveAttribute('tabindex', '-1');
      await playground.property('heading').fill('New application');
      await expect(playground.preview.getByRole('heading', { level: 1, name: 'New application' })).toBeVisible();
    });

    test('shows the description and projected actions only when given', async () => {
      await expect(playground.preview.getByText('Welcome, Aisha.', { exact: false })).toBeVisible();
      await expect(playground.preview.getByRole('button', { name: 'Start new application' })).toBeVisible();

      await playground.property('description').fill('');
      await playground.property('page-header-actions content').uncheck();

      await expect(playground.preview.getByText('Welcome, Aisha.', { exact: false })).toHaveCount(0);
      await expect(playground.preview.getByRole('button', { name: 'Start new application' })).toHaveCount(0);
    });
  });
}

test('page header serves its real source and reflows at 320 pixels', async ({ page }) => {
  const playground = new PlaygroundPage(page);
  await page.setViewportSize({ width: 320, height: 800 });
  await playground.open('page-header', { theme: 'light', direction: 'ltr' });

  await playground.expectSourceFile('navigation/page-header/page-header.component.ts', 'afterNextRender');
  await expectNoHorizontalScroll(page);
});
