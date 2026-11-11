import { expect, test } from '@playwright/test';

import { ApplicationDraftPage } from '../../pages/application-draft.page';
import { DashboardPage } from '../../pages/dashboard.page';
import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { ApiMock, PROGRAMS, SITES, SPECIALTIES } from '../../support/api-mock';
import { ACCESS_TOKEN, IdamMock } from '../../support/idam-mock';

// Until the API's development-only sign-in exists, the portal runs against in-test IDAM and
// API mocks that follow the contract (standard s.25 asks for the real API in Development).

let idam: IdamMock;
let api: ApiMock;

test.beforeEach(async ({ page }) => {
  idam = new IdamMock();
  api = new ApiMock();
  await idam.install(page);
  await api.install(page);
});

test('signs in through IDAM, calls sign-in once and shows the empty dashboard', async ({ page }) => {
  const dashboard = new DashboardPage(page);

  await dashboard.goto();

  await expect(dashboard.heading).toBeVisible();
  await expect(page.getByText('Welcome, Aisha.', { exact: false })).toBeVisible();
  await expect(dashboard.emptyStateHeading).toBeVisible();
  await expect(dashboard.startNewApplication).toBeVisible();
  await expect(dashboard.sessionTimeoutNote).toContainText('20 minutes');
  expect(api.requestsTo('POST', '/auth/sign-in')).toHaveLength(1);
  expect(api.requestsTo('GET', '/me/dashboard')[0]?.headers['authorization']).toBe(`Bearer ${ACCESS_TOKEN}`);
  expect(await page.evaluate(() => JSON.stringify(sessionStorage))).not.toContain(ACCESS_TOKEN);
  await expectNoAccessibilityViolations(page);
});

test('restores the session with GET /auth/me after a reload', async ({ page }) => {
  const dashboard = new DashboardPage(page);
  await dashboard.goto();
  await expect(dashboard.heading).toBeVisible();

  await page.reload();

  await expect(dashboard.heading).toBeVisible();
  expect(api.requestsTo('POST', '/auth/sign-in')).toHaveLength(1);
  expect(api.requestsTo('GET', '/auth/me')).toHaveLength(1);
});

test('disables Start new application with the reason and the next opening date', async ({ page }) => {
  api.startNewOverride = { enabled: false, disabledReason: 'NO_OPEN_PROGRAM', nextCycleOpensAt: '2027-01-10T05:00:00Z' };
  const dashboard = new DashboardPage(page);

  await dashboard.goto();

  await expect(dashboard.disabledStartButton()).toBeDisabled();
  await expect(dashboard.disabledStartButton()).toHaveAccessibleDescription(
    'No program is open for applications at the moment. Applications open on 10 Jan 2027.',
  );
});

test('shows the duplicate-account guidance when sign-in finds a duplicate', async ({ page }) => {
  api.signInProblem = { status: 409, code: 'account.duplicate', detail: 'Use your original account.' };

  await page.goto('/dashboard');

  await expect(page.getByRole('heading', { level: 1, name: 'Please use your original account' })).toBeVisible();
  await expectNoAccessibilityViolations(page);
});

