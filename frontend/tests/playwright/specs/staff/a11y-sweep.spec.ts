import { Page, expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { StaffPersona, signInAsStaff } from '../../support/staff';

/**
 * Phase 6 hardening: every staff page passes axe (WCAG 2.2 AA) in the light and dark themes,
 * left-to-right and right-to-left, and reflows at 320 CSS pixels without horizontal page scroll.
 * Ids are the seeded mock records (mock-admission-seed.ts, mock-scoring.ts, mock-oversight.ts).
 */
interface SweepPage {
  readonly persona: StaffPersona;
  readonly path: string;
  readonly heading: string | RegExp;
}

const PAGES: readonly SweepPage[] = [
  { persona: 'officer', path: '/admission/officer', heading: 'My applications' },
  { persona: 'officer', path: '/admission/applications/rv-0008', heading: /Application/ },
  { persona: 'supervisor', path: '/admission/supervisor', heading: 'Supervision' },
  { persona: 'supervisor', path: '/admission/supervisor/officers/officer', heading: /Noura Al Hashimi/ },
  { persona: 'supervisor', path: '/admission/supervisor/reinstatements', heading: /Reinstatement/ },
  { persona: 'supervisor', path: '/admission/supervisor/reinstatements/ri-0001', heading: /Reinstatement/ },
  { persona: 'supervisor', path: '/admission/supervisor/duplicate-accounts', heading: /Duplicate/ },
  { persona: 'supervisor', path: '/admission/screening', heading: 'Screening' },
  { persona: 'referee', path: '/scoring/referee', heading: 'My portfolios' },
  { persona: 'referee', path: '/scoring/referee/portfolios/pf-0004', heading: /Portfolio|Score/ },
  { persona: 'seniorReferee', path: '/scoring/senior', heading: 'Scoring oversight' },
  { persona: 'seniorReferee', path: '/scoring/senior/referees/referee', heading: /Layla Nasser/ },
  { persona: 'seniorReferee', path: '/scoring/senior/portfolios/pf-0009', heading: /Portfolio|Application/ },
  { persona: 'financeOfficer', path: '/finance/payments', heading: 'Payments' },
  { persona: 'centralMonitor', path: '/monitoring', heading: 'Site monitoring' },
  { persona: 'centralMonitor', path: '/monitoring/applications', heading: /Applications/ },
  { persona: 'centralMonitor', path: '/monitoring/applications/rv-0001', heading: /Application|20/ },
  { persona: 'administrator', path: '/admin/staff-users', heading: 'Staff users' },
  { persona: 'administrator', path: '/admin/staff-users/su-officer', heading: /Noura Al Hashimi/ },
  { persona: 'administrator', path: '/admin/integration-clients', heading: 'Integration clients' },
];

async function pageReady(page: Page, heading: string | RegExp): Promise<void> {
  await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
  // Let the page's first API calls settle (the mock answers after 250 ms).
  await page.waitForLoadState('networkidle');
}

async function setDirection(page: Page, direction: 'ltr' | 'rtl'): Promise<void> {
  await page.evaluate(dir => document.documentElement.setAttribute('dir', dir), direction);
}

for (const entry of PAGES) {
  test(`${entry.path} passes axe in light and dark, LTR and RTL, and reflows at 320 pixels`, async ({ page }) => {
    await signInAsStaff(page, entry.persona, entry.path);
    await pageReady(page, entry.heading);

    for (const direction of ['ltr', 'rtl'] as const) {
      await setDirection(page, direction);
      await expectNoAccessibilityViolations(page);
    }

    await page.addInitScript(() => localStorage.setItem('dahc.theme', 'dark'));
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(entry.path);
    await pageReady(page, entry.heading);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    for (const direction of ['ltr', 'rtl'] as const) {
      await setDirection(page, direction);
      await expectNoHorizontalScroll(page);
      await expectNoAccessibilityViolations(page);
    }
  });
}

test('a thin donut slice can also be opened from its legend entry', async ({ page }) => {
  await signInAsStaff(page, 'centralMonitor');
  await pageReady(page, 'Site monitoring');

  const legendButton = page.getByRole('main').locator('.legend-button').first();
  const label = (await legendButton.textContent())?.split(':')[0]?.trim() ?? '';
  await legendButton.click();

  await expect(page).toHaveURL(/\/monitoring\/applications\?/);
  expect(label).not.toBe('');
});
