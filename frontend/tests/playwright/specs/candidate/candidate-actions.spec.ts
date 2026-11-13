import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations } from '../../support/accessibility';
import { dashboardReady, main, signInAs } from '../../support/candidate';

test('discarding a draft archives it and allows a new application', async ({ page }) => {
  await signInAs(page, 'draft');
  await dashboardReady(page);

  await main(page).getByRole('button', { name: 'Discard Draft' }).click();
  const dialog = page.getByRole('dialog', { name: 'Discard this draft?' });
  await expect(dialog).toBeVisible();
  await expectNoAccessibilityViolations(page);
  await dialog.getByRole('button', { name: 'Discard draft' }).click();

  await expect(page.getByText('Your draft was discarded.')).toBeVisible();
  await expect(main(page).getByText('Archived', { exact: true })).toBeVisible();
  await expect(main(page).getByRole('link', { name: 'Start New Application' }).first()).toBeVisible();
});

test('withdrawing asks for a reason and a one-time code, rejecting a wrong code', async ({ page }) => {
  await signInAs(page, 'submitted');
  await dashboardReady(page);

  await main(page).getByRole('button', { name: 'Withdraw Application' }).click();
  const dialog = page.getByRole('dialog', { name: 'Withdraw application' });
  await expect(dialog.getByText('non-refundable', { exact: false })).toBeVisible();
  await dialog.getByRole('combobox', { name: 'Reason for withdrawal' }).selectOption({ label: 'Others' });
  await dialog.getByRole('textbox', { name: 'Other reason' }).fill('NA');
  await dialog.getByRole('button', { name: 'Send code' }).click();
  await expect(dialog.getByText('Describe the reason in at least 3 letters.')).toBeVisible();

  await dialog.getByRole('textbox', { name: 'Other reason' }).fill('Accepted an offer abroad');
  await dialog.getByRole('button', { name: 'Send code' }).click();
  await expect(dialog.getByText('We sent a code to', { exact: false })).toBeVisible();
  await expectNoAccessibilityViolations(page);

  await dialog.getByRole('textbox', { name: 'One-time code' }).fill('000000');
  await dialog.getByRole('button', { name: 'Withdraw application' }).click();
  await expect(dialog.getByText('The code is not correct. Check it and try again.')).toBeVisible();

  await dialog.getByRole('textbox', { name: 'One-time code' }).fill('123456');
  await dialog.getByRole('button', { name: 'Withdraw application' }).click();

  await expect(page.getByText('Your application was withdrawn.')).toBeVisible();
  await expect(main(page).getByText('Withdrawn', { exact: true })).toBeVisible();
  await expect(main(page).getByRole('button', { name: 'Request Reinstatement' })).toBeVisible();
});

test('a withdrawn candidate can request reinstatement once', async ({ page }) => {
  await signInAs(page, 'withdrawn');
  await dashboardReady(page);

  await main(page).getByRole('button', { name: 'Request Reinstatement' }).click();
  const dialog = page.getByRole('dialog', { name: 'Request reinstatement' });
  await dialog.getByRole('button', { name: 'Send request' }).click();
  await expect(dialog.getByText('This field is required.')).toBeVisible();
  await dialog.getByRole('textbox', { name: 'Justification' }).fill('My personal circumstances have changed and I can now join the program.');
  await dialog.getByRole('button', { name: 'Send request' }).click();

  await expect(dialog).toBeHidden();
  await expect(main(page).getByRole('button', { name: 'Request Reinstatement' })).toHaveCount(0);
});

test('a submitted candidate can reorder training sites in the edit preferences panel', async ({ page }) => {
  await signInAs(page, 'submitted');
  await dashboardReady(page);

  await main(page).getByRole('button', { name: 'Edit Preferences' }).click();
  const drawer = page.getByRole('dialog', { name: 'Edit preferences' });
  await expect(drawer.getByRole('button', { name: 'Move Latifa Hospital up' }).first()).toBeVisible();
  await drawer.getByRole('button', { name: 'Move Latifa Hospital up' }).first().click();
  await drawer.getByRole('button', { name: 'Save preferences' }).click();

  await expect(page.getByText('Your preferences were saved.')).toBeVisible();
  await expect(main(page).getByRole('list').filter({ hasText: 'Latifa Hospital' }).first().getByRole('listitem').first()).toHaveText(
    'Latifa Hospital',
  );
});

test('excluding a training site keeps at least one site per specialty', async ({ page }) => {
  await signInAs(page, 'announced');
  await dashboardReady(page);

  await main(page).getByRole('button', { name: 'Exclude Training Site' }).click();
  const dialog = page.getByRole('dialog', { name: 'Exclude training sites' });
  await dialog.getByRole('checkbox', { name: 'Rashid Hospital' }).check();
  await dialog.getByRole('textbox', { name: 'Reason' }).fill('I have moved to Dubai Marina.');
  await expectNoAccessibilityViolations(page);
  await dialog.getByRole('button', { name: 'Exclude sites' }).click();

  await expect(page.getByText('The training sites were excluded.')).toBeVisible();
});

test('a candidate can appeal a portfolio question once inside the window', async ({ page }) => {
  await signInAs(page, 'announced', '/candidate/applications/a-fel-0001/portfolio-result');

  await expect(page.getByRole('heading', { level: 1, name: 'Portfolio result' })).toBeVisible();
  await expect(main(page).getByText('The certificate does not show the stamp and signature of the institution.')).toBeVisible();
  await main(page).getByRole('checkbox', { name: 'Appeal this question' }).first().check();
  await main(page)
    .getByRole('textbox', { name: 'Why should this question be evaluated again?' })
    .fill('The stamped certificate is on page 2 of the uploaded file.');
  await expectNoAccessibilityViolations(page);
  await main(page).getByRole('button', { name: 'Review and submit appeal' }).click();
  await page.getByRole('dialog', { name: 'Submit your appeal?' }).getByRole('button', { name: 'Submit appeal' }).click();

  await expect(main(page).getByText('Your appeal was submitted')).toBeVisible();
});
