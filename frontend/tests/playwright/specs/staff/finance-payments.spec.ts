import { Page, expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { signInAsStaff } from '../../support/staff';

// Mock data (mock-oversight.ts): 30 payment records, 24 in the current cycle and 6 in the
// previous one. Record 0 (20260000100, Medical Internship) was paid today, record 1 (20260000113)
// two days ago; Medical Internship has 4 records in the current cycle.

function results(page: Page): ReturnType<Page['getByRole']> {
  return page.getByRole('table', { name: 'Application payments, newest payment first' });
}

function ddmmyyyy(date: Date): string {
  const iso = date.toISOString().slice(0, 10);

  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;
}

test('the finance officer sees the current cycle payments, newest payment first (US-1.3.13)', async ({ page }) => {
  await signInAsStaff(page, 'financeOfficer');

  await expect(page).toHaveURL('/finance/payments');
  await expect(page.getByRole('heading', { level: 1, name: 'Payments' })).toBeVisible();
  const rows = results(page).getByRole('row');
  // Header row plus the 24 current-cycle records.
  await expect(rows).toHaveCount(25);
  await expect(rows.nth(1)).toContainText('20260000100');
  await expect(rows.nth(1)).toContainText('Paid');
  await expect(rows.nth(1)).toContainText('Application Submission Fee');
  await expect(rows.nth(2)).toContainText('20260000113');
  // The Application ID is plain text, not a link, and rows open nothing.
  await expect(results(page).getByRole('link')).toHaveCount(0);

  await page.getByRole('combobox', { name: 'Admission cycle' }).selectOption({ label: 'All cycles' });
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(rows).toHaveCount(26);
  await expect(page.getByRole('button', { name: 'Load more' })).toBeVisible();
  await page.getByRole('button', { name: 'Load more' }).click();
  await expect(rows).toHaveCount(31);
  await expect(page.getByText('Showing 30 items')).toBeVisible();
});

test('filters by program, application ID and payment date range', async ({ page }) => {
  await signInAsStaff(page, 'financeOfficer');
  const rows = results(page).getByRole('row');
  await expect(rows).toHaveCount(25);

  await page.getByRole('combobox', { name: 'Program' }).selectOption({ label: 'Medical Internship' });
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(rows).toHaveCount(5);
  for (const row of await rows.all()) {
    if ((await row.getByRole('cell').count()) > 0) {
      await expect(row).toContainText('Medical Internship');
    }
  }

  await page.getByRole('button', { name: 'Clear' }).click();
  await expect(rows).toHaveCount(25);
  await page.getByRole('textbox', { name: 'Application ID' }).fill('20260000113');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(rows).toHaveCount(2);
  await expect(rows.nth(1)).toContainText('20260000113');

  await page.getByRole('button', { name: 'Clear' }).click();
  const today = ddmmyyyy(new Date());
  await page.getByRole('textbox', { name: 'Payment date from' }).fill(today);
  await page.getByRole('textbox', { name: 'Payment date to' }).fill(today);
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(rows).toHaveCount(2);
  await expect(rows.nth(1)).toContainText('20260000100');

  await page.getByRole('textbox', { name: 'Application ID' }).fill('99999999999');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.getByRole('heading', { name: 'No payments found' })).toBeVisible();
});

test('a "to" date before the "from" date is blocked', async ({ page }) => {
  await signInAsStaff(page, 'financeOfficer');
  await expect(results(page).getByRole('row')).toHaveCount(25);

  await page.getByRole('textbox', { name: 'Payment date from' }).fill(ddmmyyyy(new Date()));
  await page.getByRole('textbox', { name: 'Payment date to' }).fill(ddmmyyyy(new Date(Date.now() - 3 * 86_400_000)));
  await page.getByRole('button', { name: 'Search' }).click();

  await expect(page.getByText('The "to" date must be on or after the "from" date.')).toBeVisible();
  await expect(results(page).getByRole('row')).toHaveCount(25);
});

test('Export to Excel downloads the filtered records as an .xlsx file', async ({ page }) => {
  await signInAsStaff(page, 'financeOfficer');
  await expect(results(page).getByRole('row')).toHaveCount(25);

  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export to Excel' }).click();

  expect((await download).suggestedFilename()).toMatch(/^gme-payments-\d{4}-\d{2}-\d{2}\.xlsx$/);
});

test('other roles cannot open the payments page', async ({ page }) => {
  await signInAsStaff(page, 'officer');

  await page.goto('/finance/payments');
  await expect(page.getByRole('heading', { level: 1, name: 'You cannot open this page' })).toBeVisible();
});

test('the payments page passes axe in light and dark themes and reflows at 320 pixels', async ({ page }) => {
  await signInAsStaff(page, 'financeOfficer');
  await expect(results(page).getByRole('row')).toHaveCount(25);
  await expectNoAccessibilityViolations(page);

  await page.addInitScript(() => localStorage.setItem('dahc.theme', 'dark'));
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/finance/payments');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(results(page).getByRole('row')).toHaveCount(25);
  await expectNoHorizontalScroll(page);
  await expectNoAccessibilityViolations(page);
});
