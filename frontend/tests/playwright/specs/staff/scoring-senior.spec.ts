import { Locator, Page, expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { pdf } from '../../support/candidate';
import { signInAsStaff } from '../../support/staff';

/**
 * Senior referee oversight (US-3.1.3, US-3.2.2, US-3.2.3) against the mock build. Seeded
 * portfolios (mock/mock-scoring.ts): pf-0004 Round 1 in progress with Dr. Layla Nasser
 * (application 20260005164), pf-0005 Round 1 complete and Round 2 in progress (20260005205), pf-0007 complete (20260005287, both rounds 36), pf-0009 with a
 * Round 1 / Round 2 discrepancy (20260005369, 40 against 31). The residency question set totals
 * 44 points.
 */

/** Chooses the option of a native select whose text contains `text`. */
async function chooseOption(select: Locator, text: string): Promise<void> {
  const value = await select.locator('option', { hasText: text }).first().getAttribute('value');
  await select.selectOption(value ?? '');
}

async function openPortfolio(page: Page, portfolioId: string, number: string): Promise<void> {
  await signInAsStaff(page, 'seniorReferee', `/scoring/senior/portfolios/${portfolioId}`);
  await expect(page.getByRole('heading', { level: 1, name: `Portfolio ${number}` })).toBeVisible();
}

test('the senior referee sees pool insights and the referees workload', async ({ page }) => {
  await signInAsStaff(page, 'seniorReferee');

  await expect(page).toHaveURL('/scoring/senior');
  await expect(page.getByRole('heading', { level: 1, name: 'Scoring oversight' })).toBeVisible();
  const main = page.getByRole('main');
  await expect(main.getByText('Pending scoring')).toBeVisible();
  await expect(main.getByText('Resolving discrepancy')).toBeVisible();
  await expect(main.getByText('Re-scoring appealed questions')).toBeVisible();
  await expect(main.getByText('Scores are announced to candidates by the admission team, not from this page.')).toBeVisible();

  const table = main.getByRole('table', { name: 'Referees and their portfolios' });
  await expect(table.getByRole('link', { name: 'Dr. Layla Nasser' })).toBeVisible();
  await expect(table.getByRole('row', { name: /Dr\. Ahmed Saleh/ })).toContainText('Third referee');
  await expectNoAccessibilityViolations(page);
});

test("a referee's inbox lists anonymised portfolios that open the oversight page", async ({ page }) => {
  await signInAsStaff(page, 'seniorReferee');

  await page.getByRole('link', { name: 'Dr. Layla Nasser' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'Portfolios of Dr. Layla Nasser' })).toBeVisible();
  const table = page.getByRole('table', { name: 'Portfolios assigned to this referee' });
  await expect(table.getByRole('link', { name: '20260005164' })).toBeVisible();
  await expect(table.getByRole('columnheader', { name: /candidate/i })).toHaveCount(0);
  await expectNoAccessibilityViolations(page);

  await table.getByRole('link', { name: '20260005164' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Portfolio 20260005164' })).toBeVisible();
});

test('the oversight page shows the rounds, their referees and the discrepancy', async ({ page }) => {
  await openPortfolio(page, 'pf-0009', '20260005369');

  const rounds = page.getByRole('table', { name: 'Rounds, referees and totals' });
  await expect(rounds.getByRole('row', { name: /Round 1/ })).toContainText('Dr. Layla Nasser');
  await expect(rounds.getByRole('row', { name: /Round 1/ })).toContainText('40 out of 44');
  await expect(rounds.getByRole('row', { name: /Round 2/ })).toContainText('31 out of 44');
  await expect(page.getByRole('heading', { name: 'Discrepancy between Round 1 and Round 2' })).toBeVisible();
  await expect(page.getByRole('table', { name: 'Questions with different decisions' }).getByRole('row', { name: /Question 1/ })).toBeVisible();
  await expect(page.getByRole('main')).not.toContainText(/candidate name/i);
});

test('the senior referee reassigns an in-progress portfolio to an eligible referee', async ({ page }) => {
  // pf-0005: Round 1 complete (Dr. Hind Al Mulla), Round 2 in progress with Dr. Layla Nasser.
  await openPortfolio(page, 'pf-0005', '20260005205');

  await page.getByRole('button', { name: 'Reassign or override' }).click();
  const dialog = page.getByRole('dialog', { name: 'Reassign or override' });
  await expect(dialog.getByRole('radio', { name: 'Reassign' })).toBeChecked();
  await expect(dialog.getByRole('radio', { name: 'Override score' })).not.toBeChecked();
  await dialog.getByRole('button', { name: 'Reassign', exact: true }).click();
  await expect(dialog.getByText('Choose the referee to reassign to.')).toBeVisible();
  await expect(dialog.getByText('This field is required.')).toBeVisible();

  await chooseOption(dialog.getByRole('combobox', { name: 'Reassign to' }), 'Dr. Omar Barakat');
  await dialog.getByLabel('Justification').fill('Dr. Nasser is on leave this week.');
  await dialog.getByRole('button', { name: 'Reassign', exact: true }).click();

  await expect(page.getByText(/Portfolio reassigned to Dr\. Omar Barakat/)).toBeVisible();
  await expect(page.getByRole('table', { name: 'Rounds, referees and totals' }).getByRole('row', { name: /Round 2/ })).toContainText('Dr. Omar Barakat');
});

test('a portfolio without a completed round offers only the reassignment', async ({ page }) => {
  await openPortfolio(page, 'pf-0004', '20260005164');

  await page.getByRole('button', { name: 'Reassign or override' }).click();
  const dialog = page.getByRole('dialog', { name: 'Reassign or override' });
  await expect(dialog.getByRole('radio')).toHaveCount(0);
  await expect(dialog.getByRole('combobox', { name: 'Reassign to' })).toBeVisible();
  await expect(dialog.getByRole('combobox', { name: 'Round to override' })).toHaveCount(0);
});

test('the senior referee overrides a completed round score with a justification', async ({ page }) => {
  await openPortfolio(page, 'pf-0007', '20260005287');

  await page.getByRole('button', { name: 'Reassign or override' }).click();
  const dialog = page.getByRole('dialog', { name: 'Reassign or override' });
  // No referee holds a completed portfolio, so only the override is offered.
  await expect(dialog.getByRole('radio')).toHaveCount(0);
  await chooseOption(dialog.getByRole('combobox', { name: 'Round to override' }), 'Round 2');
  await dialog.getByLabel('New score').fill('50');
  await dialog.getByRole('button', { name: 'Override score' }).click();
  await expect(dialog.getByText('Enter a whole number from 0 to 44.')).toBeVisible();
  await expect(dialog.getByText('This field is required.')).toBeVisible();

  await dialog.getByLabel('New score').fill('40');
  await dialog.getByLabel('Justification').fill('Question 3 classification was entered incorrectly.');
  await dialog.getByRole('button', { name: 'Override score' }).click();

  await expect(page.getByText(/Score overridden\. Final portfolio points: 40 out of 44/)).toBeVisible();
  await expect(page.getByRole('table', { name: 'Rounds, referees and totals' }).getByRole('row', { name: /Round 2/ })).toContainText('40 out of 44');
});

test('the senior referee replaces an evidence file without recomputing scores', async ({ page }) => {
  await openPortfolio(page, 'pf-0007', '20260005287');

  await page.getByRole('button', { name: 'Replace evidence-q1.pdf' }).click();
  const dialog = page.getByRole('dialog', { name: 'Replace evidence' });
  await expect(dialog.getByText('Scores are not recomputed. If the replacement changes a score, use Override score afterwards.')).toBeVisible();
  await dialog.getByRole('button', { name: 'Replace file' }).click();
  await expect(dialog.getByText('Choose the new file.')).toBeVisible();

  await dialog.getByLabel('Justification').fill('The candidate uploaded the wrong page; the correct manuscript was provided.');
  await dialog.locator('input[type="file"]').setInputFiles(pdf('manuscript-correct.pdf'));
  await dialog.getByRole('button', { name: 'Replace file' }).click();

  await expect(page.getByText('The evidence was replaced. The earlier version is kept for audit; scores were not recomputed.')).toBeVisible();
});

test('a referee cannot open the senior referee pages', async ({ page }) => {
  await signInAsStaff(page, 'referee');

  for (const path of ['/scoring/senior', '/scoring/senior/referees/referee', '/scoring/senior/portfolios/pf-0007']) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1, name: 'You cannot open this page' }), path).toBeVisible();
  }
});

test('senior pages pass axe in light and dark themes and reflow at 320 pixels', async ({ page }) => {
  await openPortfolio(page, 'pf-0009', '20260005369');
  await expectNoAccessibilityViolations(page);

  await page.getByRole('button', { name: 'Reassign or override' }).click();
  await expect(page.getByRole('dialog', { name: 'Reassign or override' })).toBeVisible();
  await page.waitForFunction(() => document.getAnimations().every(animation => animation.playState !== 'running'));
  await expectNoAccessibilityViolations(page);
  await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();

  await page.addInitScript(() => localStorage.setItem('dahc.theme', 'dark'));
  await page.setViewportSize({ width: 320, height: 800 });
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('heading', { level: 1, name: 'Portfolio 20260005369' })).toBeVisible();
  await expectNoHorizontalScroll(page);
  await expectNoAccessibilityViolations(page);

  for (const path of ['/scoring/senior', '/scoring/senior/referees/referee']) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('table').first()).toBeVisible();
    await expectNoHorizontalScroll(page);
    await expectNoAccessibilityViolations(page);
  }
});
