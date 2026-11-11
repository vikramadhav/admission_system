import { Locator, Page } from '@playwright/test';

/** Candidate dashboard (US-1.2.1). */
export class DashboardPage {
  readonly heading: Locator;
  readonly inbox: Locator;
  readonly emptyStateHeading: Locator;
  readonly startNewApplication: Locator;
  readonly sessionTimeoutNote: Locator;
  readonly signOut: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { level: 1, name: 'Dashboard' });
    this.inbox = page.getByRole('region', { name: 'Your applications' });
    this.emptyStateHeading = this.inbox.getByRole('heading', { name: 'You have no applications yet' });
    this.startNewApplication = page.getByRole('main').getByRole('link', { name: 'Start new application' }).first();
    this.sessionTimeoutNote = page.getByText('For your security, your session ends after', { exact: false });
    this.signOut = page.getByRole('banner').getByRole('button', { name: 'Sign out' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/dashboard');
  }

  disabledStartButton(): Locator {
    return this.page.getByRole('button', { name: 'Start new application' });
  }

  application(applicationNumber: string): Locator {
    return this.inbox.getByRole('article', { name: applicationNumber });
  }

  async resume(applicationNumber: string): Promise<void> {
    await this.application(applicationNumber).getByRole('link', { name: 'Resume draft' }).click();
  }
}
