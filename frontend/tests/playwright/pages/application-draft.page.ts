import { Locator, Page } from '@playwright/test';

export type PreferenceNumber = 1 | 2;

/** Program & Preferences, the first wizard step (US-1.3.1; Figma 1:2189). */
export class ApplicationDraftPage {
  readonly main: Locator;
  readonly program: Locator;
  readonly next: Locator;
  readonly saveDraft: Locator;
  readonly loadLatestVersion: Locator;

  constructor(readonly page: Page) {
    this.main = page.getByRole('main');
    this.program = this.main.getByRole('combobox', { name: 'Program' });
    this.next = page.getByRole('group', { name: 'Step actions' }).getByRole('button', { name: /^Next/ });
    this.saveDraft = page.getByRole('group', { name: 'Step actions' }).getByRole('button', { name: 'Save As Draft' });
    this.loadLatestVersion = this.main.getByRole('button', { name: 'Load the latest version' });
  }

  heading(name: string): Locator {
    return this.page.getByRole('heading', { level: 1, name });
  }

  preference(preference: PreferenceNumber): Locator {
    return this.main.locator('dahc-preference-card').nth(preference - 1);
  }

  specialty(preference: PreferenceNumber): Locator {
    return this.preference(preference).getByRole('combobox', { name: 'Specialty' });
  }

  sites(preference: PreferenceNumber): Locator {
    return this.preference(preference).getByRole('group', { name: 'Training sites' });
  }

  async chooseProgram(name: string): Promise<void> {
    await this.program.selectOption({ label: name });
  }

  async choosePreference(preference: PreferenceNumber, specialty: string, sites: readonly string[]): Promise<void> {
    await this.specialty(preference).selectOption({ label: specialty });

    for (const site of sites) {
      await this.sites(preference).getByRole('checkbox', { name: site }).check();
    }
  }

  async moveSiteUp(preference: PreferenceNumber, site: string): Promise<void> {
    await this.sites(preference).getByRole('button', { name: `Move ${site} up` }).click();
  }
}
