import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { DISPLAY_MODES, PlaygroundPage } from '../../support/playground';

for (const mode of DISPLAY_MODES) {
  test.describe(`card (${mode.theme}, ${mode.direction})`, () => {
    let playground: PlaygroundPage;

    test.beforeEach(async ({ page }) => {
      playground = new PlaygroundPage(page);
      await playground.open('card', mode);
    });

    test('has no WCAG 2.2 AA violations', async () => {
      await expectNoAccessibilityViolations(playground.page);
    });

    test('is an article named by its heading at the chosen level', async () => {
      const card = playground.preview.getByRole('article', { name: '20270000001' });

      await expect(card.getByRole('heading', { level: 2, name: '20270000001' })).toBeVisible();
      await playground.property('headingLevel').selectOption({ label: '3' });
      await expect(card.getByRole('heading', { level: 3, name: '20270000001' })).toBeVisible();
    });

    test('shows projected aside and footer content only when given', async () => {
      const card = playground.preview.getByRole('article', { name: '20270000001' });

      await expect(card.getByText('Draft', { exact: true })).toBeVisible();
      await expect(card.getByRole('button', { name: 'Resume draft' })).toBeVisible();

      await playground.property('card-footer content').uncheck();
      await expect(card.getByRole('button', { name: 'Resume draft' })).toHaveCount(0);
    });

    test('a card without heading has no region name', async () => {
      await expect(playground.states.getByRole('article')).toHaveCount(3);
      await expect(playground.states.getByRole('article', { name: 'Subtle' })).toBeVisible();
    });
  });
}

test('card serves its real source and reflows at 320 pixels', async ({ page }) => {
  const playground = new PlaygroundPage(page);
  await page.setViewportSize({ width: 320, height: 800 });
  await playground.open('card', { theme: 'light', direction: 'ltr' });

  await playground.expectSourceFile('card/card.component.html', 'aria-labelledby');
  await expectNoHorizontalScroll(page);
});
