import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { DISPLAY_MODES, PlaygroundPage } from '../../support/playground';

for (const mode of DISPLAY_MODES) {
  test.describe(`detail list (${mode.theme}, ${mode.direction})`, () => {
    let playground: PlaygroundPage;

    test.beforeEach(async ({ page }) => {
      playground = new PlaygroundPage(page);
      await playground.open('detail-list', mode);
    });

    test('has no WCAG 2.2 AA violations', async () => {
      await expectNoAccessibilityViolations(playground.page);
    });

    test('pairs each label with its value', async () => {
      await expect(playground.preview.getByRole('term')).toHaveText(['Program', 'Created', 'Submission deadline', 'Submitted']);
      await expect(playground.preview.getByRole('definition').first()).toHaveText('Medical Residency');
    });

    test('shows the empty value text instead of nothing', async () => {
      await expect(playground.preview.getByRole('definition').last()).toHaveText('Not available');

      await playground.property('emptyValue').fill('Not submitted yet');
      await expect(playground.preview.getByRole('definition').last()).toHaveText('Not submitted yet');
    });
  });
}

test('detail list serves its real source and reflows at 320 pixels', async ({ page }) => {
  const playground = new PlaygroundPage(page);
  await page.setViewportSize({ width: 320, height: 800 });
  await playground.open('detail-list', { theme: 'light', direction: 'ltr' });

  await playground.expectSourceFile('data-display/detail-list/detail-list.component.html', '<dl');
  await expectNoHorizontalScroll(page);
});
