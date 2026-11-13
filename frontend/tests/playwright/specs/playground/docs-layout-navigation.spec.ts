import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations } from '../../support/accessibility';
import { PlaygroundPage } from '../../support/playground';

/** Documentation content of the Layout and Navigation pages: When To Use, named examples with code, API. */
const PAGES = [
  'affix',
  'divider',
  'flex',
  'grid',
  'layout',
  'space',
  'splitter',
  'anchor',
  'app-header',
  'back-top',
  'breadcrumbs',
  'dropdown',
  'float-button',
  'footer',
  'link',
  'menu',
  'nav-menu',
  'navigation-data',
  'page-header',
  'wizard',
];

for (const path of PAGES) {
  test(`${path} documents when to use it, shows examples with code and lists its API`, async ({ page }) => {
    const playground = new PlaygroundPage(page);
    await playground.open(path, { theme: 'light', direction: 'ltr' });

    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();

    const whenToUse = page.getByRole('region', { name: 'When To Use' });
    await expect(whenToUse.getByRole('heading', { level: 2, name: 'When To Use' })).toBeVisible();
    expect(await whenToUse.getByRole('listitem').count()).toBeGreaterThanOrEqual(2);

    const examples = page.getByRole('region', { name: 'Examples', exact: true }).locator('dahc-doc-example');
    expect(await examples.count()).toBeGreaterThanOrEqual(3);

    const first = examples.first();
    await first.getByRole('button', { name: 'Show code' }).click();
    await expect(first.getByRole('button', { name: 'Hide code' })).toHaveAttribute('aria-expanded', 'true');
    await expect(first.locator('pre')).toContainText('dahc');

    const api = page.getByRole('region', { name: 'API', exact: true });
    await expect(api.getByRole('table').first()).toBeVisible();

    await expectNoAccessibilityViolations(page);
  });
}
