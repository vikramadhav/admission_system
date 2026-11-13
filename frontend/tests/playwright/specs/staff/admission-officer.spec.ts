import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { signInAsStaff } from '../../support/staff';

// Mock data: the officer (Noura Al Hashimi) has 8 open applications, Internal Medicine has 4 waiting
// and Medical Internship 3 (projects/dahc-portal/src/app/mock/mock-admission-seed.ts).

test('the officer dashboard shows pool insights, the queue and the inbox (US-2.1.2)', async ({ page }) => {
  await signInAsStaff(page, 'officer');

  await expect(page.getByRole('heading', { level: 1, name: 'My applications' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Pool insights' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Your queue' })).toBeVisible();

  const inbox = page.getByRole('table', { name: 'Your inbox' });
  await expect(inbox.getByRole('row')).toHaveCount(9);
  await expect(inbox).toContainText('Overdue');
  await expect(page.getByText('Showing 8 items')).toBeVisible();

  await expectNoAccessibilityViolations(page);
});

test('a queue insight filters the inbox and choosing it again shows everything (US-2.1.2 AC10)', async ({ page }) => {
  await signInAsStaff(page, 'officer');

  const inProgress = page.getByRole('button', { name: /In progress/ });
  await inProgress.click();

  await expect(inProgress).toHaveAttribute('aria-pressed', 'true');
  const filtered = page.getByRole('table', { name: 'Your inbox: In progress' });
  await expect(filtered.getByRole('row')).toHaveCount(3);

  await inProgress.click();
  await expect(page.getByRole('table', { name: 'Your inbox' }).getByRole('row')).toHaveCount(9);
});

test('searching the inbox by candidate name narrows the list', async ({ page }) => {
  await signInAsStaff(page, 'officer');
  const inbox = page.getByRole('table', { name: 'Your inbox' });
  await expect(inbox.getByRole('row')).toHaveCount(9);
  const name = (await inbox.getByRole('row').nth(1).getByRole('cell').nth(1).textContent())?.trim() ?? '';

  await page.getByRole('searchbox', { name: 'Search by application ID or candidate name' }).fill(name);

  await expect(inbox.getByRole('row').nth(1)).toContainText(name);
  await expect(page.getByText(/Showing [1-7] items?/)).toBeVisible();
});

test('the officer retrieves applications from a pool, then sees the empty-pool message (US-2.2.1)', async ({ page }) => {
  await signInAsStaff(page, 'officer');
  const pools = page.getByRole('region', { name: 'Your pools' }).or(page.locator('section', { has: page.getByRole('heading', { name: 'Your pools' }) }));
  await expect(pools.getByText('4 applications waiting')).toBeVisible();

  await page.getByRole('button', { name: 'Retrieve applications from Medical Residency – Internal Medicine' }).click();

  await expect(page.getByText('4 applications added to your inbox')).toBeVisible();
  await expect(page.getByText('Showing 12 items')).toBeVisible();
  await expect(pools.getByText('No applications waiting')).toBeVisible();

  await page.getByRole('button', { name: 'Retrieve applications from Medical Residency – Internal Medicine' }).click();
  await expect(page.getByText('There are no applications waiting in this pool.')).toBeVisible();
});

test('sorting by candidate name asks the server again and keeps the inbox', async ({ page }) => {
  await signInAsStaff(page, 'officer');
  const inbox = page.getByRole('table', { name: 'Your inbox' });
  await expect(inbox.getByRole('row')).toHaveCount(9);

  await inbox.getByRole('button', { name: 'Candidate name' }).click();

  await expect(inbox.getByRole('columnheader', { name: 'Candidate name' })).toHaveAttribute('aria-sort', 'ascending');
  await expect(inbox.getByRole('row')).toHaveCount(9);
});

test('an application link opens the review page', async ({ page }) => {
  await signInAsStaff(page, 'officer');
  const firstLink = page.getByRole('table', { name: 'Your inbox' }).getByRole('link').first();
  const number = (await firstLink.textContent())?.trim() ?? '';

  await firstLink.click();

  await expect(page).toHaveURL(/\/admission\/applications\/rv-/);
  expect(number).toMatch(/^2026\d{7}$/);
});

test('the officer dashboard reflows at 320 pixels and passes axe in the dark theme', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('dahc.theme', 'dark'));
  await page.setViewportSize({ width: 320, height: 800 });
  await signInAsStaff(page, 'officer');

  await expect(page.getByRole('table', { name: 'Your inbox' }).getByRole('row')).toHaveCount(9);
  await expectNoHorizontalScroll(page);
  await expectNoAccessibilityViolations(page);
});