test('explains that sign-in is unavailable when IDAM cannot be reached, and offers a retry', async ({ page }) => {
  idam.unavailable = true;

  await page.goto('/dashboard');

  await expect(page.getByRole('heading', { level: 1, name: 'We could not sign you in' })).toBeVisible();
  await expect(page.getByText('The sign-in service is not available right now.', { exact: false })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
  expect(api.requests).toHaveLength(0);
});

test('highlights missing answers and refuses the same specialty twice', async ({ page }) => {
  const draft = new ApplicationDraftPage(page);
  await page.goto('/applications/new');
  await expect(draft.heading('New application')).toBeVisible();

  await draft.createDraft.click();
  await expect(draft.program).toHaveAccessibleDescription('Select a program.');

  await draft.chooseProgram('Medical Residency');
  await draft.specialty(1).selectOption({ label: 'Emergency Medicine' });
  await draft.specialty(2).selectOption({ label: 'Emergency Medicine' });
  await draft.createDraft.click();

  await expect(draft.sites(1)).toHaveAccessibleDescription(/Select at least one training site for this specialty\./);
  await expect(draft.specialty(2)).toHaveAccessibleDescription(
    'Preference 2 must be a different specialty from preference 1.',
  );
  expect(api.requestsTo('POST', '/applications')).toHaveLength(0);
  await expectNoAccessibilityViolations(page);
});

test('creates a draft with ordered sites, then saves it with If-Match and recovers from a stale version', async ({ page }) => {
  const dashboard = new DashboardPage(page);
  const draft = new ApplicationDraftPage(page);
  await dashboard.goto();
  await dashboard.startNewApplication.click();

  await draft.chooseProgram('Medical Residency');
  await draft.choosePreference(1, 'Emergency Medicine', ['Rashid Hospital', 'Dubai Hospital']);
  await draft.moveSiteUp(1, 'Dubai Hospital');
  await draft.choosePreference(2, 'Family Medicine', ['Latifa Hospital']);
  await draft.createDraft.click();

  await expect(page.getByText('Your draft has been created')).toBeVisible();
  const [create] = api.requestsTo('POST', '/applications');
  expect(create?.headers['idempotency-key']).toMatch(/^[0-9a-f-]{36}$/);
  expect(create?.body).toEqual({
    programId: PROGRAMS[1]?.id,
    preferences: [
      {
        specialtyId: SPECIALTIES[0]?.id,
        preferenceOrder: 1,
        trainingSites: [
          { siteId: SITES[1]?.id, siteOrder: 1 },
          { siteId: SITES[0]?.id, siteOrder: 2 },
        ],
      },
      { specialtyId: SPECIALTIES[1]?.id, preferenceOrder: 2, trainingSites: [{ siteId: SITES[2]?.id, siteOrder: 1 }] },
    ],
  });
  await expect(draft.sites(1).getByRole('list', { name: 'Your order of preference' }).getByRole('listitem')).toHaveText([
    /Dubai Hospital/,
    /Rashid Hospital/,
  ]);
  await expectNoAccessibilityViolations(page);

  await draft.sites(2).getByRole('checkbox', { name: 'Rashid Hospital' }).check();
  await draft.saveDraft.click();
  await expect(page.getByText('Draft saved on', { exact: false })).toBeVisible();
  const [save] = api.requestsTo('PATCH', `/applications/${api.applications[0]?.id}`);
  expect(save?.headers['if-match']).toBe('"v1"');
  expect(save?.headers['content-type']).toContain('application/merge-patch+json');

  api.failNextSaveWithStaleVersion = true;
  await draft.saveDraft.click();
  await expect(page.getByText('This draft was changed somewhere else')).toBeVisible();
  await draft.loadLatestVersion.click();
  await draft.saveDraft.click();
  await expect(page.getByText('Draft saved on', { exact: false })).toBeVisible();
});

test('lists the draft on the dashboard with a resume action, and signs out through IDAM', async ({ page }) => {
  const dashboard = new DashboardPage(page);
  const draft = new ApplicationDraftPage(page);
  await page.goto('/applications/new');
  await draft.chooseProgram('Internship');
  await draft.choosePreference(1, 'Emergency Medicine', ['Rashid Hospital']);
  await expect(draft.specialty(2)).toHaveCount(0);
  await draft.createDraft.click();
  await expect(page.getByText('Your draft has been created')).toBeVisible();

  await page.getByRole('button', { name: 'Back to dashboard' }).click();
  await expect(dashboard.application('20270000001')).toContainText('Draft');
  await expect(dashboard.disabledStartButton()).toHaveAccessibleDescription(
    'You already have an active application in this cycle.',
  );
  await expectNoAccessibilityViolations(page);

  await dashboard.resume('20270000001');
  await expect(draft.heading('Application draft')).toBeVisible();
  await expect(draft.program).toBeDisabled();

  await page.getByRole('banner').getByRole('button', { name: 'Sign out' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'You have signed out' })).toBeVisible();
  expect(idam.revokedTokens.join()).toContain(ACCESS_TOKEN);
  expect(idam.signOutRequest?.searchParams.get('id_token_hint')).toBeTruthy();
  expect(idam.signOutRequest?.searchParams.get('state')).toBeTruthy();
  expect(idam.signOutRequest?.searchParams.get('post_logout_redirect_uri')).toBe('http://localhost:4200/signed-out');
});

test('the main screens reflow at 320 pixels', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  const draft = new ApplicationDraftPage(page);

  await page.goto('/dashboard');
  await expect(new DashboardPage(page).heading).toBeVisible();
  await expectNoHorizontalScroll(page);

  await page.goto('/applications/new');
  await draft.chooseProgram('Medical Residency');
  await draft.choosePreference(1, 'Emergency Medicine', ['Rashid Hospital', 'Dubai Hospital']);
  await expectNoHorizontalScroll(page);
});

test('the main screens have no WCAG 2.2 AA violations in the dark theme', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('dahc.theme', 'dark'));
  const draft = new ApplicationDraftPage(page);

  await page.goto('/dashboard');
  await expect(new DashboardPage(page).heading).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expectNoAccessibilityViolations(page);

  await page.goto('/applications/new');
  await draft.chooseProgram('Medical Residency');
  await draft.choosePreference(1, 'Emergency Medicine', ['Rashid Hospital', 'Dubai Hospital']);
  await draft.createDraft.click();
  await expect(page.getByText('Your draft has been created')).toBeVisible();
  await expectNoAccessibilityViolations(page);
});
