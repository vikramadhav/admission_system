import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations } from '../../support/accessibility';

/** Documentation content of the General and Feedback pages (light theme, left-to-right). */
const PAGES: readonly { readonly path: string; readonly heading: string }[] = [
  { path: 'button', heading: 'Button' },
  { path: 'icon-button', heading: 'Icon button' },
  { path: 'button-group', heading: 'Button group' },
  { path: 'theme-switch', heading: 'Theme switch' },
  { path: 'alert', heading: 'Alert' },
  { path: 'drawer', heading: 'Drawer' },
  { path: 'modal', heading: 'Modal' },
  { path: 'empty-state', heading: 'Empty state' },
  { path: 'toast', heading: 'Toast' },
  { path: 'tooltip', heading: 'Tooltip' },
  { path: 'config-provider', heading: 'Config provider' },
  { path: 'message', heading: 'Message' },
  { path: 'notification', heading: 'Notification' },
  { path: 'popconfirm', heading: 'Popconfirm' },
  { path: 'popover', heading: 'Popover' },
  { path: 'progress', heading: 'Progress' },
  { path: 'result', heading: 'Result' },
  { path: 'skeleton', heading: 'Skeleton' },
  { path: 'spinner', heading: 'Spinner' },
];

for (const { path, heading } of PAGES) {
  test(`${path} documents when to use, examples with code and the API`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/${path}`);

    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'When To Use' })).toBeVisible();
    expect(await page.getByRole('region', { name: 'When To Use' }).getByRole('listitem').count()).toBeGreaterThanOrEqual(2);

    const examples = page.getByRole('region', { name: 'Examples' }).locator('dahc-doc-example');
    expect(await examples.count()).toBeGreaterThanOrEqual(3);

    const first = examples.first();
    await first.getByRole('button', { name: 'Show code' }).click();
    await expect(first.getByRole('button', { name: 'Hide code' })).toHaveAttribute('aria-expanded', 'true');
    await expect(first.locator('pre')).toContainText(/<dahc|dahc-/);

    await expect(page.getByRole('region', { name: 'API' }).locator('table').first()).toBeVisible();
    await expectNoAccessibilityViolations(page);
  });
}

test('the components overview lists the General and Feedback components with their descriptions', async ({ page }) => {
  await page.goto('/components/overview');

  const general = page.getByRole('region', { name: /General/ });
  await expect(general.getByRole('link', { name: /Button group/ })).toContainText('A segmented control');
  const feedback = page.getByRole('region', { name: /Feedback/ });
  await expect(feedback.getByRole('link', { name: /Spinner/ })).toContainText('dahc-spinner');
  await expect(feedback.getByRole('link', { name: /Popconfirm/ })).toContainText('Asks for confirmation');
});
