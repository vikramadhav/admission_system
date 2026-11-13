import { Locator, Page, expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { signInAsStaff } from '../../support/staff';

// Screening dashboard (US-4.1.1 to US-4.5.1) against the mock build. The seeded supervisor data has
// six screening-stage applications: three ready to announce, one announced, one ready to
// reannounce after an appeal and one screened out.

function table(page: Page): Locator {
  return page.getByRole('main').getByRole('table', { name: 'Screening-stage applications' });
}

function bodyRows(page: Page): Locator {
  return table(page).locator('tbody tr');
}

/** Text of one column for every body row, located by the header text. */
async function columnTexts(page: Page, header: string): Promise<string[]> {
  return table(page).evaluate((element, name) => {
    const headers = Array.from(element.querySelectorAll('thead th')).map(cell => cell.textContent?.trim() ?? '');
    const index = headers.findIndex(text => text.startsWith(name));

    return Array.from(element.querySelectorAll('tbody tr')).map(row => row.children[index]?.textContent?.trim() ?? '');
  }, header);
}

async function selectRow(page: Page, applicationNumber: string): Promise<void> {
  await bodyRows(page).filter({ hasText: applicationNumber }).getByRole('checkbox').check();
}

async function openScreening(page: Page): Promise<void> {
  await signInAsStaff(page, 'supervisor', '/admission/screening');
  await expect(page.getByRole('heading', { level: 1, name: 'Screening' })).toBeVisible();
  await expect(bodyRows(page)).toHaveCount(6);
}

/** Application number (D-19: cycle year plus a 7-digit counter) of a row. */
async function applicationNumberOf(row: Locator): Promise<string> {
  return /2026\d{7}/.exec((await row.textContent()) ?? '')?.[0] ?? '';
}

test('the supervisor sees screening-stage applications, highest shortlisting score first', async ({ page }) => {
  await openScreening(page);

  const scores = (await columnTexts(page, 'Shortlisting score')).map(text => Number.parseFloat(text));
  expect(scores.length).toBe(6);
  expect([...scores].sort((first, second) => second - first)).toEqual(scores);
  await expect(table(page).getByRole('columnheader', { name: 'Shortlisting score' })).toHaveAttribute('aria-sort', 'descending');
  // Weighted scores show as "X.XX / Y".
  expect((await columnTexts(page, 'GPA score'))[0]).toMatch(/^\d+\.\d{2} \/ \d+$/);

  await expect(page.getByRole('button', { name: 'Announce', exact: true })).toBeDisabled();
  await expect(page.getByText('Select one or more applications to announce, screen out or reannounce.')).toBeVisible();
});

test('filters narrow the list and clear the selection', async ({ page }) => {
  await openScreening(page);
  await bodyRows(page).first().getByRole('checkbox').check();
  await expect(page.getByText('1 application selected')).toBeVisible();

  await page.getByRole('combobox', { name: 'Announcement status' }).selectOption({ label: 'Ready to announce' });

  await expect(bodyRows(page)).toHaveCount(3);
  await expect(page.getByText('Select one or more applications to announce, screen out or reannounce.')).toBeVisible();
  await table(page).getByRole('checkbox', { name: 'Select all rows on this page' }).check();
  await expect(page.getByText('3 applications selected')).toBeVisible();

  await page.getByRole('combobox', { name: 'Appealed' }).selectOption({ label: 'Yes' });
  await expect(page.getByText('No applications match these filters.')).toBeVisible();
});

test('the supervisor uploads CASPER results and sees the summary and exceptions', async ({ page }) => {
  await openScreening(page);

  await page.getByRole('button', { name: 'Upload CASPER' }).click();
  const drawer = page.getByRole('dialog', { name: 'Upload CASPER results' });
  await expect(drawer.getByRole('button', { name: 'Upload and process' })).toBeDisabled();

  await drawer.locator('input[type="file"]').setInputFiles({
    name: 'casper-results.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    buffer: Buffer.from('PK mock workbook'),
  });
  await drawer.getByRole('button', { name: 'Upload and process' }).click();

  await expect(drawer.getByText('File processed')).toBeVisible();
  await expect(drawer.getByText('Upload version')).toBeVisible();
  const exceptions = drawer.getByRole('table', { name: 'Rows not applied' });
  await expect(exceptions.locator('tbody tr')).toHaveCount(2);
  await expect(exceptions).toContainText('20269999999');
  await expectNoAccessibilityViolations(page);

  await drawer.getByRole('button', { name: 'Done' }).click();
  await expect(drawer).toBeHidden();
  await expect(table(page)).toContainText('Absent');
});

test('the supervisor announces ready applications and blocked ones are reported', async ({ page }) => {
  await openScreening(page);
  const announced = await applicationNumberOf(bodyRows(page).filter({ hasText: /Announced/ }).filter({ hasNotText: 'Screened out' }).first());
  for (const row of await bodyRows(page).filter({ hasText: 'Ready to announce' }).all()) {
    await row.getByRole('checkbox').check();
  }
  await selectRow(page, announced);
  await expect(page.getByText('4 applications selected')).toBeVisible();

  await page.getByRole('button', { name: 'Announce', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Announce initial scores' });
  await expect(dialog).toContainText('Initial announcement');
  await expect(dialog.getByText('Not ready (will not be published)')).toBeVisible();
  await dialog.getByRole('button', { name: 'Announce', exact: true }).click();
  await expect(dialog.getByText('Confirm before you continue.')).toBeVisible();

  await dialog.getByRole('checkbox', { name: 'I confirm the ready applications should be announced now.' }).check();
  await dialog.getByRole('button', { name: 'Announce', exact: true }).click();

  await expect(dialog).toContainText('3 of 4 processed, 1 not processed.');
  await expect(dialog).toContainText(announced);
  await expect(page.getByText('Scores announced for 3 applications')).toBeVisible();
  await dialog.getByRole('button', { name: 'Done' }).click();
  await expect(bodyRows(page).filter({ hasText: 'Ready to announce' })).toHaveCount(0);
});

test('the supervisor screens out selected applications with one reason', async ({ page }) => {
  await openScreening(page);
  const first = await applicationNumberOf(bodyRows(page).filter({ hasText: 'Ready to announce' }).first());
  await selectRow(page, first);

  await page.getByRole('button', { name: 'Screen out', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Screen out applications' });
  await dialog.getByRole('checkbox', { name: /I confirm these applications should be screened out/ }).check();
  await dialog.getByRole('button', { name: 'Screen out', exact: true }).click();
  await expect(dialog.getByText('Choose the screen-out reason.')).toBeVisible();

  await dialog.getByRole('combobox', { name: 'Screen-out reason' }).selectOption({ label: 'Limited seats / competitive pool' });
  await dialog.getByRole('button', { name: 'Screen out', exact: true }).click();

  await expect(dialog).toContainText('1 of 1 processed, 0 not processed.');
  await dialog.getByRole('button', { name: 'Done' }).click();
  await expect(bodyRows(page).filter({ hasText: first })).toContainText('Limited seats / competitive pool');
});

test('the supervisor reannounces the appealed application', async ({ page }) => {
  await openScreening(page);
  await page.getByRole('combobox', { name: 'Appealed' }).selectOption({ label: 'Yes' });
  await expect(bodyRows(page)).toHaveCount(1);
  await bodyRows(page).first().getByRole('checkbox').check();

  await page.getByRole('button', { name: 'Reannounce', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Reannounce scores after appeal' });
  await expect(dialog).toContainText('Reannouncement');
  await dialog.getByRole('checkbox', { name: 'I confirm the updated scores should be reannounced now.' }).check();
  await dialog.getByRole('button', { name: 'Reannounce', exact: true }).click();

  await expect(dialog).toContainText('1 of 1 processed, 0 not processed.');
  await dialog.getByRole('button', { name: 'Done' }).click();
  await expect(bodyRows(page).first()).toContainText('Reannounced');
});

test('an admission officer cannot open the screening dashboard', async ({ page }) => {
  await signInAsStaff(page, 'officer', '/admission/screening');

  await expect(page.getByRole('heading', { level: 1, name: 'You cannot open this page' })).toBeVisible();
});

test('the screening dashboard passes axe in light and dark themes and reflows at 320 pixels', async ({ page }) => {
  // Dialogs fade in; check them once settled.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openScreening(page);
  await expectNoAccessibilityViolations(page);

  await bodyRows(page).first().getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Announce', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Announce initial scores' }).getByRole('checkbox')).toBeVisible();
  await expectNoAccessibilityViolations(page);
  await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();

  await page.addInitScript(() => localStorage.setItem('dahc.theme', 'dark'));
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/admission/screening');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(bodyRows(page)).toHaveCount(6);
  await expectNoHorizontalScroll(page);
  await expectNoAccessibilityViolations(page);
});
