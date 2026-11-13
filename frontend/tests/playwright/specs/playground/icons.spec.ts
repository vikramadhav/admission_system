import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations } from '../../support/accessibility';
import { DISPLAY_MODES, PlaygroundPage } from '../../support/playground';

test('every icon file is served and every tile renders', async ({ page }) => {
  const playground = new PlaygroundPage(page);
  const failed: string[] = [];
  page.on('response', response => {
    if (response.url().includes('/dahc-ui/icons/') && !response.ok()) {
      failed.push(response.url());
    }
  });

  await playground.open('foundations/icons', { theme: 'light', direction: 'ltr' });
  const tiles = page.getByTestId('icon-tile');
  await expect(tiles).toHaveCount(193);
  await expect(page.getByTestId('icon-group').getByRole('heading')).toHaveText([
    'Functional (35)',
    'Government (20)',
    'Services (37)',
    'View (59)',
    'Social media (42)',
  ]);

  const sizes = await tiles.locator('dahc-icon').evaluateAll(icons =>
    icons.map(icon => {
      const box = icon.getBoundingClientRect();
      return `${box.width}x${box.height}`;
    }),
  );
  expect(new Set(sizes)).toEqual(new Set(['24x24']));

  await page.waitForLoadState('networkidle');
  expect(failed).toEqual([]);
});

test('brand logos keep their colours and other icons follow the text colour', async ({ page }) => {
  const playground = new PlaygroundPage(page);
  await playground.open('foundations/icons', { theme: 'light', direction: 'ltr' });

  const render = async (name: string): Promise<{ mask: string; background: string }> =>
    page
      .getByTestId('icon-tile')
      .filter({ hasText: new RegExp(`^${name}$`) })
      .locator('dahc-icon')
      .evaluate(icon => ({ mask: getComputedStyle(icon).maskImage, background: getComputedStyle(icon).backgroundImage }));

  const brand = await render('social-facebook-brand');
  expect(brand.mask).toBe('none');
  expect(brand.background).toContain('social-facebook-brand.svg');

  const plain = await render('service-cardiology');
  expect(plain.mask).toContain('service-cardiology.svg');
});

test('the filter searches across every set', async ({ page }) => {
  const playground = new PlaygroundPage(page);
  await playground.open('foundations/icons', { theme: 'light', direction: 'ltr' });

  await page.getByLabel('Filter by name').fill('phone');
  await expect(page.getByTestId('icon-tile')).toHaveText([/^phone/, /^gov-phone/, /^view-phone/]);
  await expect(page.getByTestId('icon-total')).toHaveText('3 icons');
});

test('directional icons mirror in right-to-left and others do not', async ({ page }) => {
  const playground = new PlaygroundPage(page);
  await playground.open('foundations/icons', { theme: 'light', direction: 'rtl' });

  const transform = async (name: string): Promise<string> =>
    page
      .getByTestId('icon-tile')
      .filter({ hasText: new RegExp(`^${name}`) })
      .locator('dahc-icon')
      .evaluate(icon => getComputedStyle(icon).transform);

  expect(await transform('chevron-right')).toBe('matrix(-1, 0, 0, 1, 0, 0)');
  expect(await transform('search')).toBe('none');
});

for (const mode of DISPLAY_MODES) {
  test(`icons page has no WCAG 2.2 AA violations (${mode.theme}, ${mode.direction})`, async ({ page }) => {
    const playground = new PlaygroundPage(page);
    await playground.open('foundations/icons', mode);

    await expectNoAccessibilityViolations(page);
  });
}
