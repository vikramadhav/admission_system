import { expect, test } from '@playwright/test';

import { ApplicationDraftPage } from '../../pages/application-draft.page';
import { DashboardPage } from '../../pages/dashboard.page';
import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { ApiMock, PROGRAMS, SITES, SPECIALTIES } from '../../support/api-mock';
import { ACCESS_TOKEN, IdamMock } from '../../support/idam-mock';

// The development build with real IDAM sign-in (OIDC code + PKCE) against in-test IDAM and API
// mocks that follow the contract. The full candidate workflows run against the mock build
// (specs/candidate); these specs cover what only the real wiring can show: tokens, sign-in and
// sign-out at IDAM, request headers, idempotency and If-Match.

let idam: IdamMock;
let api: ApiMock;

test.beforeEach(async ({ page }) => {
  idam = new IdamMock();
  api = new ApiMock();
  await idam.install(page);
  await api.install(page);
});

test('signs in through IDAM, calls sign-in once and shows the first-time dashboard', async ({ page }) => {
  const dashboard = new DashboardPage(page);

  await dashboard.goto();

  await expect(dashboard.heading('Welcome, Aisha')).toBeVisible();
  await expect(dashboard.firstTimeHeading).toBeVisible();
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
  await expect(dashboard.heading('Welcome, Aisha')).toBeVisible();

  await page.reload();

  await expect(dashboard.heading('Welcome, Aisha')).toBeVisible();
  expect(api.requestsTo('POST', '/auth/sign-in')).toHaveLength(1);
  expect(api.requestsTo('GET', '/auth/me')).toHaveLength(1);
});

test('disables Start New Application with the reason and the next opening date', async ({ page }) => {
  api.startNewOverride = { enabled: false, disabledReason: 'NO_OPEN_PROGRAM', nextCycleOpensAt: '2027-01-10T05:00:00Z' };
  const dashboard = new DashboardPage(page);

  await dashboard.goto();

  await expect(dashboard.disabledStartButton()).toBeDisabled();
  await expect(dashboard.disabledStartButton()).toHaveAccessibleDescription(
    'No program is open for applications. The next cycle opens on 10 Jan 2027.',
  );
});

test('shows the duplicate-account guidance when sign-in finds a duplicate', async ({ page }) => {
  api.signInProblem = { status: 409, code: 'account.duplicate', detail: 'Use your original account.' };

  await page.goto('/candidate/dashboard');

  await expect(page.getByRole('heading', { level: 1, name: 'Please use your original account' })).toBeVisible();
  await expectNoAccessibilityViolations(page);
});

test('explains that sign-in is unavailable when IDAM cannot be reached, and offers a retry', async ({ page }) => {
  idam.unavailable = true;

  await page.goto('/candidate/dashboard');

  await expect(page.getByRole('heading', { level: 1, name: 'We could not sign you in' })).toBeVisible();
  await expect(page.getByText('The sign-in service is not available right now.', { exact: false })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
  expect(api.requests).toHaveLength(0);
});

test('old addresses redirect to the candidate area', async ({ page }) => {
  await page.goto('/dashboard');

  await expect(page).toHaveURL(/\/candidate\/dashboard$/);
});

test('creates a draft with ordered sites and an idempotency key, then saves with If-Match and recovers from a stale version', async ({ page }) => {
  const dashboard = new DashboardPage(page);
  const draft = new ApplicationDraftPage(page);
  await dashboard.goto();
  await dashboard.startNewApplication.click();

  await expect(draft.heading('New application')).toBeVisible();
  await draft.chooseProgram('Medical Residency');
  await draft.choosePreference(1, 'Emergency Medicine', ['Rashid Hospital', 'Dubai Hospital']);
  await draft.moveSiteUp(1, 'Dubai Hospital');
  await draft.choosePreference(2, 'Family Medicine', ['Latifa Hospital']);
  await draft.next.click();

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
  await expect(page.getByRole('heading', { level: 2, name: 'Application Information' })).toBeVisible();

  await page.getByRole('navigation', { name: 'Application steps' }).getByRole('button', { name: /Program & Preferences/ }).click();
  await expect(draft.sites(1).getByRole('list', { name: 'Your order of preference' }).getByRole('listitem')).toHaveText([
    /Dubai Hospital/,
    /Rashid Hospital/,
  ]);
  await expectNoAccessibilityViolations(page);

  await draft.sites(2).getByRole('checkbox', { name: 'Rashid Hospital' }).check();
  await draft.saveDraft.click();
  await expect(page.getByText('Draft saved')).toBeVisible();
  const [save] = api.requestsTo('PATCH', `/applications/${api.applications[0]?.id}`);
  expect(save?.headers['if-match']).toBe('"v1"');
  expect(save?.headers['content-type']).toContain('application/merge-patch+json');

  api.failNextSaveWithStaleVersion = true;
  await draft.sites(2).getByRole('checkbox', { name: 'Dubai Hospital' }).check();
  await draft.saveDraft.click();
  await expect(page.getByText('This draft was changed since you opened it.')).toBeVisible();
  await draft.loadLatestVersion.click();
  await expect(draft.loadLatestVersion).toBeHidden();
});

test('signs out through the IDAM single sign-out page', async ({ page }) => {
  const dashboard = new DashboardPage(page);
  await dashboard.goto();
  await expect(dashboard.heading('Welcome, Aisha')).toBeVisible();

  await dashboard.signOut.click();

  await expect(page.getByRole('heading', { level: 1, name: 'You have signed out' })).toBeVisible();
  expect(idam.revokedTokens.join()).toContain(ACCESS_TOKEN);
  expect(idam.signOutRequest?.searchParams.get('id_token_hint')).toBeTruthy();
  expect(idam.signOutRequest?.searchParams.get('state')).toBeTruthy();
  expect(idam.signOutRequest?.searchParams.get('post_logout_redirect_uri')).toBe('http://localhost:4200/signed-out');
});

test('the dashboard and the program step reflow at 320 pixels and pass axe in the dark theme', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('dahc.theme', 'dark'));
  await page.setViewportSize({ width: 320, height: 800 });
  const dashboard = new DashboardPage(page);
  const draft = new ApplicationDraftPage(page);

  await dashboard.goto();
  await expect(dashboard.heading('Welcome, Aisha')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expectNoHorizontalScroll(page);
  await expectNoAccessibilityViolations(page);

  await page.goto('/candidate/applications/new');
  await draft.chooseProgram('Medical Residency');
  await draft.choosePreference(1, 'Emergency Medicine', ['Rashid Hospital', 'Dubai Hospital']);
  await expectNoHorizontalScroll(page);
  await expectNoAccessibilityViolations(page);
});
