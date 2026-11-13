import { Locator, Page } from '@playwright/test';

/** Candidate dashboard (US-1.2.1; Figma 1:5928 and 1:1938). */
export class DashboardPage {
  readonly main: Locator;
  readonly firstTimeHeading: Locator;
  readonly startNewApplication: Locator;
  readonly sessionTimeoutNote: Locator;
  readonly signOut: Locator;

  constructor(readonly page: Page) {
    this.main = page.getByRole('main');
    this.firstTimeHeading = this.main.getByRole('heading', { name: 'Your next chapter starts here' });
    this.startNewApplication = this.main.getByRole('link', { name: 'Start New Application' }).first();
    this.sessionTimeoutNote = this.main.getByText('For your security', { exact: false });
    this.signOut = page.getByRole('banner').getByRole('button', { name: 'Sign out' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/candidate/dashboard');
  }

  heading(name: string): Locator {
    return this.page.getByRole('heading', { level: 1, name });
  }

  disabledStartButton(): Locator {
    return this.page.getByRole('button', { name: 'Start New Application' });
  }
}
