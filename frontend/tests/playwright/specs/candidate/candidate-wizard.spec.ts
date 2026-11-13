import { Page, expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { actionBar, jpeg, main, pdf, signInAs, stepHeading, upload } from '../../support/candidate';

async function next(page: Page, label: RegExp | string): Promise<void> {
  await actionBar(page).getByRole('button', { name: label }).click();
}

test('the program step explains what is missing before a draft is created', async ({ page }) => {
  await signInAs(page, 'newCandidate', '/candidate/applications/new');

  await expect(page.getByRole('heading', { level: 1, name: 'New application' })).toBeVisible();
  await next(page, 'Next: Application Information');
  await expect(main(page).getByRole('combobox', { name: 'Program' })).toHaveAccessibleDescription(/This field is required\./);

  await main(page).getByRole('combobox', { name: 'Program' }).selectOption({ label: 'Medical Residency' });
  const preference1 = main(page).locator('dahc-preference-card').nth(0);
  const preference2 = main(page).locator('dahc-preference-card').nth(1);
  await preference1.getByRole('combobox', { name: 'Specialty' }).selectOption({ label: 'Internal Medicine' });
  await preference2.getByRole('combobox', { name: 'Specialty' }).selectOption({ label: 'Internal Medicine' });
  await next(page, 'Next: Application Information');

  await expect(preference1.getByText('Select at least one training site for this specialty.')).toBeVisible();
  await expect(preference2.getByText('Choose a different specialty from your first preference.')).toBeVisible();
  await expect(page).toHaveURL(/\/candidate\/applications\/new$/);
  await expectNoAccessibilityViolations(page);
});

test('a new candidate completes a Medical Internship application, retries a failed payment and submits', async ({ page }) => {
  test.setTimeout(180_000);
  await signInAs(page, 'newCandidate', '/candidate/applications/new');

  // Step 1: program and preference.
  await main(page).getByRole('combobox', { name: 'Program' }).selectOption({ label: 'Medical Internship' });
  await main(page).getByRole('combobox', { name: 'Specialty' }).selectOption({ label: 'Medical Internship' });
  await main(page).getByRole('checkbox', { name: 'Rashid Hospital' }).check();
  await expect(main(page).locator('dahc-preference-card')).toHaveCount(1);
  await next(page, 'Next: Application Information');
  await expect(page.getByText('Your draft has been created')).toBeVisible();

  // Step 2: application information.
  await stepHeading(page, 'Application Information');
  await expect(page.getByText('STEP 2 OF 7')).toBeVisible();
  await main(page).getByRole('combobox', { name: 'Candidate Status' }).selectOption({ label: 'External Candidate' });
  await main(page).getByRole('group', { name: /external entity or your employer sponsor/ }).getByRole('radio', { name: 'No' }).check();
  await upload(page, 'CV', pdf('cv.pdf'));
  await upload(page, /Personal statement/, pdf('statement.pdf'));
  await main(page).getByRole('checkbox', { name: /have read and accept the terms and conditions/ }).check();
  await expectNoAccessibilityViolations(page);
  await next(page, 'Next: Identity');

  // Step 3: personal information (identity pre-filled from ICP).
  await stepHeading(page, 'Personal Information');
  await expect(main(page).getByText('Verified via ICP').first()).toBeVisible();
  await expect(main(page).getByRole('textbox', { name: 'English first name' })).not.toBeEditable();
  await expectNoAccessibilityViolations(page);
  await next(page, 'Next: Contact Information');
  await next(page, 'Next: Next of Kin Information');

  await main(page).getByRole('textbox', { name: 'First name' }).fill('Saeed');
  await main(page).getByRole('textbox', { name: 'Surname' }).fill('Al Mansoori');
  await main(page).getByRole('combobox', { name: 'Relationship to candidate' }).selectOption({ label: 'Parent' });
  await main(page).getByRole('textbox', { name: 'Primary telephone contact' }).fill('501234567');
  await main(page).getByRole('textbox', { name: 'Primary e-mail', exact: true }).fill('saeed@example.com');
  await main(page).getByRole('textbox', { name: 'Confirm primary e-mail' }).fill('saeed@example.org');
  await main(page).getByRole('textbox', { name: 'Area of residence' }).fill('Jumeirah, Dubai');
  await next(page, 'Next: Identification Attachments');
  await expect(page.getByRole('navigation', { name: 'Application steps' }).getByText('Needs attention', { exact: false }).first()).toBeAttached();

  await page.getByRole('navigation', { name: 'Application steps' }).getByRole('button', { name: /Next of Kin Information/ }).click();
  await expect(main(page).getByText('The e-mail addresses do not match.')).toBeVisible();
  await main(page).getByRole('textbox', { name: 'Confirm primary e-mail' }).fill('saeed@example.com');
  await next(page, 'Next: Identification Attachments');

  await upload(page, /Personal photo/, jpeg());
  await upload(page, /passport/i, pdf('passport.pdf'));
  await upload(page, /family book/i, pdf('family-book.pdf'));
  await upload(page, /Emirates ID/, pdf('emirates-id.pdf'));
  await next(page, 'Next: University Grades');

  // Step 4: university grades with the computed GPA score.
  await stepHeading(page, 'University Grades');
  await main(page).getByRole('combobox', { name: 'Country' }).selectOption({ label: 'United Arab Emirates' });
  await main(page).getByRole('combobox', { name: 'University', exact: true }).selectOption({ index: 1 });
  await main(page).getByRole('combobox', { name: 'Degree' }).selectOption({ label: 'MBBS' });
  await main(page).getByRole('combobox', { name: 'Graduation year' }).selectOption({ index: 2 });
  await main(page).getByRole('combobox', { name: 'Graduation month' }).selectOption({ index: 6 });
  await main(page).getByRole('group', { name: 'GPA Type' }).getByRole('radio', { name: 'Scale of 4' }).check();
  await main(page).getByRole('textbox', { name: 'GPA (scale of 4)' }).fill('3.00');
  await expect(main(page).getByRole('textbox', { name: 'GPA shortlisting score' })).toHaveValue('37.50 / 50');
  await upload(page, /graduation certificate/, pdf('graduation.pdf'));
  await upload(page, /academic transcript/, pdf('transcript.pdf'));
  await next(page, 'Next: English Proficiency');

  // Step 5: English proficiency.
  await stepHeading(page, 'English Proficiency');
  await main(page).getByRole('combobox', { name: 'Title of exam' }).selectOption({ label: 'Academic IELTS' });
  await main(page).getByRole('textbox', { name: 'Date taken' }).fill('02/11/2025');
  await main(page).getByRole('textbox', { name: 'Date taken' }).press('Tab');
  await main(page).getByRole('textbox', { name: 'Result' }).fill('7.5');
  await upload(page, /English proficiency exam certificate/, pdf('ielts.pdf'));
  await next(page, 'Next: Portfolio');

  // Step 6: portfolio, one-time submission with confirmation.
  await stepHeading(page, 'Portfolio');
  await expect(main(page).getByText('Check your answers carefully')).toBeVisible();
  const answers = main(page).getByRole('group', { name: 'Answer' });
  await expect(answers).toHaveCount(8);

  for (let index = 0; index < 8; index++) {
    await answers.nth(index).getByRole('radio', { name: 'No' }).check();
  }

  await actionBar(page).getByRole('button', { name: 'Submit portfolio' }).click();
  const portfolioDialog = page.getByRole('dialog', { name: 'Submit your portfolio?' });
  await expect(portfolioDialog.getByRole('row')).toHaveCount(9);
  await portfolioDialog.getByRole('button', { name: 'Confirm and submit' }).click();
  await expect(main(page).getByText('Portfolio submitted')).toBeVisible();
  await next(page, 'Next: Pay & Submit');

  // Step 7: pay and submit.
  await stepHeading(page, 'Pay & Submit');
  await expect(main(page).getByText('AED 230').first()).toBeVisible();
  await expect(main(page).getByText('Incomplete', { exact: true })).toHaveCount(0);
  await expectNoAccessibilityViolations(page);
  await actionBar(page).getByRole('button', { name: 'Pay & Submit' }).click();
  await page.getByRole('dialog', { name: 'Pay and submit your application?' }).getByRole('button', { name: 'Continue to payment' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'Payment gateway (mock)' })).toBeVisible();
  await page.getByRole('button', { name: 'Simulate a failed payment' }).click();
  await expect(main(page).getByText('Your payment was not completed')).toBeVisible();
  await main(page).getByRole('link', { name: /Try payment again/ }).or(main(page).getByRole('button', { name: /Try payment again/ })).first().click();

  await stepHeading(page, 'Pay & Submit');
  await actionBar(page).getByRole('button', { name: 'Pay & Submit' }).click();
  await page.getByRole('dialog', { name: 'Pay and submit your application?' }).getByRole('button', { name: 'Continue to payment' }).click();
  await page.getByRole('button', { name: 'Pay now' }).click();

  const success = page.getByRole('dialog', { name: 'Your application has been submitted' });
  await expect(success).toBeVisible();
  await expect(success).toContainText('Paid');
  await expect(success).toContainText('AED 230');
  await expectNoAccessibilityViolations(page);
  await success.getByRole('button', { name: 'Go to dashboard' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeVisible();
  await expect(main(page).getByText('Submitted', { exact: true }).first()).toBeVisible();
  await expect(main(page).getByRole('button', { name: 'Withdraw Application' })).toBeVisible();
});

test('a changed contact e-mail must be verified with a one-time code', async ({ page }) => {
  await signInAs(page, 'draft', '/candidate/applications/a-draft-0001/steps/personal-contact');

  await stepHeading(page, 'Personal Information');
  await expect(main(page).getByRole('textbox', { name: 'Registered e-mail' })).not.toBeEditable();
  await main(page).getByRole('textbox', { name: 'Contact e-mail' }).fill('aisha.k@example.org');
  await main(page).getByRole('button', { name: /Verify/ }).first().click();

  const dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox', { name: 'One-time code' }).fill('999999');
  await dialog.getByRole('button', { name: /Verify|Confirm/ }).last().click();
  await expect(dialog.getByText(/not correct/)).toBeVisible();
  await dialog.getByRole('textbox', { name: 'One-time code' }).fill('123456');
  await dialog.getByRole('button', { name: /Verify|Confirm/ }).last().click();
  await expect(dialog).toBeHidden();

  await actionBar(page).getByRole('button', { name: 'Save As Draft' }).click();
  await expect(page.getByText('Draft saved')).toBeVisible();
});

test('a submitted application opens read-only with every step reachable', async ({ page }) => {
  await signInAs(page, 'submitted', '/candidate/applications/a-sub-0001');

  await expect(page).toHaveURL(/\/steps\/program$/);
  await expect(main(page).getByText('This application has been submitted, so it is shown read-only.', { exact: false })).toBeVisible();
  await expect(actionBar(page).getByRole('button', { name: 'Save As Draft' })).toHaveCount(0);

  await page.getByRole('navigation', { name: 'Application steps' }).getByRole('button', { name: /University Grades/ }).click();
  await stepHeading(page, 'University Grades');
  await expect(main(page).getByRole('combobox', { name: 'Degree' })).toBeDisabled();
  await expectNoAccessibilityViolations(page);
});

test('wizard steps reflow at 320 pixels', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await signInAs(page, 'draft', '/candidate/applications/a-draft-0001/steps/application-information');

  for (const step of ['program', 'application-information', 'personal-identity', 'academic-information', 'portfolio', 'pay-and-submit']) {
    await page.goto(`/candidate/applications/a-draft-0001/steps/${step}`);
    await expect(page.getByRole('heading', { level: 2 }).first()).toBeVisible();
    await expectNoHorizontalScroll(page);
  }
});
