import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { DISPLAY_MODES, PlaygroundPage } from '../../support/playground';

for (const mode of DISPLAY_MODES) {
  test.describe(`navigation (${mode.theme}, ${mode.direction})`, () => {
    test('breadcrumbs mark the current page and logos load', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('breadcrumbs', mode);
      await expectNoAccessibilityViolations(page);

      const trail = playground.preview.getByRole('navigation', { name: 'Breadcrumb' });
      await expect(trail.getByRole('listitem')).toHaveCount(4);
      await expect(trail.getByRole('link')).toHaveText(['Home', 'My applications', 'Medical application']);
      await expect(trail.locator('[aria-current="page"]')).toHaveText('Personal information');

      await playground.property('tone').selectOption({ label: 'light' });
      await expectNoAccessibilityViolations(page);

      const logos = page.getByRole('img', { name: 'Dubai Health' });
      await expect(logos).toHaveCount(4);
      const loaded = await logos.evaluateAll(images => images.every(image => (image as HTMLImageElement).naturalWidth > 0));
      expect(loaded).toBe(true);
    });

    test('app header marks the current page and opens the menu drawer on narrow screens', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await page.setViewportSize({ width: 1280, height: 900 });
      await playground.open('app-header', mode);
      await expectNoAccessibilityViolations(page);

      const header = playground.preview.locator('dahc-app-header').first();
      const nav = header.getByRole('navigation', { name: 'Main' });
      await expect(nav.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('aria-current', 'page');
      await header.getByRole('button', { name: 'Notifications' }).click();
      await expect(playground.outputs().getByRole('listitem').first()).toHaveText('notificationsOpened');
      await expect(header.getByRole('button', { name: 'Menu' })).toBeHidden();

      await page.setViewportSize({ width: 600, height: 900 });
      await expect(nav).toBeHidden();
      await header.getByRole('button', { name: 'Menu' }).click();
      const drawer = page.getByRole('dialog', { name: 'GME Admissions' });
      await expect(drawer).toBeVisible();
      await expect(drawer.getByRole('link', { name: 'My applications' })).toBeVisible();
      await expectNoAccessibilityViolations(page);

      await drawer.getByRole('button', { name: 'Sign out' }).click();
      await expect(drawer).toBeHidden();
      await expect(playground.outputs().getByRole('listitem').first()).toHaveText('signOut');
    });

    test('page header shows breadcrumbs, meta and status', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('page-header', mode);
      await expectNoAccessibilityViolations(page);

      await expect(playground.preview.getByRole('navigation', { name: 'Breadcrumb' })).toBeVisible();
      await expect(playground.preview.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeVisible();
      await expect(playground.preview.locator('dl')).toContainText('GME-2026-000142');
      await expect(playground.preview.locator('dahc-tag')).toHaveText('Draft');
    });

    test('footer has its landmark, links, phone and named social links', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('footer', mode);
      await expectNoAccessibilityViolations(page);

      const footer = playground.preview.locator('footer.dahc-footer');
      await expect(footer.getByRole('navigation', { name: 'Footer' }).getByRole('link')).toHaveCount(5);
      await expect(footer.getByRole('link', { name: '800 60' })).toHaveAttribute('href', 'tel:80060');
      await expect(footer.getByRole('link', { name: 'Dubai Health on LinkedIn' })).toBeVisible();
    });

    test('wizard stepper navigates back, shows sub-steps and the step header follows', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('wizard', mode);
      await expectNoAccessibilityViolations(page);

      const stepper = playground.preview.getByRole('navigation', { name: 'Application steps' });
      await expect(stepper.locator('[aria-current="step"]').first()).toContainText('Personal information');
      await expect(stepper.getByRole('button', { name: /Contact information/ })).toHaveAttribute('aria-current', 'step');
      await expect(stepper.getByRole('button', { name: /Portfolio/ })).toHaveCount(0);
      await expect(playground.preview.getByText('Step 3 of 7')).toBeVisible();

      await stepper.getByRole('button', { name: /Application information/ }).click();
      await expect(playground.preview.getByText('Step 2 of 7')).toBeVisible();
      await expect(playground.preview.getByRole('heading', { level: 2, name: 'Application information' })).toBeVisible();

      await playground.preview.getByRole('group', { name: 'Step actions' }).getByRole('button', { name: 'Next' }).click();
      await expect(playground.preview.getByText('Step 3 of 7')).toBeVisible();

      await playground.property('University grades has an error').check();
      await expect(stepper.getByRole('button', { name: /University grades \(Needs attention\)/ })).toBeVisible();
    });
  });
}

test('navigation pages reflow at 320 pixels', async ({ page }) => {
  const playground = new PlaygroundPage(page);
  await page.setViewportSize({ width: 320, height: 800 });

  for (const path of ['breadcrumbs', 'app-header', 'page-header', 'footer', 'wizard']) {
    await playground.open(path, { theme: 'light', direction: 'ltr' });
    await expectNoHorizontalScroll(page);
  }
});
