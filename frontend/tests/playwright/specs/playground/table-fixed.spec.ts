import { Locator, expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { DISPLAY_MODES, PlaygroundPage } from '../../support/playground';

async function position(locator: Locator): Promise<{ x: number; y: number }> {
  const box = await locator.boundingBox();

  if (!box) {
    throw new Error('Element is not visible');
  }

  return { x: Math.round(box.x), y: Math.round(box.y) };
}

for (const mode of DISPLAY_MODES) {
  test.describe(`table fixed columns (${mode.theme}, ${mode.direction})`, () => {
    test('the header and the fixed columns stay in place while the table scrolls', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await page.setViewportSize({ width: 1280, height: 900 });
      await playground.open('table', mode);

      const region = playground.preview.getByRole('region', { name: 'Candidate register' });
      const table = region.getByRole('table', { name: 'Candidate register' });
      const host = playground.preview.locator('dahc-table').nth(1);
      const header = table.getByRole('columnheader', { name: 'Application ID' });
      const firstCell = table.getByRole('cell', { name: 'GME-0200', exact: true });
      const actionCell = table.getByRole('cell', { name: 'View GME-0200' });
      const movingCell = table.getByRole('row').nth(1).getByRole('cell').nth(3);

      await region.scrollIntoViewIfNeeded();
      await expect(firstCell).toBeVisible();
      await expectNoAccessibilityViolations(page);
      await expect(host).not.toHaveClass(/dahc-table--shadow-start/);
      await expect(host).toHaveClass(/dahc-table--shadow-end/);

      // Vertical scroll: the caption scrolls away and the header row sticks to the top of the scroll area.
      const regionTop = (await position(region)).y;
      await region.evaluate(element => element.scrollBy({ top: 400 }));
      await expect.poll(async () => (await position(header)).y - regionTop).toBeLessThanOrEqual(2);
      await expect(header).toBeInViewport();

      // Horizontal scroll (scrollLeft is negative in right-to-left layouts).
      const firstBefore = await position(firstCell);
      const actionBefore = await position(actionCell.first());
      const movingBefore = await position(movingCell);
      await region.evaluate((element, rtl) => element.scrollBy({ left: rtl ? -400 : 400 }), mode.direction === 'rtl');

      await expect(host).toHaveClass(/dahc-table--shadow-start/);
      await expect.poll(async () => (await position(firstCell)).x).toBe(firstBefore.x);
      await expect.poll(async () => (await position(actionCell.first())).x).toBe(actionBefore.x);
      expect((await position(movingCell)).x).not.toBe(movingBefore.x);
      await expectNoAccessibilityViolations(page);

      // At the far end the end shadow goes away.
      await region.evaluate((element, rtl) => element.scrollBy({ left: rtl ? -5000 : 5000 }), mode.direction === 'rtl');
      await expect(host).not.toHaveClass(/dahc-table--shadow-end/);
      await expect(host).toHaveClass(/dahc-table--shadow-start/);
    });
  });
}

test('the scroll region is keyboard scrollable and fixed columns can be switched off', async ({ page }) => {
  const playground = new PlaygroundPage(page);
  await page.setViewportSize({ width: 1280, height: 900 });
  await playground.open('table', { theme: 'light', direction: 'ltr' });

  const region = playground.preview.getByRole('region', { name: 'Candidate register' });
  await region.focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => region.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);

  await playground.property('fixed columns').uncheck();
  await expect(region.locator('.dahc-table__fixed')).toHaveCount(0);
});

test('the page does not scroll sideways at 320 pixels; the table scrolls inside its region', async ({ page }) => {
  const playground = new PlaygroundPage(page);
  await page.setViewportSize({ width: 320, height: 800 });
  await playground.open('table', { theme: 'light', direction: 'ltr' });

  await expect(playground.preview.getByRole('region', { name: 'Candidate register' })).toBeVisible();
  await expectNoHorizontalScroll(page);
});
