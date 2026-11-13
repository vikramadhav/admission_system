import { Page } from '@playwright/test';

/** Staff personas of the mock build (projects/dahc-portal/src/app/mock/mock-personas.ts, MOCK_STAFF_USERS). */
export const STAFF_PERSONAS = {
  officer: 'Noura Al Hashimi',
  supervisor: 'Khalid Rahman',
  referee: 'Dr. Layla Nasser',
  thirdReferee: 'Dr. Ahmed Saleh',
  secondEvaluationReferee: 'Dr. Mariam Qasim',
  seniorReferee: 'Dr. Yousef Karim',
  financeOfficer: 'Huda Mansour',
  centralMonitor: 'Salem Obaid',
  administrator: 'Reem Al Falasi',
  multiRole: 'Demo staff (all roles)',
} as const;

export type StaffPersona = keyof typeof STAFF_PERSONAS;

/** Signs in as a staff persona; without a path the portal opens the persona's role home. */
export async function signInAsStaff(page: Page, persona: StaffPersona, path = '/'): Promise<void> {
  await page.goto(`/auth/sign-in?returnUrl=${encodeURIComponent(path)}`);
  await page.getByRole('button', { name: `Continue as ${STAFF_PERSONAS[persona]}` }).click();
  await page.waitForURL(url => url.pathname !== '/auth/sign-in' && url.pathname !== '/');
}
