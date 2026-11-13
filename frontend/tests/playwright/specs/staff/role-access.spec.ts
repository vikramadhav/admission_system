import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { signInAs } from '../../support/candidate';
import { STAFF_PERSONAS, StaffPersona, signInAsStaff } from '../../support/staff';

interface RoleCase {
  readonly persona: StaffPersona;
  readonly home: string;
  readonly heading: string;
  /** Header navigation the role sees, in order. */
  readonly nav: readonly string[];
  /** Areas the role must not open. */
  readonly blocked: readonly string[];
}

const ROLES: readonly RoleCase[] = [
  {
    persona: 'officer',
    home: '/admission/officer',
    heading: 'My applications',
    nav: ['My applications'],
    blocked: ['/admission/supervisor', '/admission/screening', '/scoring/referee', '/finance/payments', '/monitoring', '/admin/staff-users', '/candidate/dashboard'],
  },
  {
    persona: 'supervisor',
    home: '/admission/supervisor',
    heading: 'Supervision',
    nav: ['Supervision', 'Screening', 'Site monitoring'],
    blocked: ['/admission/officer', '/scoring/senior', '/finance/payments', '/admin/staff-users', '/candidate/dashboard'],
  },
  {
    persona: 'referee',
    home: '/scoring/referee',
    heading: 'My portfolios',
    nav: ['My portfolios'],
    blocked: ['/scoring/senior', '/admission/officer', '/finance/payments', '/monitoring', '/admin/staff-users'],
  },
  {
    persona: 'thirdReferee',
    home: '/scoring/referee',
    heading: 'My portfolios',
    nav: ['My portfolios'],
    blocked: ['/scoring/senior', '/admission/supervisor'],
  },
  {
    persona: 'secondEvaluationReferee',
    home: '/scoring/referee',
    heading: 'My portfolios',
    nav: ['My portfolios'],
    blocked: ['/scoring/senior', '/finance/payments'],
  },
  {
    persona: 'seniorReferee',
    home: '/scoring/senior',
    heading: 'Scoring oversight',
    nav: ['Scoring oversight'],
    blocked: ['/scoring/referee', '/admission/supervisor', '/monitoring'],
  },
  {
    persona: 'financeOfficer',
    home: '/finance/payments',
    heading: 'Payments',
    nav: ['Payments'],
    blocked: ['/admission/officer', '/scoring/referee', '/monitoring', '/admin/staff-users', '/candidate/dashboard'],
  },
  {
    persona: 'centralMonitor',
    home: '/monitoring',
    heading: 'Site monitoring',
    nav: ['Site monitoring'],
    blocked: ['/admission/supervisor', '/scoring/senior', '/finance/payments', '/admin/staff-users'],
  },
  {
    persona: 'administrator',
    home: '/admin/staff-users',
    heading: 'Staff users',
    nav: ['Staff users', 'Integration clients'],
    blocked: ['/admission/officer', '/scoring/referee', '/finance/payments', '/monitoring'],
  },
];

for (const role of ROLES) {
  test(`${STAFF_PERSONAS[role.persona]} lands on their home and sees only their navigation`, async ({ page }) => {
    await signInAsStaff(page, role.persona);

    await expect(page).toHaveURL(role.home);
    await expect(page.getByRole('heading', { level: 1, name: role.heading })).toBeVisible();
    const nav = page.getByRole('banner').getByRole('navigation', { name: 'Staff' });
    await expect(nav.getByRole('link')).toHaveText([...role.nav]);
    // Single-role users get no role switch.
    await expect(page.getByRole('button', { name: 'Switch role' })).toHaveCount(0);
  });

  test(`${STAFF_PERSONAS[role.persona]} cannot open other areas`, async ({ page }) => {
    await signInAsStaff(page, role.persona);

    for (const path of role.blocked) {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1, name: 'You cannot open this page' }), path).toBeVisible();
      await expect(page).toHaveURL('/unauthorised');
    }
  });
}

