import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { DISPLAY_MODES, PlaygroundPage } from '../../support/playground';

// The NG-ZORRO-style documentation shell of the playground kit: header search, Docs / Components
// sections, the components overview, the page contents and the generated API tables.

test('the site opens on the introduction with the Docs menu', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveURL(/\/docs\/introduce$/);
  await expect(page.getByRole('heading', { level: 1, name: 'DAHC UI' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Site' }).getByRole('link', { name: 'Docs' })).toHaveAttribute('aria-current', 'page');
  const menu = page.getByRole('navigation', { name: 'Docs' });
  await expect(menu.getByRole('link', { name: 'Getting started' })).toBeVisible();
  await expect(menu.getByRole('link', { name: 'Colour' })).toBeVisible();
  await expectNoAccessibilityViolations(page);
});

test('search finds a component from anywhere with the slash shortcut and the keyboard', async ({ page }) => {
  await page.goto('/docs/introduce');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  await page.keyboard.press('/');
  const search = page.getByRole('combobox', { name: 'Search components and docs' });
  await expect(search).toBeFocused();
  await search.fill('date');
  const results = page.getByRole('listbox', { name: 'Search results' });
  await expect(results.getByRole('option').first()).toContainText('Date picker');
  await expect(search).toHaveAttribute('aria-expanded', 'true');
  await expectNoAccessibilityViolations(page);

  await search.press('Enter');
  await expect(page).toHaveURL(/\/date-picker$/);
  await expect(page.getByRole('navigation', { name: 'Site' }).getByRole('link', { name: 'Components' })).toHaveAttribute('aria-current', 'page');
  await expect(search).toHaveValue('');
});

test('the components overview groups every component and filters them', async ({ page }) => {
  await page.goto('/components/overview');

  await expect(page.getByRole('heading', { level: 1, name: 'Components Overview' })).toBeVisible();
  for (const group of ['General', 'Layout', 'Navigation', 'Data entry', 'Data display', 'Feedback']) {
    await expect(page.getByRole('main').getByRole('heading', { level: 2, name: new RegExp(`^${group}`) })).toBeVisible();
  }

  await page.getByLabel('Filter components').fill('slider');
  await expect(page.getByRole('main').getByRole('link', { name: /Slider/ })).toBeVisible();
  await expect(page.getByRole('main').getByRole('link', { name: /^Button/ })).toHaveCount(0);
  await expect(page.getByRole('status').filter({ hasText: 'components' })).toContainText('1 of');
  await expectNoAccessibilityViolations(page);
});

test('a component page has examples, an API generated from its source and working page contents', async ({ page }) => {
  await page.setViewportSize({ width: 1500, height: 900 });
  await page.goto('/button');

  await expect(page.getByRole('heading', { level: 2, name: 'Examples' })).toBeVisible();
  const api = page.getByRole('region', { name: 'API' });
  await expect(api.getByRole('table').first()).toBeVisible();
  await expect(api).toContainText('[variant]');
  await expect(api).toContainText('DahcButtonVariant');

  const contents = page.getByRole('navigation', { name: 'Page sections' });
  await contents.getByRole('link', { name: 'API' }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'API' })).toBeFocused();
  await expect(contents.getByRole('link', { name: 'API' })).toHaveAttribute('aria-current', 'location');
});

for (const mode of DISPLAY_MODES) {
  test(`the docs shell passes axe (${mode.theme}, ${mode.direction})`, async ({ page }) => {
    const playground = new PlaygroundPage(page);
    await playground.open('components/overview', mode);
    await expectNoAccessibilityViolations(page);
  });
}

test('the docs site reflows at 320 pixels with the side menu behind a toggle', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/components/overview');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expectNoHorizontalScroll(page);

  const toggle = page.getByRole('button', { name: 'Components menu' });
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await page.getByRole('navigation', { name: 'Components' }).getByRole('link', { name: 'Button', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: /Button/ })).toBeVisible();
  await expectNoHorizontalScroll(page);

  await page.goto('/docs/getting-started');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expectNoHorizontalScroll(page);
});
