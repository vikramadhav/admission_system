import { Page, expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { signInAsStaff } from '../../support/staff';

function main(page: Page): ReturnType<Page['getByRole']> {
  return page.getByRole('main');
}

function dialog(page: Page): ReturnType<Page['getByRole']> {
  return page.getByRole('dialog');
}

async function staffUsersReady(page: Page): Promise<void> {
  await expect(page.getByRole('heading', { level: 1, name: 'Staff users' })).toBeVisible();
  await expect(main(page).getByRole('link', { name: 'Noura Al Hashimi' })).toBeVisible();
}

test('the administrator lists, searches and filters staff users', async ({ page }) => {
  await signInAsStaff(page, 'administrator');
  await staffUsersReady(page);

  const table = main(page).getByRole('table');
  await expect(table.getByRole('link', { name: 'Dr. Layla Nasser' })).toBeVisible();
  await expect(table.getByText('Finance officer').first()).toBeVisible();

  await main(page).getByRole('searchbox', { name: 'Search by name or email' }).fill('Khalid');
  await expect(table.getByRole('link', { name: 'Khalid Rahman' })).toBeVisible();
  await expect(table.getByRole('link', { name: 'Noura Al Hashimi' })).toHaveCount(0);

  await main(page).getByRole('searchbox', { name: 'Search by name or email' }).fill('');
  await expect(table.getByRole('link', { name: 'Noura Al Hashimi' })).toBeVisible();
  await main(page).getByRole('combobox', { name: 'Role' }).selectOption({ label: 'Senior referee' });
  await expect(table.getByRole('link', { name: 'Dr. Yousef Karim' })).toBeVisible();
  await expect(table.getByRole('link', { name: 'Noura Al Hashimi' })).toHaveCount(0);
});

test('the administrator pre-registers a staff user, with validation and duplicate detection', async ({ page }) => {
  await signInAsStaff(page, 'administrator');
  await staffUsersReady(page);

  await page.getByRole('button', { name: 'Pre-register staff user' }).click();
  await expect(dialog(page).getByRole('heading', { name: 'Pre-register a staff user' })).toBeVisible();
  await dialog(page).getByRole('button', { name: 'Pre-register' }).click();
  await expect(dialog(page).getByText('This field is required.').first()).toBeVisible();
  await expect(dialog(page).getByText('Choose at least one role.')).toBeVisible();

  // Duplicate: the officer's email is already registered.
  await dialog(page).getByLabel('IDAM user id').fill('idam|new-officer');
  await dialog(page).getByLabel('Full name').fill('Noura Duplicate');
  await dialog(page).getByLabel('Email address').fill('officer@dubaihealth.example');
  await dialog(page).getByRole('checkbox', { name: 'Admission officer' }).check();
  await dialog(page).getByRole('button', { name: 'Pre-register' }).click();
  await expect(dialog(page).getByText('A staff user with this IDAM user id or email address is already registered.')).toBeVisible();

  await dialog(page).getByLabel('Email address').fill('salem.new@dubaihealth.example');
  await dialog(page).getByLabel('Full name').fill('Salem New');
  await dialog(page).getByRole('button', { name: 'Pre-register' }).click();

  await expect(page.getByText('Salem New is pre-registered')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: 'Salem New' })).toBeVisible();
  await expect(main(page).getByText('Not yet')).toBeVisible();
});

test('the administrator changes a staff user’s roles', async ({ page }) => {
  await signInAsStaff(page, 'administrator');
  await staffUsersReady(page);
  await main(page).getByRole('link', { name: 'Noura Al Hashimi' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'Noura Al Hashimi' })).toBeVisible();
  const roles = main(page).getByRole('group', { name: 'Roles' });
  await expect(roles.getByRole('checkbox', { name: 'Admission officer' })).toBeChecked();

  // At least one role is required.
  await roles.getByRole('checkbox', { name: 'Admission officer' }).uncheck();
  await main(page).getByRole('button', { name: 'Save roles' }).click();
  await expect(main(page).getByText('Keep at least one role. To remove all access, deactivate the user instead.')).toBeVisible();

  await roles.getByRole('checkbox', { name: 'Admission supervisor' }).check();
  await main(page).getByRole('button', { name: 'Save roles' }).click();
  await expect(page.getByText('Roles saved')).toBeVisible();
  await expect(roles.getByRole('checkbox', { name: 'Admission supervisor' })).toBeChecked();
  await expect(roles.getByRole('checkbox', { name: 'Admission officer' })).not.toBeChecked();
  // The removed active role falls back to the remaining role.
  await expect(main(page).getByText('Working as')).toBeVisible();
  await expect(main(page).locator('dahc-detail-list')).toContainText('Admission supervisor');

  // A second save uses the new version and succeeds.
  await roles.getByRole('checkbox', { name: 'Finance officer' }).check();
  await main(page).getByRole('button', { name: 'Save roles' }).click();
  await expect(page.getByText('Roles saved').last()).toBeVisible();

  // After a reload the change is kept.
  await page.reload();
  await expect(main(page).getByRole('group', { name: 'Roles' }).getByRole('checkbox', { name: 'Finance officer' })).toBeChecked();
});