test('a candidate cannot open the staff areas', async ({ page }) => {
  await signInAs(page, 'submitted');

  for (const path of ['/admission/officer', '/scoring/referee', '/finance/payments', '/monitoring', '/admin/staff-users']) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1, name: 'You cannot open this page' }), path).toBeVisible();
  }

  await page.goto('/');
  await expect(page).toHaveURL('/candidate/dashboard');
  await expect(page.getByRole('button', { name: 'Switch role' })).toHaveCount(0);
});

test('an unauthenticated visit to a staff area signs in and returns to it', async ({ page }) => {
  await page.goto('/finance/payments');

  await expect(page.getByRole('heading', { level: 1, name: 'Sign in to GME Admissions' })).toBeVisible();
  await page.getByRole('button', { name: `Continue as ${STAFF_PERSONAS.financeOfficer}` }).click();

  await expect(page).toHaveURL('/finance/payments');
  await expect(page.getByRole('heading', { level: 1, name: 'Payments' })).toBeVisible();
});

test('a staff user with several roles switches role from the header, and the role survives a reload', async ({ page }) => {
  await signInAsStaff(page, 'multiRole');

  await expect(page).toHaveURL('/admission/officer');
  const roleBar = page.getByRole('navigation', { name: 'Role' });
  await expect(roleBar).toContainText('Working as Admission officer');

  await roleBar.getByRole('button', { name: 'Switch role' }).click();
  await page.getByRole('menuitem', { name: 'Finance officer' }).click();

  await expect(page).toHaveURL('/finance/payments');
  await expect(page.getByRole('heading', { level: 1, name: 'Payments' })).toBeVisible();
  await expect(roleBar).toContainText('Working as Finance officer');
  await expect(page.getByText('You are now working as Finance officer')).toBeVisible();
  await expect(page.getByRole('banner').getByRole('navigation', { name: 'Staff' }).getByRole('link')).toHaveText(['Payments']);

  // The previous role's area is now closed.
  await page.goto('/admission/officer');
  await expect(page.getByRole('heading', { level: 1, name: 'You cannot open this page' })).toBeVisible();

  // The active role is stored on the server, not in the browser: a reload keeps it.
  await page.goto('/');
  await expect(page).toHaveURL('/finance/payments');
  await expect(page.getByRole('navigation', { name: 'Role' })).toContainText('Working as Finance officer');
});

test('the role switch lists every other role the user holds', async ({ page }) => {
  await signInAsStaff(page, 'multiRole');

  await page.getByRole('button', { name: 'Switch role' }).click();

  await expect(page.getByRole('menuitem')).toHaveText([
    'Admission supervisor',
    'Referee',
    'Third referee',
    '2nd evaluation referee',
    'Senior referee',
    'Finance officer',
    'Central monitor',
    'Administrator',
  ]);
});

test('an unknown page shows not found, separate from unauthorised', async ({ page }) => {
  await signInAsStaff(page, 'officer');

  await page.goto('/admission/does-not-exist');
  await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();

  await page.goto('/no-such-area');
  await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();
  await page.getByRole('link', { name: 'Go to your dashboard' }).click();
  await expect(page).toHaveURL('/admission/officer');
});

test('staff pages pass axe in light and dark themes, left-to-right and right-to-left, and reflow at 320 pixels', async ({ page }) => {
  await signInAsStaff(page, 'multiRole');
  await expect(page.getByRole('heading', { level: 1, name: 'My applications' })).toBeVisible();
  await expectNoAccessibilityViolations(page);

  await page.evaluate(() => document.documentElement.setAttribute('dir', 'rtl'));
  await expectNoAccessibilityViolations(page);
  await page.evaluate(() => document.documentElement.setAttribute('dir', 'ltr'));

  await page.addInitScript(() => localStorage.setItem('dahc.theme', 'dark'));
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/admission/officer');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('heading', { level: 1, name: 'My applications' })).toBeVisible();
  await expectNoHorizontalScroll(page);
  await expectNoAccessibilityViolations(page);

  await page.evaluate(() => document.documentElement.setAttribute('dir', 'rtl'));
  await expectNoHorizontalScroll(page);
  await expectNoAccessibilityViolations(page);

  for (const path of ['/unauthorised', '/no-area']) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expectNoHorizontalScroll(page);
    await expectNoAccessibilityViolations(page);
  }
});
