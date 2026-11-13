import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { DISPLAY_MODES, PlaygroundPage } from '../../support/playground';

for (const mode of DISPLAY_MODES) {
  test.describe(`search (${mode.theme}, ${mode.direction})`, () => {
    let playground: PlaygroundPage;

    test.beforeEach(async ({ page }) => {
      playground = new PlaygroundPage(page);
      await playground.open('search', mode);
    });

    test('has no WCAG 2.2 AA violations', async () => {
      await expectNoAccessibilityViolations(playground.page);
    });

    test('emits the query on Enter and clears back to an empty, focused field', async () => {
      const field = playground.preview.getByRole('searchbox', { name: 'Search training sites' });

      await field.fill('Rashid');
      await field.press('Enter');
      await expect(playground.outputs().getByRole('listitem')).toHaveText(['searchSubmitted ("Rashid")']);

      await playground.preview.getByRole('button', { name: 'Clear search' }).click();
      await expect(field).toHaveValue('');
      await expect(field).toBeFocused();
      await expect(playground.preview.getByRole('button', { name: 'Clear search' })).toHaveCount(0);
    });

    test('links the no-results message to the field', async () => {
      const field = playground.states.getByRole('searchbox', { name: 'No results' });

      await expect(field).toHaveAttribute('aria-invalid', 'true');
      await expect(field).toHaveAccessibleDescription(/can't find/);
    });
  });
}

test('search heights follow Figma Search 50:8605 (48 and 64 pixels)', async ({ page }) => {
  const playground = new PlaygroundPage(page);
  await playground.open('search', { theme: 'light', direction: 'ltr' });

  const heightOf = async (name: string): Promise<number> =>
    page
      .getByRole('searchbox', { name })
      .locator('xpath=ancestor::div[contains(@class, "dahc-form-field__box")]')
      .evaluate(element => element.getBoundingClientRect().height);

  expect(await heightOf('Search training sites')).toBe(48);
  expect(await heightOf('Large (64 pixels)')).toBe(64);
});

test('search serves its real source and reflows at 320 pixels', async ({ page }) => {
  const playground = new PlaygroundPage(page);
  await page.setViewportSize({ width: 320, height: 800 });
  await playground.open('search', { theme: 'light', direction: 'ltr' });

  await playground.expectSourceFile('forms/search/search.component.ts', "selector: 'dahc-search'");
  await expectNoHorizontalScroll(page);
});