test('the administrator deactivates and reactivates a staff user', async ({ page }) => {
  await signInAsStaff(page, 'administrator');
  await staffUsersReady(page);
  await main(page).getByRole('link', { name: 'Salem Obaid' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Salem Obaid' })).toBeVisible();

  await main(page).getByRole('button', { name: 'Deactivate user' }).click();
  await expect(dialog(page).getByRole('heading', { name: 'Deactivate this user?' })).toBeVisible();
  await dialog(page).getByRole('button', { name: 'Deactivate user' }).click();
  await expect(dialog(page).getByText('This field is required.')).toBeVisible();
  await dialog(page).getByLabel('Reason').fill('Left the monitoring team.');
  await dialog(page).getByRole('button', { name: 'Deactivate user' }).click();

  await expect(page.getByText('Salem Obaid is deactivated')).toBeVisible();
  await expect(page.locator('dahc-page-header').getByText('Deactivated')).toBeVisible();

  await main(page).getByRole('button', { name: 'Reactivate user' }).click();
  await expect(page.getByText('Salem Obaid is active again')).toBeVisible();
  await expect(page.locator('dahc-page-header').getByText('Active', { exact: true })).toBeVisible();
});

test('the administrator registers and edits an integration client', async ({ page }) => {
  await signInAsStaff(page, 'administrator');
  await staffUsersReady(page);
  await page.getByRole('banner').getByRole('link', { name: 'Integration clients' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'Integration clients' })).toBeVisible();
  const table = main(page).getByRole('table');
  await expect(table.getByText('Payment gateway adapter')).toBeVisible();
  await expect(table.getByText('Send payment gateway events')).toBeVisible();

  await page.getByRole('button', { name: 'Register integration client' }).click();
  await dialog(page).getByRole('button', { name: 'Register' }).click();
  await expect(dialog(page).getByText('This field is required.').first()).toBeVisible();

  // Duplicate IDAM client id.
  await dialog(page).getByLabel('IDAM client id').fill('dahc-payment-gateway');
  await dialog(page).getByLabel('Name').fill('Second gateway');
  await dialog(page).getByRole('button', { name: 'Register' }).click();
  await expect(dialog(page).getByText('An integration client with this IDAM client id is already registered.')).toBeVisible();

  await dialog(page).getByLabel('IDAM client id').fill('dahc-reporting');
  await dialog(page).getByLabel('Name').fill('Reporting service');
  await dialog(page).getByRole('button', { name: 'Register' }).click();
  await expect(page.getByText('Reporting service is registered')).toBeVisible();
  await expect(table.getByText('Reporting service')).toBeVisible();

  await table.getByRole('button', { name: 'Edit Reporting service' }).click();
  await expect(dialog(page).getByRole('heading', { name: 'Edit integration client' })).toBeVisible();
  await expect(dialog(page).getByText('IDAM client id: dahc-reporting')).toBeVisible();
  await dialog(page).getByLabel('Name').fill('Reporting service (BI)');
  await dialog(page).getByRole('checkbox', { name: 'Send payment gateway events' }).check();
  await dialog(page).getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByText('Reporting service (BI) is saved')).toBeVisible();
  const row = table.getByRole('row').filter({ hasText: 'Reporting service (BI)' });
  await expect(row.getByText('Send payment gateway events')).toBeVisible();
});

test('other roles cannot open the admin area', async ({ page }) => {
  await signInAsStaff(page, 'supervisor');

  for (const path of ['/admin/staff-users', '/admin/integration-clients', '/admin/staff-users/su-officer']) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1, name: 'You cannot open this page' }), path).toBeVisible();
  }
});

test('admin pages pass axe in light and dark themes and reflow at 320 pixels', async ({ page }) => {
  await signInAsStaff(page, 'administrator');
  await staffUsersReady(page);
  await expectNoAccessibilityViolations(page);

  await page.getByRole('button', { name: 'Pre-register staff user' }).click();
  await expect(dialog(page)).toBeVisible();
  await expectNoAccessibilityViolations(page);
  await dialog(page).getByRole('button', { name: 'Cancel' }).click();

  await page.addInitScript(() => localStorage.setItem('dahc.theme', 'dark'));
  await page.setViewportSize({ width: 320, height: 800 });

  for (const [path, heading] of [
    ['/admin/staff-users', 'Staff users'],
    ['/admin/staff-users/su-officer', 'Noura Al Hashimi'],
    ['/admin/integration-clients', 'Integration clients'],
  ] as const) {
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
    await expect(main(page).getByRole('table').or(main(page).getByRole('group', { name: 'Roles' })).first()).toBeVisible();
    await expectNoHorizontalScroll(page);
    await expectNoAccessibilityViolations(page);
  }
});
