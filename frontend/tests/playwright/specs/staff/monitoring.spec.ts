import { Page, expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { signInAsStaff } from '../../support/staff';

/**
 * Central monitoring (US-2.1.4) against the mock build. The charts are derived from the admission
 * back-office applications (mock/mock-admission-seed.ts), each given one or two training sites
 * (mock/mock-oversight.ts). Everything is read-only.
 */

async function openDashboard(page: Page): Promise<void> {
  await signInAsStaff(page, 'centralMonitor');
  await expect(page).toHaveURL('/monitoring');
  await expect(page.getByRole('heading', { level: 1, name: 'Site monitoring' })).toBeVisible();
  await expect(page.getByRole('button', { name: /selections$/ }).first()).toBeVisible();
}

test('the central monitor sees the pool insights and the three site charts, read-only', async ({ page }) => {
  await openDashboard(page);

  const main = page.getByRole('main');
  await expect(main.getByRole('heading', { level: 2, name: 'All pools' })).toBeVisible();
  await expect(main.getByText('Under verification', { exact: true })).toBeVisible();
  await expect(main.getByRole('heading', { level: 2, name: 'Training site interest by specialty' })).toBeVisible();
  await expect(main.getByRole('heading', { level: 2, name: 'Site applications by status' })).toBeVisible();
  await expect(main.getByRole('heading', { level: 2, name: 'Site applications by program' })).toBeVisible();
  await expect(main.getByText('Site selections by training site and specialty')).toBeVisible();
  await expect(main.getByText(/totals are not expected to match the pool counts/)).toBeVisible();

  // No inbox, retrieval or decisions for this role.
  await expect(main.getByRole('button', { name: /Retrieve|Reassign|Complete verification/ })).toHaveCount(0);
});

test('a chart segment chosen by keyboard drills down to the applications behind it', async ({ page }) => {
  await openDashboard(page);

  const segment = page.getByRole('button', { name: /^Rashid Hospital, .+: \d+ selections$/ }).first();
  const name = (await segment.getAttribute('aria-label')) ?? '';
  const [site, rest] = name.split(', ');
  const specialty = (rest ?? '').split(':')[0] ?? '';
  await segment.focus();
  await page.keyboard.press('Enter');

  await expect(page).toHaveURL(/\/monitoring\/applications\?.*siteId=s-rashid/);
  await expect(page).toHaveURL(/specialtyId=/);
  await expect(page.getByRole('heading', { level: 1, name: `Applications: ${site} · ${specialty}` })).toBeVisible();
  const table = page.getByRole('table', { name: /Applications in the selected chart segment/ });
  await expect(table.getByRole('link').first()).toBeVisible();

  await page.getByRole('link', { name: 'Back to site monitoring' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Site monitoring' })).toBeVisible();
});

test('a donut slice drills down by status, and the application opens read-only', async ({ page }) => {
  await openDashboard(page);

  const slice = page.getByRole('button', { name: /: \d+ applications$/ }).first();
  await slice.focus();
  await page.keyboard.press('Space');
  await expect(page).toHaveURL(/\/monitoring\/applications\?.*(applicationStatus|programId)=/);

  const link = page.getByRole('table', { name: /Applications in the selected chart segment/ }).getByRole('link').first();
  const number = (await link.textContent())?.trim() ?? '';
  await link.click();

  await expect(page.getByRole('heading', { level: 1, name: `Application ${number}` })).toBeVisible();
  await expect(page.getByText('Read only. Site monitoring cannot change applications.')).toBeVisible();
  await expect(page.getByRole('main').getByRole('button', { name: /^Flag|Return for correction|Complete verification|Replace|Recommend screen-out|Escalate/ })).toHaveCount(0);
});

test('every chart has a table alternative', async ({ page }) => {
  await openDashboard(page);

  const toggles = page.getByRole('button', { name: 'Show as table' });
  expect(await toggles.count()).toBeGreaterThanOrEqual(3);
  await toggles.first().click();
  await expect(page.getByRole('button', { name: 'Hide table' })).toHaveAttribute('aria-expanded', 'true');
  const table = page.getByRole('table', { name: 'Site selections by training site and specialty' });
  await expect(table.getByRole('columnheader', { name: 'Training site' })).toBeVisible();
  await expect(table.getByRole('columnheader', { name: 'Specialty' })).toBeVisible();
  await expect(table.getByRole('cell', { name: 'Rashid Hospital' }).first()).toBeVisible();
});

test('the program filter refreshes the charts', async ({ page }) => {
  await openDashboard(page);

  const program = page.getByRole('combobox', { name: 'Program' });
  const value = await program.locator('option', { hasText: 'Medical Internship' }).first().getAttribute('value');
  await program.selectOption(value ?? '');

  const programSection = page.getByRole('region', { name: 'Site applications by program' });
  await expect(page.getByRole('main').getByRole('group', { name: 'Medical Residency' })).toHaveCount(0);
  await expect(programSection.getByRole('group', { name: 'Medical Internship' })).toBeVisible();
});

test('the admission supervisor opens site monitoring from the navigation; an officer cannot', async ({ page, browser }) => {
  await signInAsStaff(page, 'supervisor');
  await page.getByRole('banner').getByRole('navigation', { name: 'Staff' }).getByRole('link', { name: 'Site monitoring' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Site monitoring' })).toBeVisible();
  await expect(page.getByRole('button', { name: /selections$/ }).first()).toBeVisible();

  const context = await browser.newContext({ baseURL: test.info().project.use.baseURL });
  const officer = await context.newPage();
  await signInAsStaff(officer, 'officer');
  await officer.goto('/monitoring');
  await expect(officer.getByRole('heading', { level: 1, name: 'You cannot open this page' })).toBeVisible();
  await context.close();
});

test('the monitoring pages pass axe in light, dark and right-to-left, and reflow at 320 pixels', async ({ page }) => {
  await openDashboard(page);
  await page.getByRole('button', { name: 'Show as table' }).first().click();
  await expectNoAccessibilityViolations(page);

  await page.evaluate(() => document.documentElement.setAttribute('dir', 'rtl'));
  await expectNoAccessibilityViolations(page);
  await page.evaluate(() => document.documentElement.setAttribute('dir', 'ltr'));

  await page.addInitScript(() => localStorage.setItem('dahc.theme', 'dark'));
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/monitoring');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('button', { name: /selections$/ }).first()).toBeVisible();
  await expectNoHorizontalScroll(page);
  await expectNoAccessibilityViolations(page);

  await page.evaluate(() => document.documentElement.setAttribute('dir', 'rtl'));
  await expectNoHorizontalScroll(page);
  await expectNoAccessibilityViolations(page);

  await page.getByRole('button', { name: /selections$/ }).first().click();
  await expect(page.getByRole('heading', { level: 1, name: /^Applications/ })).toBeVisible();
  await expectNoHorizontalScroll(page);
  await expectNoAccessibilityViolations(page);
});
