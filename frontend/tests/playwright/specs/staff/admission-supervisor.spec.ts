import { Page, expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { signInAsStaff } from '../../support/staff';

// Mock data (mock-admission-seed.ts): 2 escalations, 1 screen-out recommendation and 2 pending
// reinstatement requests; officers Noura Al Hashimi, Omar Khalifa and Fatma Al Ali; Omar has 2
// applications in progress (1 overdue), 1 pending clarification and 3 completed.

async function openOmarsWorkload(page: Page): Promise<void> {
  await signInAsStaff(page, 'supervisor');
  await page.getByRole('table', { name: "Officers' workload" }).getByRole('link', { name: 'Omar Khalifa' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Workload of Omar Khalifa' })).toBeVisible();
}

test('the supervisor dashboard shows insights, requests and both workloads (US-2.1.3)', async ({ page }) => {
  await signInAsStaff(page, 'supervisor');

  await expect(page.getByRole('heading', { level: 1, name: 'Supervision' })).toBeVisible();
  const requests = page.getByRole('table', { name: 'Requests waiting for your decision' });
  await expect(requests.getByRole('row')).toHaveCount(6);
  await expect(page.getByRole('table', { name: "Officers' workload" }).getByRole('row')).toHaveCount(4);
  await expect(page.getByRole('table', { name: "Referees' workload" })).toContainText('Dr. Layla Nasser');

  await expectNoAccessibilityViolations(page);
});

test('the request type filter shows one queue and links each row to the right page', async ({ page }) => {
  await signInAsStaff(page, 'supervisor');
  const requests = page.getByRole('table', { name: 'Requests waiting for your decision' });
  await expect(requests.getByRole('row')).toHaveCount(6);

  await page.getByRole('combobox', { name: 'Request type' }).selectOption({ label: 'Reinstatement' });
  await expect(requests.getByRole('row')).toHaveCount(3);
  await requests.getByRole('link').first().click();
  await expect(page).toHaveURL(/\/admission\/supervisor\/reinstatements\/ri-/);

  await page.goBack();
  await page.getByRole('combobox', { name: 'Request type' }).selectOption({ label: 'Escalation' });
  await expect(requests.getByRole('row')).toHaveCount(3);
  await requests.getByRole('link').first().click();
  await expect(page).toHaveURL(/\/admission\/applications\/rv-/);
});

test("an officer's workload lists every application and filters overdue ones (US-2.2.2)", async ({ page }) => {
  await openOmarsWorkload(page);
  const table = page.getByRole('table', { name: 'Applications of this officer' });
  await expect(table.getByRole('row')).toHaveCount(7);

  await page.getByRole('checkbox', { name: 'Show overdue only' }).check();

  await expect(table.getByRole('row')).toHaveCount(2);
  await expect(table).toContainText('Overdue');
  await expectNoAccessibilityViolations(page);
});

test('the supervisor reassigns an overdue application to another officer of the pool (US-2.2.3)', async ({ page }) => {
  await openOmarsWorkload(page);
  await page.getByRole('checkbox', { name: 'Show overdue only' }).check();
  const table = page.getByRole('table', { name: 'Applications of this officer' });
  await expect(table.getByRole('row')).toHaveCount(2);

  await table.getByRole('row').nth(1).getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Reassign or return selected' }).click();

  const dialog = page.getByRole('dialog', { name: 'Reassign or return applications' });
  await dialog.getByRole('button', { name: 'Confirm' }).click();
  await expect(dialog.getByText('Choose the officer to reassign to.')).toBeVisible();
  await expect(dialog.getByText('This field is required.')).toBeVisible();

  await dialog.getByRole('combobox', { name: 'Officer to reassign to' }).selectOption({ index: 1 });
  await dialog.getByRole('textbox', { name: 'Justification' }).fill('Omar is on leave this week.');
  await dialog.getByRole('button', { name: 'Confirm' }).click();

  await expect(dialog.getByText('1 of 1 applications were updated.')).toBeVisible();
  await expectNoAccessibilityViolations(page);
  await dialog.getByRole('button', { name: 'Done' }).click();

  await expect(page.getByRole('heading', { name: 'No applications' })).toBeVisible();
});

test('returning a mixed selection to the pool reports the applications that could not move (US-2.2.3, PQ-17)', async ({ page }) => {
  await openOmarsWorkload(page);
  const table = page.getByRole('table', { name: 'Applications of this officer' });
  await expect(table.getByRole('row')).toHaveCount(7);

  await page.getByRole('checkbox', { name: 'Select all rows on this page' }).check();
  await page.getByRole('button', { name: 'Reassign or return selected' }).click();

  const dialog = page.getByRole('dialog', { name: 'Reassign or return applications' });
  await expect(dialog.getByText('6 applications selected.')).toBeVisible();
  await dialog.getByRole('radio', { name: 'Return to pool' }).check();
  await dialog.getByRole('textbox', { name: 'Justification' }).fill('Rebalancing the pool.');
  await dialog.getByRole('button', { name: 'Confirm' }).click();

  await expect(dialog.getByText('2 of 6 applications were updated.')).toBeVisible();
  await expect(dialog.getByText('These applications could not be changed:')).toBeVisible();
  await expect(dialog.getByRole('listitem')).toHaveCount(4);
});

test('the supervisor approves a reinstatement request with a note (US-2.5.1, US-2.5.2)', async ({ page }) => {
  await signInAsStaff(page, 'supervisor', '/admission/supervisor/reinstatements');

  await expect(page.getByRole('heading', { level: 1, name: 'Reinstatement requests' })).toBeVisible();
  const queue = page.getByRole('table', { name: 'Reinstatement requests, oldest first' });
  await expect(queue.getByRole('row')).toHaveCount(3);
  await expectNoAccessibilityViolations(page);

  await queue.getByRole('link', { name: '20260004401' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Reinstatement request for 20260004401' })).toBeVisible();
  await expect(page.getByText('My family situation has been resolved')).toBeVisible();
  await expect(page.getByText('Personal reasons')).toBeVisible();
  await expectNoAccessibilityViolations(page);

  await page.getByRole('button', { name: 'Approve reinstatement' }).click();
  const dialog = page.getByRole('dialog', { name: 'Approve reinstatement' });
  await dialog.getByRole('button', { name: 'Approve' }).click();
  await expect(dialog.getByText('This field is required.')).toBeVisible();
  await dialog.getByRole('textbox', { name: 'Note' }).fill('Circumstances confirmed by phone.');
  await dialog.getByRole('button', { name: 'Approve' }).click();

  await expect(page.getByText('Reinstatement approved')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Decision' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Approve reinstatement' })).toHaveCount(0);
});

test('rejecting a reinstatement request needs a reason and a note (US-2.5.2)', async ({ page }) => {
  await signInAsStaff(page, 'supervisor', '/admission/supervisor/reinstatements');
  await page.getByRole('link', { name: '20260004457' }).click();

  await page.getByRole('button', { name: 'Reject reinstatement' }).click();
  const dialog = page.getByRole('dialog', { name: 'Reject reinstatement' });
  await dialog.getByRole('button', { name: 'Reject' }).click();
  await expect(dialog.getByText('Choose a reason.')).toBeVisible();

  await dialog.getByRole('combobox', { name: 'Reason for rejection' }).selectOption({ label: 'The admission cycle has closed' });
  await dialog.getByRole('textbox', { name: 'Note' }).fill('Requests after the cycle closes cannot be accepted.');
  await dialog.getByRole('button', { name: 'Reject' }).click();

  await expect(page.getByText('Reinstatement rejected')).toBeVisible();
  await expect(page.locator('dahc-tag').first()).toHaveText('Rejected');
});

test('the duplicate accounts report is read-only (US-1.1.1, PQ-20)', async ({ page }) => {
  await signInAsStaff(page, 'supervisor');
  await page.getByRole('link', { name: 'Duplicate accounts' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'Duplicate accounts' })).toBeVisible();
  const table = page.getByRole('table', { name: 'Duplicate accounts, newest first' });
  await expect(table.getByRole('row')).toHaveCount(3);
  await expect(table).toContainText('Emirates ID');
  await expect(page.getByText('This report is read-only.')).toBeVisible();
  await expectNoAccessibilityViolations(page);
});

test('the supervisor dashboard reflows at 320 pixels and passes axe in the dark theme', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('dahc.theme', 'dark'));
  await page.setViewportSize({ width: 320, height: 800 });
  await signInAsStaff(page, 'supervisor');

  await expect(page.getByRole('table', { name: 'Requests waiting for your decision' }).getByRole('row')).toHaveCount(6);
  await expectNoHorizontalScroll(page);
  await expectNoAccessibilityViolations(page);
});
