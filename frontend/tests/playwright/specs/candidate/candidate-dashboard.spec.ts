import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { main, signInAs } from '../../support/candidate';

test('an unauthenticated visit goes to sign-in and returns to the requested page', async ({ page }) => {
  await page.goto('/candidate/applications');

  await expect(page.getByRole('heading', { level: 1, name: 'Sign in to GME Admissions' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue as Aisha Khan' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'My applications' })).toBeVisible();
});

test('a first-time candidate sees the welcome, admission cycle and before-you-begin cards', async ({ page }) => {
  await signInAs(page, 'newCandidate');

  await expect(page.getByRole('heading', { level: 1, name: 'Welcome, Mohammed' })).toBeVisible();
  await expect(main(page).getByText("For your security, you'll be signed out after 30 minutes of inactivity.")).toBeVisible();
  await expect(main(page).getByRole('heading', { name: 'Your next chapter starts here' })).toBeVisible();
  await expect(main(page).getByRole('heading', { name: 'Admission Cycle' })).toBeVisible();
  await expect(main(page).getByRole('heading', { name: 'Before you begin' })).toBeVisible();
  await expect(main(page).getByRole('link', { name: 'Start New Application' }).first()).toHaveAttribute('href', '/candidate/applications/new');
  await expect(page.getByRole('navigation', { name: 'Candidate' }).getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
  await expectNoAccessibilityViolations(page);
});

test('a candidate with announced scores sees scores, key dates and only the allowed actions', async ({ page }) => {
  await signInAs(page, 'announced');

  await expect(page.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start New Application' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Start New Application' })).toHaveAccessibleDescription(
    'You already have an active application in this cycle.',
  );
  await expect(main(page).getByText('Review completed', { exact: true })).toBeVisible();
  await expect(main(page).getByText('Portfolio final score')).toBeVisible();
  await expect(main(page).getByRole('heading', { name: 'Key dates' })).toBeVisible();
  await expect(main(page).getByText('Appeal window open.')).toBeVisible();
  await expect(main(page).getByRole('button', { name: 'Withdraw Application' })).toBeVisible();
  await expect(main(page).getByRole('link', { name: 'Appeal Score' })).toBeVisible();
  await expect(main(page).getByRole('button', { name: 'Exclude Training Site' })).toBeVisible();
  await expect(main(page).getByRole('button', { name: 'Edit Preferences' })).toHaveCount(0);
  await expect(main(page).getByRole('link', { name: 'Resume Application' })).toHaveCount(0);
  await expectNoAccessibilityViolations(page);
});

test('My applications lists every application with its status', async ({ page }) => {
  await signInAs(page, 'submitted', '/candidate/applications');

  const table = main(page).getByRole('table');
  await expect(table.getByRole('row')).toHaveCount(2);
  await expect(table).toContainText('20260000187');
  await expect(table).toContainText('Submitted');
  await expectNoAccessibilityViolations(page);
});

test('My account shows the session profile', async ({ page }) => {
  await signInAs(page, 'submitted', '/candidate/account');

  await expect(page.getByRole('heading', { level: 1, name: 'My account' })).toBeVisible();
  await expect(main(page)).toContainText('mohamed.hazim@example.com');
  await expectNoAccessibilityViolations(page);
});

test('staff accounts cannot open the candidate portal', async ({ page }) => {
  await signInAs(page, 'staff');

  await expect(page.getByRole('heading', { level: 1, name: 'You cannot open this page' })).toBeVisible();
});

test('signing out ends the session', async ({ page }) => {
  await signInAs(page, 'draft');

  await page.getByRole('banner').getByRole('button', { name: 'Sign out' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'You have signed out' })).toBeVisible();
  await page.goto('/candidate/dashboard');
  await expect(page.getByRole('heading', { level: 1, name: 'Sign in to GME Admissions' })).toBeVisible();
});

test('candidate pages reflow at 320 pixels and pass axe in the dark theme', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('dahc.theme', 'dark'));
  await signInAs(page, 'announced');

  for (const path of ['/candidate/dashboard', '/candidate/applications', '/candidate/applications/a-fel-0001/portfolio-result']) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expectNoAccessibilityViolations(page);
  }

  await page.setViewportSize({ width: 320, height: 800 });

  for (const path of ['/candidate/dashboard', '/candidate/applications/a-fel-0001/steps/board-license-information']) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expectNoHorizontalScroll(page);
  }
});
