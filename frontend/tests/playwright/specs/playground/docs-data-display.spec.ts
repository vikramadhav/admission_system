import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations } from '../../support/accessibility';
import { PlaygroundPage } from '../../support/playground';

const PAGES = [
  'accordion',
  'avatar',
  'badge',
  'card',
  'carousel',
  'comment',
  'detail-list',
  'image',
  'list',
  'qr-code',
  'stat-tile',
  'statistic',
  'table',
  'tag',
  'timeline',
  'tree',
  'watermark',
];

for (const path of PAGES) {
  test(`${path} documentation: when to use, examples with code and API`, async ({ page }) => {
    const playground = new PlaygroundPage(page);
    await playground.open(path, { theme: 'light', direction: 'ltr' });

    const whenToUse = page.getByRole('region', { name: 'When To Use' });
    await expect(whenToUse).toBeVisible();
    expect(await whenToUse.getByRole('listitem').count()).toBeGreaterThanOrEqual(2);

    const examples = page.locator('dahc-doc-example');
    expect(await examples.count()).toBeGreaterThanOrEqual(3);

    const first = examples.first();
    await first.getByRole('button', { name: 'Show code' }).click();
    await expect(first.locator('pre')).toContainText('<dahc');
    await expect(first.getByRole('button', { name: 'Hide code' })).toHaveAttribute('aria-expanded', 'true');

    const api = page.getByRole('region', { name: 'API' });
    await expect(api.getByRole('table').first()).toBeVisible();

    await expectNoAccessibilityViolations(page);
  });
}
