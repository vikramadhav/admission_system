import { Locator, Page, expect } from '@playwright/test';

/** Personas of the mock build (projects/dahc-portal/src/app/mock/mock-personas.ts). */
export const PERSONAS = {
  newCandidate: 'Mohammed Al Mansoori',
  draft: 'Aisha Khan',
  submitted: 'Mohamed Hazim',
  announced: 'Fatima Al Suwaidi',
  withdrawn: 'Omar Haddad',
  correction: 'Salma Darwish',
  staff: 'Staff member',
} as const;

export type Persona = keyof typeof PERSONAS;

/** Every test starts with fresh mock data: each test has its own browser context and sessionStorage. */
export async function signInAs(page: Page, persona: Persona, path = '/candidate/dashboard'): Promise<void> {
  await page.goto(`/auth/sign-in?returnUrl=${encodeURIComponent(path)}`);
  await page.getByRole('button', { name: `Continue as ${PERSONAS[persona]}` }).click();
  await page.waitForURL(url => url.pathname !== '/auth/sign-in');
}

/** A small file for an upload slot. */
export function pdf(name = 'document.pdf'): { name: string; mimeType: string; buffer: Buffer } {
  return { name, mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n% test document\n') };
}

export function jpeg(name = 'photo.jpg'): { name: string; mimeType: string; buffer: Buffer } {
  return { name, mimeType: 'image/jpeg', buffer: Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]) };
}

/** Uploads a file into the slot named `label` and waits until it shows as uploaded. */
export async function upload(page: Page, label: string | RegExp, file = pdf()): Promise<void> {
  const slot = page.getByRole('group', { name: label });
  await slot.locator('input[type="file"]').setInputFiles(file);
  await expect(slot.getByText(file.name).first()).toBeVisible();
}

export function main(page: Page): Locator {
  return page.getByRole('main');
}

/** The wizard's primary button in the sticky action bar. */
export function actionBar(page: Page): Locator {
  return page.getByRole('group', { name: 'Step actions' });
}

export async function stepHeading(page: Page, name: string): Promise<void> {
  await expect(page.getByRole('heading', { level: 2, name })).toBeVisible();
}

/**
 * The dashboard draws an application card first and fills in specialty and site names a moment
 * later; wait for the names before clicking an action so the click is not lost in that re-render.
 */
export async function dashboardReady(page: Page): Promise<void> {
  await expect(page.getByRole('main').getByRole('heading', { name: 'Preferences' }).first()).toBeVisible();
  await expect(page.getByRole('main').getByText('Hospital').first()).toBeVisible();
}
