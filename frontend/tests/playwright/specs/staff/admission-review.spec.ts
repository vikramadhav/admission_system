import { Page, expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { pdf } from '../../support/candidate';
import { signInAsStaff } from '../../support/staff';

/**
 * Application review (US-2.3.1 to US-2.5.3) against the mock build. Seeded applications
 * (mock/mock-admission-seed.ts): rv-0008 and rv-0009 In progress with the officer, rv-0011
 * Clarification submitted, rv-0014 Pending clarification, rv-0015 Screen out pending approval,
 * rv-0017 assigned to another officer, rv-0025 Screened out.
 */

const review = (id: string): string => `/admission/applications/${id}`;

async function openAsOfficer(page: Page, id: string): Promise<void> {
  await signInAsStaff(page, 'officer', review(id));
  await expect(page.getByRole('heading', { level: 1, name: /^Application \d{11}$/ })).toBeVisible();
}

async function openAsSupervisor(page: Page, id: string): Promise<void> {
  await signInAsStaff(page, 'supervisor', review(id));
  await expect(page.getByRole('heading', { level: 1, name: /^Application \d{11}$/ })).toBeVisible();
}

test('the officer sees the summary, ICP-sourced fields and attachments, without training sites', async ({ page }) => {
  await openAsOfficer(page, 'rv-0009');

  const summary = page.getByRole('main');
  await expect(summary.getByText('Medical Residency').first()).toBeVisible();
  await expect(summary.getByText('In progress').first()).toBeVisible();
  await expect(summary.getByText('From ICP').first()).toBeVisible();
  await expect(summary.getByText(/training site/i)).toHaveCount(0);

  await expect(page.getByRole('button', { name: 'View Passport copy' })).toBeVisible();
});

test('the officer flags a field, saves the flags and returns the application for correction', async ({ page }) => {
  await openAsOfficer(page, 'rv-0008');

  // Return for correction needs a saved flag (US-2.3.3).
  await expect(page.getByRole('button', { name: 'Return for correction' })).toHaveCount(0);

  await page.getByRole('button', { name: 'Flag Graduation year' }).click();
  const dialog = page.getByRole('dialog', { name: 'Flag for correction' });
  await dialog.getByRole('button', { name: 'Keep flag' }).click();
  await expect(dialog.getByText('This field is required.').first()).toBeVisible();
  await dialog.getByLabel('Note template').selectOption({ label: 'Information does not match the document' });
  await dialog.getByLabel('Note to the candidate').fill('The graduation year does not match your certificate.');
  await dialog.getByRole('button', { name: 'Keep flag' }).click();

  await expect(page.getByRole('main').getByText('Flagged').first()).toBeVisible();
  await page.getByRole('button', { name: 'Save flags' }).click();
  await expect(page.getByText('Flags saved.')).toBeVisible();

  await page.getByRole('button', { name: 'Return for correction' }).click();
  const returnDialog = page.getByRole('dialog', { name: 'Return for correction' });
  await expect(returnDialog.getByText('can correct only the flagged item')).toBeVisible();
  await returnDialog.getByRole('button', { name: 'Return to candidate' }).click();

  await expect(page).toHaveURL('/admission/officer');
  await expect(page.getByText('The application was returned to the candidate for correction.')).toBeVisible();
});

test('the officer can edit and remove a flag before saving', async ({ page }) => {
  await openAsOfficer(page, 'rv-0008');

  await page.getByRole('button', { name: 'Flag Degree' }).click();
  let dialog = page.getByRole('dialog', { name: 'Flag for correction' });
  await dialog.getByLabel('Note template').selectOption({ label: 'Other' });
  await dialog.getByLabel('Note to the candidate').fill('Please check the degree.');
  await dialog.getByRole('button', { name: 'Keep flag' }).click();
  await expect(page.getByText('You have unsaved flags', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Flag Degree' }).click();
  dialog = page.getByRole('dialog', { name: 'Flag for correction' });
  await expect(dialog.getByLabel('Note to the candidate')).toHaveValue('Please check the degree.');
  await dialog.getByRole('button', { name: 'Remove flag' }).click();

  await expect(page.getByText('You have unsaved flags', { exact: true })).toHaveCount(0);
});

test('the officer completes verification', async ({ page }) => {
  await openAsOfficer(page, 'rv-0009');

  await page.getByRole('button', { name: 'Complete verification' }).click();
  await page.getByRole('dialog', { name: 'Complete verification?' }).getByRole('button', { name: 'Complete verification' }).click();

  await expect(page).toHaveURL('/admission/officer');
  await expect(page.getByText('Verification completed.')).toBeVisible();
});

test('the officer recommends a screen-out with a reason', async ({ page }) => {
  await openAsOfficer(page, 'rv-0008');

  await page.getByRole('button', { name: 'Recommend screen out' }).click();
  const dialog = page.getByRole('dialog', { name: 'Recommend screen out' });
  await dialog.getByRole('button', { name: 'Send recommendation' }).click();
  await expect(dialog.getByText('This field is required.')).toBeVisible();
  await dialog.getByLabel('Screen-out reason').selectOption({ label: 'Incomplete application' });
  await dialog.getByRole('button', { name: 'Send recommendation' }).click();

  await expect(page).toHaveURL('/admission/officer');
  await expect(page.getByText('Your screen-out recommendation was sent to the supervisor.')).toBeVisible();
});

test('the officer escalates for clarification with a note', async ({ page }) => {
  await openAsOfficer(page, 'rv-0008');

  await page.getByRole('button', { name: 'Escalate for clarification' }).click();
  const dialog = page.getByRole('dialog', { name: 'Escalate for clarification' });
  await dialog.getByLabel('Question for the supervisor').fill('Is the internship certificate from an accredited hospital?');
  await dialog.getByRole('button', { name: 'Escalate' }).click();

  await expect(page).toHaveURL('/admission/officer');
  await expect(page.getByText('The application was escalated to the supervisor.')).toBeVisible();
});

test('the officer replaces an attachment with a justification', async ({ page }) => {
  await openAsOfficer(page, 'rv-0008');

  await page.getByRole('button', { name: 'Replace Passport copy' }).click();
  const dialog = page.getByRole('dialog', { name: 'Replace attachment' });
  await dialog.getByRole('button', { name: 'Replace file' }).click();
  await expect(dialog.getByText('Choose the new file.')).toBeVisible();
  await dialog.getByLabel('Justification').fill('The candidate e-mailed a clearer passport scan.');
  await dialog.locator('input[type="file"]').setInputFiles(pdf('passport-clear.pdf'));
  await dialog.getByRole('button', { name: 'Replace file' }).click();

  await expect(page.getByText('The attachment was replaced. The earlier version is kept for audit.')).toBeVisible();
  await expect(page.getByRole('main').getByText(/passport-clear\.pdf · Version 2/)).toBeVisible();
  await expect(page.getByText('1 earlier version kept')).toBeVisible();
});

test('after supervisor guidance the officer sees the feedback and can complete verification', async ({ page }) => {
  await openAsOfficer(page, 'rv-0011');

  const banner = page.getByRole('main').getByText('Accept the transcript date; the certificate shows the ceremony date.').first();
  await expect(page.getByText('Supervisor feedback', { exact: true })).toBeVisible();
  await expect(banner).toBeVisible();

  await page.getByRole('button', { name: 'Complete verification' }).click();
  await page.getByRole('dialog', { name: 'Complete verification?' }).getByRole('button', { name: 'Complete verification' }).click();
  await expect(page).toHaveURL('/admission/officer');
});

test('an officer cannot open an application assigned to someone else', async ({ page }) => {
  await signInAsStaff(page, 'officer', review('rv-0017'));

  await expect(page.getByText('The application cannot be shown', { exact: true })).toBeVisible();
  await expect(page.getByRole('main').getByText('The application was not found.').first()).toBeVisible();
});

test('the supervisor endorses a recommended screen-out', async ({ page }) => {
  await openAsSupervisor(page, 'rv-0015');

  await expect(page.getByText('Screen-out recommended', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Decide on screen out' }).click();
  const dialog = page.getByRole('dialog', { name: 'Screen-out decision' });
  await expect(dialog.getByText('IELTS overall 5.5, below the 6.0 minimum.')).toBeVisible();
  await dialog.getByRole('radio', { name: 'Endorse screen out' }).check();
  await dialog.getByRole('button', { name: 'Confirm decision' }).click();

  await expect(page).toHaveURL('/admission/supervisor');
  await expect(page.getByText('The screen-out was endorsed and the candidate has been informed.')).toBeVisible();
});

test('rejecting a screen-out needs a note', async ({ page }) => {
  await openAsSupervisor(page, 'rv-0015');

  await page.getByRole('button', { name: 'Decide on screen out' }).click();
  const dialog = page.getByRole('dialog', { name: 'Screen-out decision' });
  await dialog.getByRole('radio', { name: 'Reject screen out' }).check();
  await dialog.getByRole('button', { name: 'Confirm decision' }).click();
  await expect(dialog.getByText('Enter a note explaining why you reject the screen-out.')).toBeVisible();

  await dialog.getByLabel('Note to the officer').fill('The certificate was valid on the submission date.');
  await dialog.getByRole('button', { name: 'Confirm decision' }).click();
  await expect(page).toHaveURL('/admission/supervisor');
  await expect(page.getByText('The screen-out was rejected and the application went back to the officer.')).toBeVisible();
});

test('the supervisor returns an escalated application with guidance', async ({ page }) => {
  await openAsSupervisor(page, 'rv-0014');

  await expect(page.getByText('The officer asks for clarification', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Return with guidance' }).click();
  const dialog = page.getByRole('dialog', { name: 'Return with guidance' });
  await dialog.getByLabel('Guidance for the officer').fill('Use the transcript date.');
  await dialog.getByRole('button', { name: 'Return to officer' }).click();

  await expect(page).toHaveURL('/admission/supervisor');
  await expect(page.getByText('Your guidance was sent to the officer.')).toBeVisible();
});

test('the supervisor directly reinstates a screened-out application', async ({ page }) => {
  await openAsSupervisor(page, 'rv-0025');

  await page.getByRole('button', { name: 'Reinstate application' }).click();
  const dialog = page.getByRole('dialog', { name: 'Reinstate application' });
  await dialog.getByLabel('Justification').fill('The missing document was received before the deadline.');
  await dialog.getByRole('button', { name: 'Reinstate' }).click();

  await expect(page).toHaveURL('/admission/supervisor');
  await expect(page.getByText('The application was reinstated.')).toBeVisible();
});

test('the supervisor refreshes ICP data field by field', async ({ page }) => {
  await openAsSupervisor(page, 'rv-0008');

  // Officer actions are not offered to the supervisor.
  await expect(page.getByRole('button', { name: 'Complete verification' })).toHaveCount(0);

  await page.getByRole('button', { name: 'Refresh ICP data' }).click();
  const dialog = page.getByRole('dialog', { name: 'Refresh ICP data' });
  await dialog.getByRole('radio', { name: "The candidate's details changed" }).check();
  await dialog.getByRole('button', { name: 'Compare with ICP' }).click();

  await expect(dialog.getByRole('table', { name: 'Stored values compared with ICP' })).toBeVisible();
  await expect(dialog.getByRole('checkbox', { name: 'Update Nationality' })).toBeDisabled();
  await expect(dialog.getByRole('button', { name: 'Apply changes' })).toBeDisabled();
  await dialog.getByRole('checkbox', { name: 'Update Last name (English)' }).check();
  await dialog.getByRole('button', { name: 'Apply changes' }).click();
  await expect(dialog.getByText('Update 1 field with the ICP value?')).toBeVisible();
  await dialog.getByRole('button', { name: 'Confirm update' }).click();

  await expect(page.getByText('The selected fields were updated from ICP.')).toBeVisible();
});

test('the review page passes axe in light and dark themes and reflows at 320 pixels', async ({ page }) => {
  await openAsOfficer(page, 'rv-0008');
  await expectNoAccessibilityViolations(page);

  await page.getByRole('button', { name: 'Escalate for clarification' }).click();
  await expect(page.getByRole('dialog', { name: 'Escalate for clarification' })).toBeVisible();
  // Let the dialog's opening transition finish so axe reads the final colours.
  await page.waitForFunction(() => document.getAnimations().every(animation => animation.playState !== 'running'));
  await expectNoAccessibilityViolations(page);
  await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();

  await page.addInitScript(() => localStorage.setItem('dahc.theme', 'dark'));
  await page.setViewportSize({ width: 320, height: 800 });
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('heading', { level: 1, name: /^Application \d{11}$/ })).toBeVisible();
  await expectNoHorizontalScroll(page);
  await expectNoAccessibilityViolations(page);

  await expectNoHorizontalScroll(page);
  await expectNoAccessibilityViolations(page);
});
