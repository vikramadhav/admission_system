import { Page, expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { main, pdf, signInAs } from '../../support/candidate';

/** US-2.3.4: the candidate corrects the items an officer flagged and re-submits them. */

async function openCorrections(page: Page): Promise<void> {
  await signInAs(page, 'correction');
  await main(page).getByRole('link', { name: 'Correct your application' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Correct your application' })).toBeVisible();
  await expect(main(page).getByRole('heading', { level: 2, name: 'University Grades' })).toBeVisible();
}

test('the dashboard links a returned application to its corrections', async ({ page }) => {
  await signInAs(page, 'correction');

  await expect(main(page).getByText('Correction required').first()).toBeVisible();
  await main(page).getByRole('link', { name: 'Correct your application' }).click();

  await expect(page).toHaveURL(/\/candidate\/applications\/a-cor-0001\/corrections$/);
  await expect(main(page).getByText(/Re-submit by/)).toBeVisible();
});

test('the flagged items are listed with the officer’s notes', async ({ page }) => {
  await openCorrections(page);

  const academic = main(page).getByRole('region', { name: 'University Grades' });
  await expect(academic.getByText('Graduation year:')).toBeVisible();
  await expect(academic.getByText('The graduation year does not match your graduation certificate.', { exact: false })).toBeVisible();
  await expect(academic.getByText('Coloured copy of graduation certificate or letter of completion:')).toBeVisible();

  const english = main(page).getByRole('region', { name: 'English Proficiency' });
  await expect(english.getByText('Result:')).toBeVisible();
  await expect(english.getByText('Enter the overall band score exactly as it appears on your IELTS certificate.')).toBeVisible();

  // Only sections with flags are shown.
  await expect(main(page).getByRole('region', { name: 'Internship Information' })).toHaveCount(0);
});

test('only the flagged fields and documents can be changed', async ({ page }) => {
  await openCorrections(page);

  const english = main(page).getByRole('region', { name: 'English Proficiency' });
  await expect(english.getByRole('textbox', { name: 'Result' })).toBeEnabled();
  await expect(english.getByRole('textbox', { name: 'Date taken' })).toBeDisabled();

  const academic = main(page).getByRole('region', { name: 'University Grades' });
  await expect(academic.getByRole('textbox', { name: 'GPA (scale of 4)' })).toBeDisabled();
  await expect(academic.getByRole('group', { name: /graduation certificate/ }).locator('input[type="file"]')).toBeEnabled();
  await expect(academic.getByRole('group', { name: /official academic transcript/ }).locator('input[type="file"]')).toBeDisabled();
});

test('re-submitting is blocked while a flagged field is invalid', async ({ page }) => {
  await openCorrections(page);

  const english = main(page).getByRole('region', { name: 'English Proficiency' });
  await english.getByRole('textbox', { name: 'Result' }).fill('');
  await main(page).getByRole('button', { name: 'Re-submit corrections' }).click();

  await expect(main(page).getByText('Some corrections still need attention')).toBeVisible();
  await expect(main(page).locator('.corrections-summary')).toContainText('English Proficiency');
  await expect(main(page).locator('.corrections-summary')).toBeFocused();
  await expect(page.getByRole('dialog', { name: 'Re-submit your corrections?' })).toHaveCount(0);
});

test('re-submitted corrections go back to the officer', async ({ page }) => {
  await openCorrections(page);

  const academic = main(page).getByRole('region', { name: 'University Grades' });
  const certificate = academic.getByRole('group', { name: /graduation certificate/ });
  await certificate.locator('input[type="file"]').setInputFiles(pdf('Graduation_certificate_full.pdf'));
  await expect(certificate.getByText('Graduation_certificate_full.pdf').first()).toBeVisible();

  const english = main(page).getByRole('region', { name: 'English Proficiency' });
  await english.getByRole('textbox', { name: 'Result' }).fill('7.0');

  await main(page).getByRole('button', { name: 'Re-submit corrections' }).click();
  const dialog = page.getByRole('dialog', { name: 'Re-submit your corrections?' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Re-submit' }).click();

  await expect(page).toHaveURL('/candidate/dashboard');
  await expect(page.getByText('Your corrections were submitted')).toBeVisible();
  await expect(main(page).getByText('Correction submitted').first()).toBeVisible();
  await expect(main(page).getByRole('link', { name: 'Correct your application' })).toHaveCount(0);

  // Nothing is left to correct.
  await page.goto('/candidate/applications/a-cor-0001/corrections');
  await expect(main(page).getByRole('heading', { level: 2, name: 'There is nothing to correct' })).toBeVisible();
});

test('the corrections page passes axe in both themes and reflows at 320 pixels', async ({ page }) => {
  await openCorrections(page);
  await expectNoAccessibilityViolations(page);

  await page.addInitScript(() => localStorage.setItem('dahc.theme', 'dark'));
  await page.setViewportSize({ width: 320, height: 800 });
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(main(page).getByRole('heading', { level: 2, name: 'University Grades' })).toBeVisible();
  await expectNoHorizontalScroll(page);
  await expectNoAccessibilityViolations(page);
});

test('leaving with unsent corrections asks first, and staying keeps the changes (PQ-35)', async ({ page }) => {
  await openCorrections(page);

  const english = main(page).getByRole('region', { name: 'English Proficiency' });
  await english.getByRole('textbox', { name: 'Result' }).fill('7.0');
  await page.getByRole('banner').getByRole('link', { name: 'Home' }).click();

  const dialog = page.getByRole('dialog', { name: 'Leave without sending your corrections?' });
  await expect(dialog).toBeVisible();
  await expectNoAccessibilityViolations(page);
  await dialog.getByRole('button', { name: 'Stay on this page' }).click();

  await expect(page).toHaveURL(/\/corrections$/);
  await expect(english.getByRole('textbox', { name: 'Result' })).toHaveValue('7.0');

  await page.getByRole('banner').getByRole('link', { name: 'Home' }).click();
  await page.getByRole('dialog', { name: 'Leave without sending your corrections?' }).getByRole('button', { name: 'Leave without sending' }).click();
  await expect(page).toHaveURL(/\/candidate\/dashboard$/);
});

test('board entries cannot be added or removed in an unflagged board section (PQ-35)', async ({ page }) => {
  await openCorrections(page);

  await expect(main(page).getByRole('button', { name: 'Add another board' })).toHaveCount(0);
});
