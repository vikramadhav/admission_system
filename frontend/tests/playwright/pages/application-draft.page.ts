import { Locator, Page } from '@playwright/test';

export type PreferenceNumber = 1 | 2;

/** New application and resumed draft (US-1.3.1, US-1.3.11). */
export class ApplicationDraftPage {
  readonly program: Locator;
  readonly createDraft: Locator;
  readonly saveDraft: Locator;
  readonly loadLatestVersion: Locator;

  constructor(readonly page: Page) {
    this.program = page.getByRole('combobox', { name: 'Program' });
    this.createDraft = page.getByRole('button', { name: 'Create draft' });
    this.saveDraft = page.getByRole('button', { name: 'Save draft' });
    this.loadLatestVersion = page.getByRole('button', { name: 'Load latest version' });
  }

  heading(name: string): Locator {
    return this.page.getByRole('heading', { level: 1, name });
  }

  specialty(preference: PreferenceNumber): Locator {
    const name = preference === 1 ? 'Preference 1' : 'Preference 2 (optional)';

    return this.page.getByRole('combobox', { name, exact: true });
  }

  sites(preference: PreferenceNumber): Locator {
    return this.page.getByRole('group', { name: `Preference ${preference} training sites` });
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
