import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { DISPLAY_MODES, PlaygroundPage } from '../../support/playground';

for (const mode of DISPLAY_MODES) {
  test.describe(`data (${mode.theme}, ${mode.direction})`, () => {
    test('table sorts, selects and paginates', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('table', mode);
      await expectNoAccessibilityViolations(page);

      const table = playground.preview.getByRole('table', { name: 'Applications' });
      const scoreHeader = table.getByRole('columnheader', { name: /Score/ });
      await expect(scoreHeader).toHaveAttribute('aria-sort', 'none');

      await scoreHeader.getByRole('button').click();
      await expect(scoreHeader).toHaveAttribute('aria-sort', 'ascending');
      await expect(table.getByRole('row').nth(1)).toContainText('GME-0167');

      await scoreHeader.getByRole('button').click();
      await expect(scoreHeader).toHaveAttribute('aria-sort', 'descending');
      await expect(table.getByRole('row').nth(1)).toContainText('GME-0171');

      await table.getByRole('checkbox', { name: 'Select all rows on this page' }).check();
      await expect(page.getByTestId('table-state')).toContainText('"GME-0171"');
      await table.getByRole('checkbox', { name: 'Select row GME-0171' }).uncheck();
      await expect(table.getByRole('checkbox', { name: 'Select all rows on this page' })).toHaveJSProperty('indeterminate', true);

      await playground.preview.getByRole('navigation', { name: 'Pagination' }).getByRole('button', { name: 'Page 2' }).click();
      await expect(page.getByTestId('table-state')).toContainText('page 2');
      await expect(table.getByRole('row')).toHaveCount(3);

      // Page 2 of the descending score order: GME-0129 (Submitted) and GME-0167 (Draft), rendered
      // through the custom Status cell template as tags.
      await expect(table.locator('dahc-tag')).toHaveText(['Submitted', 'Draft']);
    });

    test('tabs move with arrows in the reading direction and skip disabled tabs', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('navigation-data', mode);
      await expectNoAccessibilityViolations(page);

      const tabs = playground.preview.getByRole('tablist', { name: 'Application' });
      const overview = tabs.getByRole('tab', { name: 'Overview' });
      await expect(overview).toHaveAttribute('aria-selected', 'true');
      await expect(playground.preview.getByRole('tabpanel', { name: 'Overview' })).toContainText('Program, preferences');

      await overview.focus();
      const forward = mode.direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
      await page.keyboard.press(forward);
      await expect(tabs.getByRole('tab', { name: 'Documents' })).toBeFocused();
      await expect(page.getByTestId('active-tab')).toHaveText('active: documents');

      await page.keyboard.press('End');
      await expect(tabs.getByRole('tab', { name: 'Payments' })).toBeFocused();
      await page.keyboard.press(forward);
      await expect(overview).toBeFocused();

      await playground.property('tabs tone').selectOption({ label: 'inverse' });
      await expectNoAccessibilityViolations(page);
    });

    test('steps mark the current step and announce every status', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('navigation-data', mode);

      const steps = playground.states.getByRole('list', { name: 'Application progress' });
      await expect(steps.getByRole('listitem')).toHaveCount(5);
      await expect(steps.locator('[aria-current="step"]')).toContainText('Personal information (Current step)');
      await expect(steps.getByRole('listitem').first()).toContainText('(Completed)');
      await expect(steps.getByRole('listitem').nth(3)).toContainText('(Needs attention)');
    });

    test('pagination moves pages, disables ends and keeps focus on the current page', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('navigation-data', mode);

      const nav = playground.states.getByRole('navigation', { name: 'Pagination' });
      await expect(nav.getByRole('button', { name: 'Previous' })).toBeDisabled();

      await nav.getByRole('button', { name: 'Page 5' }).click();
      await expect(nav.getByRole('button', { name: 'Page 5' })).toHaveAttribute('aria-current', 'page');
      await expect(nav.getByRole('button', { name: 'Page 5' })).toBeFocused();

      await nav.getByRole('button', { name: 'Page 10' }).click();
      await expect(nav.getByRole('button', { name: 'Next' })).toBeDisabled();
      await expect(page.getByTestId('current-page')).toHaveText('page: 10');
    });
  });
}

test('data pages reflow at 320 pixels', async ({ page }) => {
  const playground = new PlaygroundPage(page);
  await page.setViewportSize({ width: 320, height: 800 });

  for (const path of ['table', 'navigation-data']) {
    await playground.open(path, { theme: 'light', direction: 'ltr' });
    await expectNoHorizontalScroll(page);
  }
});
