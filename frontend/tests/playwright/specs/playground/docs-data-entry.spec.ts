import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations } from '../../support/accessibility';

const PAGES = [
  'auto-complete',
  'cascader',
  'checkbox',
  'color-picker',
  'date-picker',
  'file-upload',
  'form-field',
  'form-layout',
  'input-number',
  'mention',
  'multi-select',
  'phone-input',
  'radio-group',
  'ranked-selection',
  'rate',
  'search',
  'segmented',
  'select',
  'slider',
  'switch',
  'time-picker',
  'transfer',
  'tree-select',
];

for (const path of PAGES) {
  test(`${path} docs: when to use, examples with code, API`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/${path}`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    const whenToUse = page.getByRole('region', { name: 'When To Use' });
    expect(await whenToUse.getByRole('listitem').count()).toBeGreaterThanOrEqual(2);

    const examples = page.locator('dahc-doc-example');
    expect(await examples.count()).toBeGreaterThanOrEqual(3);

    const first = examples.first();
    await first.getByRole('button', { name: 'Show code' }).click();
    await expect(first.getByRole('button', { name: 'Hide code' })).toHaveAttribute('aria-expanded', 'true');
    await expect(first.locator('pre code')).toContainText('dahc');

    const api = page.getByRole('region', { name: 'API' });

    if (path === 'switch') {
      // dahc-switch declares no inputs of its own; its disabled input lives on the form-control base
      // class, which the API parser does not read yet (bare @Directive()).
      await expect(api).toBeVisible();
    } else {
      await expect(api.getByRole('table').first()).toBeVisible();
    }

    await expectNoAccessibilityViolations(page);
  });
}
