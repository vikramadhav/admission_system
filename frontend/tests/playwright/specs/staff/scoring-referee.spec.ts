import { Locator, Page, expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { signInAsStaff } from '../../support/staff';

// Seeded portfolios (mock/mock-scoring.ts): application numbers are 2026 + (5000 + index * 41).
const ROUND_1 = { id: 'pf-0004', number: '20260005164' };
const OVERDUE_ROUND_1 = { id: 'pf-0006', number: '20260005246' };
const ROUND_3 = { id: 'pf-0010', number: '20260005410' };
const SECOND_EVALUATION = { id: 'pf-0012', number: '20260005492' };

function question(page: Page, number: number): Locator {
  return page.getByRole('region', { name: new RegExp(`^Question ${number} –`) });
}

async function decide(page: Page, number: number, decision: 'Accept' | 'Reject'): Promise<void> {
  await question(page, number)
    .getByRole('group', { name: new RegExp(`^Decision for question ${number}\\b`) })
    .getByRole('radio', { name: decision })
    .check();
}

async function chooseReason(page: Page, number: number, reason: string): Promise<void> {
  const region = question(page, number);
  await region.getByRole('combobox', { name: /Rejection reasons/ }).first().click();
  await region.getByRole('option', { name: reason }).click();
  await page.keyboard.press('Escape');
}

async function openPortfolio(page: Page, id: string): Promise<void> {
  await page.goto(`/scoring/referee/portfolios/${id}`);
  await expect(page.getByRole('heading', { level: 1, name: /^Score portfolio/ })).toBeVisible();
  await expect(question(page, 1)).toBeVisible();
}

/** Scores every question of a residency Round 1 / 2 portfolio (Q3 and Q8 use the points system). */
async function scoreAll(page: Page): Promise<void> {
  for (let number = 1; number <= 10; number++) {
    if (number === 4) {
      await decide(page, number, 'Reject');
      await chooseReason(page, number, 'Evidence missing or unreadable');
    } else {
      await decide(page, number, 'Accept');
    }
  }

  await question(page, 3).getByRole('combobox', { name: /Classification/ }).selectOption({ label: 'Oral presentation (4 points)' });
  await question(page, 8).getByRole('combobox', { name: /Classification/ }).selectOption({ index: 1 });
}

test('the referee dashboard shows the queue, pools and inbox without any candidate identity', async ({ page }) => {
  await signInAsStaff(page, 'referee');

  await expect(page).toHaveURL('/scoring/referee');
  await expect(page.getByRole('heading', { level: 1, name: 'My portfolios' })).toBeVisible();
  const main = page.getByRole('main');
  await expect(main.getByText('Pending my action')).toBeVisible();
  const table = main.getByRole('table', { name: 'Portfolios assigned to you' });
  await expect(table.getByRole('link', { name: ROUND_1.number })).toBeVisible();
  await expect(table.getByRole('columnheader')).not.toContainText(['Candidate']);
  await expect(main).not.toContainText(/candidate name/i);
  await expect(table.getByRole('row', { name: new RegExp(OVERDUE_ROUND_1.number) }).getByText('Overdue')).toBeVisible();
  await expectNoAccessibilityViolations(page);
});

test('a referee retrieves portfolios from the pool', async ({ page }) => {
  await signInAsStaff(page, 'referee');

  await page.getByRole('button', { name: /Retrieve portfolios/ }).click();

  // Every eligible portfolio up to the cap of 10: the pool also offers Round 2 of portfolios another referee holds in Round 1.
  await expect(page.getByText(/^\d+ portfolios added to your inbox$/)).toBeVisible();
  await expect(page.getByRole('table', { name: 'Portfolios assigned to you' }).getByRole('link', { name: '20260005041' })).toBeVisible();
});

test('a referee scores questions, saves a draft and finds it again after a reload', async ({ page }) => {
  await signInAsStaff(page, 'referee');
  await openPortfolio(page, ROUND_1.id);

  const info = page.getByRole('main');
  await expect(info).toContainText(ROUND_1.number);
  await expect(info).toContainText('Round 1');

  // US-3.3.3: accepting Q1 accepts Q2 by default.
  await decide(page, 1, 'Accept');
  await expect(question(page, 2).getByRole('radio', { name: 'Accept' })).toBeChecked();

  await decide(page, 3, 'Accept');
  await question(page, 3).getByRole('combobox', { name: /Classification/ }).selectOption({ label: 'Oral presentation (4 points)' });
  await decide(page, 4, 'Reject');
  await chooseReason(page, 4, 'Evidence missing or unreadable');
  await expect(question(page, 4)).toContainText('The evidence for this item was missing or could not be read.');
  await expect(page.getByText(/Total: 14 out of 44/)).toBeVisible();

  await page.getByRole('button', { name: 'Save draft' }).click();
  await expect(page.getByText('Draft saved.')).toBeVisible();
  await expect(page.getByText('Total: 14 out of 44', { exact: false })).toBeVisible();

  await page.reload();
  await expect(question(page, 3).getByRole('combobox', { name: /Classification/ })).toHaveValue('Q3-ORAL');
  await expect(question(page, 4).getByRole('radio', { name: 'Reject' })).toBeChecked();
  await expect(question(page, 1).getByRole('radio', { name: 'Accept' })).toBeChecked();
});

test('submitting is blocked until every question is scored, then completes the round', async ({ page }) => {
  await signInAsStaff(page, 'referee');
  await openPortfolio(page, ROUND_1.id);

  await decide(page, 1, 'Accept');
  await page.getByRole('button', { name: 'Submit', exact: true }).click();

  const summary = page.locator('#scoring-summary');
  await expect(summary).toBeFocused();
  await expect(summary).toContainText('Score every question before you submit');
  await expect(summary).toContainText('Question 3: choose Accept or Reject.');
  await expect(page.getByRole('button', { name: /^Question 5 – needs your decision/ })).toBeVisible();

  await scoreAll(page);
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Submit scores' });
  await expect(dialog).toContainText('Your unsaved changes are saved first.');
  await dialog.getByRole('button', { name: 'Submit scores' }).click();

  const done = page.getByRole('dialog', { name: 'Scores submitted' });
  await expect(done).toContainText('Your round is complete.');
  await done.getByRole('button', { name: 'Back to my portfolios' }).click();

  await expect(page).toHaveURL('/scoring/referee');
  await expect(page.getByText('Your scores were submitted.')).toBeVisible();
  await expect(page.getByRole('table', { name: 'Portfolios assigned to you' }).getByRole('link', { name: ROUND_1.number })).toHaveCount(0);
});

test('leaving the scoring page with unsaved changes asks first', async ({ page }) => {
  await signInAsStaff(page, 'referee');
  await openPortfolio(page, ROUND_1.id);
  await decide(page, 5, 'Accept');

  await page.getByRole('navigation', { name: /Breadcrumb/ }).getByRole('link', { name: 'My portfolios' }).click();
  const dialog = page.getByRole('dialog', { name: 'Leave without saving?' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Stay on this page' }).click();
  await expect(page).toHaveURL(`/scoring/referee/portfolios/${ROUND_1.id}`);
  await expect(question(page, 5).getByRole('radio', { name: 'Accept' })).toBeChecked();

  await page.getByRole('navigation', { name: /Breadcrumb/ }).getByRole('link', { name: 'My portfolios' }).click();
  await page.getByRole('dialog', { name: 'Leave without saving?' }).getByRole('button', { name: 'Leave without saving' }).click();
  await expect(page).toHaveURL('/scoring/referee');
});

test('a referee returns a portfolio for conflict of interest', async ({ page }) => {
  await signInAsStaff(page, 'referee');
  await openPortfolio(page, OVERDUE_ROUND_1.id);

  await page.getByRole('button', { name: 'Return for conflict of interest' }).click();
  const dialog = page.getByRole('dialog', { name: 'Return for conflict of interest' });
  await expect(dialog).toContainText('cannot be assigned to it again');
  await dialog.getByRole('button', { name: 'Return portfolio' }).click();
  await expect(dialog).toContainText('Enter the reason for the conflict of interest.');

  await dialog.getByRole('textbox', { name: /Reason/ }).fill('The evidence shows a candidate I supervised during their internship.');
  await dialog.getByRole('button', { name: 'Return portfolio' }).click();

  await expect(page).toHaveURL('/scoring/referee');
  await expect(page.getByText('The portfolio was returned for conflict of interest.')).toBeVisible();
  await expect(page.getByRole('table', { name: 'Portfolios assigned to you' }).getByRole('link', { name: OVERDUE_ROUND_1.number })).toHaveCount(0);
});

test('the third referee scores the discrepancy round', async ({ page }) => {
  await signInAsStaff(page, 'thirdReferee');

  await expect(page.getByRole('heading', { level: 1, name: 'My portfolios' })).toBeVisible();
  await page.getByRole('table', { name: 'Portfolios assigned to you' }).getByRole('link', { name: ROUND_3.number }).click();

  await expect(page.getByRole('heading', { level: 1, name: `Score portfolio ${ROUND_3.number}` })).toBeVisible();
  await expect(page.getByRole('main')).toContainText('Round 3');
  await expect(question(page, 10)).toBeVisible();
});

test('the 2nd evaluation referee sees only the appealed questions with the appeal responses', async ({ page }) => {
  await signInAsStaff(page, 'secondEvaluationReferee');
  await openPortfolio(page, SECOND_EVALUATION.id);

  await expect(page.getByRole('main')).toContainText('2nd evaluation');
  await expect(page.getByText('Only the questions the candidate appealed are shown.')).toBeVisible();
  await expect(page.getByRole('region', { name: /^Question \d+ –/ })).toHaveCount(1);
  await expect(question(page, 1)).toContainText('My supervisor letter confirms the research role.');
});

test('another role cannot open the scoring page', async ({ page }) => {
  await signInAsStaff(page, 'officer');

  await page.goto(`/scoring/referee/portfolios/${ROUND_1.id}`);
  await expect(page.getByRole('heading', { level: 1, name: 'You cannot open this page' })).toBeVisible();
});

test('referee pages pass axe in light and dark themes and reflow at 320 pixels', async ({ page }) => {
  await signInAsStaff(page, 'referee');
  await openPortfolio(page, ROUND_1.id);
  await expectNoAccessibilityViolations(page);

  await page.addInitScript(() => localStorage.setItem('dahc.theme', 'dark'));
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/scoring/referee');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('heading', { level: 1, name: 'My portfolios' })).toBeVisible();
  await expect(page.getByRole('table', { name: 'Portfolios assigned to you' })).toBeVisible();
  await expectNoHorizontalScroll(page);
  await expectNoAccessibilityViolations(page);

  await openPortfolio(page, ROUND_1.id);
  await decide(page, 4, 'Reject');
  await expectNoHorizontalScroll(page);
  await expectNoAccessibilityViolations(page);
});
