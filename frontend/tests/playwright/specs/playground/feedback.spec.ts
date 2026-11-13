import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { DISPLAY_MODES, PlaygroundPage } from '../../support/playground';

for (const mode of DISPLAY_MODES) {
  test.describe(`feedback (${mode.theme}, ${mode.direction})`, () => {
    test('tags meet contrast in every purpose and follow the Figma sizes', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('tag', mode);
      await expectNoAccessibilityViolations(page);

      const large = playground.preview.locator('dahc-tag');
      await expect(large).toHaveText('Draft');
      expect(Math.round((await large.boundingBox())?.height ?? 0)).toBe(36);

      await playground.property('size').selectOption({ label: 'md' });
      expect(Math.round((await large.boundingBox())?.height ?? 0)).toBe(30);
    });

    test('switch toggles with Space, reports on/off and writes the form value', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('switch', mode);
      await expectNoAccessibilityViolations(page);

      const control = playground.preview.getByRole('switch', { name: 'SMS reminders' });
      await expect(control).not.toBeChecked();
      await control.focus();
      await page.keyboard.press('Space');
      await expect(control).toBeChecked();
      await expect(page.getByTestId('form-value')).toHaveText('Form value: true');
      await expect(playground.states.getByRole('switch', { name: 'Disabled' })).toBeDisabled();
    });

    test('toast is announced, can be dismissed and pauses while hovered', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('toast', mode);

      await playground.preview.getByRole('button', { name: 'Show toast' }).click();
      const region = page.getByRole('region', { name: 'Notifications' });
      const toast = region.getByRole('listitem');
      await expect(toast).toHaveText(/Draft saved/);
      await expect(region.locator('[aria-live="polite"]')).toHaveCount(1);
      await expectNoAccessibilityViolations(page);

      await toast.getByRole('button', { name: 'Dismiss notification' }).click();
      await expect(toast).toHaveCount(0);

      await playground.property('duration (ms, 0 = until dismissed)').selectOption({ label: '1500' });
      await playground.property('variant').selectOption({ label: 'error' });
      await playground.preview.getByRole('button', { name: 'Show toast' }).click();
      const errorToast = region.getByRole('alert');
      await expect(errorToast).toBeVisible();
      await errorToast.hover();
      await page.waitForTimeout(2000);
      await expect(errorToast).toBeVisible();

      await page.mouse.move(0, 0);
      await expect(errorToast).toBeHidden({ timeout: 4000 });
    });

    test('alert conveys its type with an icon and hidden text, not colour alone', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('alert', mode);

      const alert = playground.preview.locator('dahc-alert');
      await expect(alert.locator('dahc-icon.dahc-alert__icon')).toHaveCount(1);
      await expect(alert.locator('.dahc-visually-hidden').first()).not.toBeEmpty();
    });
  });
}

test('feedback pages reflow at 320 pixels', async ({ page }) => {
  const playground = new PlaygroundPage(page);
  await page.setViewportSize({ width: 320, height: 800 });

  for (const path of ['tag', 'switch', 'toast']) {
    await playground.open(path, { theme: 'light', direction: 'ltr' });
    await expectNoHorizontalScroll(page);
  }
});
