import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { DISPLAY_MODES, PlaygroundPage } from '../../support/playground';

// Feedback components ported from dubai-health-ui: progress, spinner, skeleton, result, message,
// notification, popover, popconfirm and the config provider.

for (const mode of DISPLAY_MODES) {
  test.describe(`ported feedback (${mode.theme}, ${mode.direction})`, () => {
    test('progress exposes its value as a named progressbar, as a bar and a ring', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('progress', mode);
      await expectNoAccessibilityViolations(page);

      const bar = playground.preview.getByRole('progressbar', { name: 'Application progress' });
      await expect(bar).toHaveAttribute('aria-valuenow', '60');
      await expect(bar).toHaveAttribute('aria-valuemax', '100');
      await expect(playground.preview.getByText('60%')).toBeVisible();
      await expect(playground.states.getByRole('progressbar', { name: 'Documents uploaded' })).toHaveAttribute('aria-valuemax', '8');

      await playground.property('type').selectOption({ label: 'circle' });
      await expect(playground.preview.locator('svg')).toBeVisible();
      await expect(playground.preview.getByRole('progressbar', { name: 'Application progress' })).toHaveAttribute('aria-valuenow', '60');
      await expectNoAccessibilityViolations(page);
    });

    test('spinner and skeleton announce loading without exposing the shapes', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('spinner', mode);
      await expectNoAccessibilityViolations(page);
      await expect(playground.preview.getByRole('status')).toHaveText('Loading your applications');
      expect(await playground.states.locator('.dahc-spinner__ring').nth(2).evaluate(ring => (ring as HTMLElement).offsetWidth)).toBe(48);

      await playground.open('skeleton', mode);
      await expectNoAccessibilityViolations(page);
      const skeleton = playground.preview.locator('dahc-skeleton');
      await expect(skeleton).toHaveAttribute('aria-busy', 'true');
      await expect(skeleton.getByRole('status')).toHaveText('Loading content');
      await expect(skeleton.locator('.dahc-skeleton__line')).toHaveCount(4);
      await playground.property('rows').selectOption({ label: '5' });
      await expect(skeleton.locator('.dahc-skeleton__line')).toHaveCount(6);
    });

    test('result announces the outcome with a heading and actions', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('result', mode);
      await expectNoAccessibilityViolations(page);

      await expect(playground.preview.getByRole('heading', { level: 2, name: 'Your application has been submitted' })).toBeVisible();
      await expect(playground.preview.getByRole('status')).toContainText('Your application has been submitted');
      await expect(playground.preview.getByRole('button', { name: 'Go to dashboard' })).toBeVisible();
      await expect(playground.states.getByRole('alert')).toContainText('Payment failed');
      await expect(playground.states.getByRole('heading', { level: 3, name: 'Payment failed' })).toBeVisible();
    });

    test('message shows at the top centre, is announced and can be dismissed', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('message', mode);

      await playground.preview.getByRole('button', { name: 'Show message' }).click();
      const region = page.getByRole('region', { name: 'Messages' });
      const message = region.getByRole('listitem');
      await expect(message).toContainText('Copied to clipboard');
      await expect(region.locator('[aria-live="polite"]')).toHaveCount(1);
      await expectNoAccessibilityViolations(page);

      const box = await message.boundingBox();
      const viewport = page.viewportSize();
      expect(Math.abs((box?.x ?? 0) + (box?.width ?? 0) / 2 - (viewport?.width ?? 0) / 2)).toBeLessThan(4);

      await message.getByRole('button', { name: 'Dismiss message' }).click();
      await expect(message).toHaveCount(0);

      await playground.property('variant').selectOption({ label: 'error' });
      await playground.property('duration (ms, 0 = until dismissed)').selectOption({ label: '1500' });
      await playground.preview.getByRole('button', { name: 'Show message' }).click();
      await expect(region.getByRole('alert')).toBeVisible();
      await expect(region.getByRole('alert')).toBeHidden({ timeout: 4000 });
    });

    test('notification card is announced, pauses while hovered and can be dismissed', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('notification', mode);

      await playground.preview.getByRole('button', { name: 'Show notification' }).click();
      const region = page.getByRole('region', { name: 'Notifications' });
      const card = region.getByRole('listitem');
      await expect(card).toContainText('Score announced');
      await expectNoAccessibilityViolations(page);
      await card.getByRole('button', { name: 'Dismiss notification' }).click();
      await expect(card).toHaveCount(0);

      await playground.property('variant').selectOption({ label: 'error' });
      await playground.property('duration (ms, 0 = until dismissed)').selectOption({ label: '1500' });
      await playground.preview.getByRole('button', { name: 'Show notification' }).click();
      const errorCard = region.getByRole('alert');
      await expect(errorCard).toBeVisible();
      await errorCard.hover();
      await page.waitForTimeout(2000);
      await expect(errorCard).toBeVisible();
      await page.mouse.move(0, 0);
      await expect(errorCard).toBeHidden({ timeout: 4000 });
    });

    test('popover opens a labelled dialog, closes on Escape and returns focus', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('popover', mode);

      const trigger = playground.preview.getByRole('button', { name: 'Portfolio points' });
      await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
      await trigger.click();

      const dialog = page.getByRole('dialog', { name: 'How points work' });
      await expect(dialog).toBeVisible();
      await expect(dialog).toBeFocused();
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
      await expect(playground.outputs().getByRole('listitem').first()).toHaveText('opened');
      await expectNoAccessibilityViolations(page);

      await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();
      await expect(trigger).toBeFocused();

      await trigger.click();
      await expect(dialog).toBeVisible();
      await page.mouse.click(2, 2);
      await expect(dialog).toBeHidden();
    });

    test('popconfirm focuses the confirm button and reports the answer', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('popconfirm', mode);

      const trigger = playground.preview.getByRole('button', { name: 'Remove CV' });
      await trigger.click();
      const dialog = page.getByRole('alertdialog', { name: 'Remove this document?' });
      await expect(dialog).toBeVisible();
      await expect(dialog).toHaveAccessibleDescription('You can upload a new file afterwards.');
      await expect(dialog.getByRole('button', { name: 'Remove' })).toBeFocused();
      await expectNoAccessibilityViolations(page);

      await page.keyboard.press('Enter');
      await expect(dialog).toBeHidden();
      await expect(trigger).toBeFocused();
      await expect(playground.outputs().getByRole('listitem').first()).toHaveText('confirmed');

      await trigger.click();
      await dialog.getByRole('button', { name: 'Keep' }).click();
      await expect(playground.outputs().getByRole('listitem').first()).toHaveText('cancelled');

      await trigger.click();
      await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();
      await expect(trigger).toBeFocused();
    });

    test('config provider sets lang, direction and motion for its region', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('config-provider', mode);
      await expectNoAccessibilityViolations(page);

      const provider = playground.preview.locator('dahc-config-provider');
      await expect(provider).toHaveAttribute('lang', 'ar-AE');
      await expect(provider).toHaveAttribute('dir', 'rtl');

      await playground.property('locale').selectOption({ label: 'en-AE' });
      await expect(provider).toHaveAttribute('dir', 'ltr');

      await playground.property('reducedMotion').check();
      const duration = await provider.evaluate(element => getComputedStyle(element).getPropertyValue('--dahc-motion-duration-normal').trim());
      expect(duration).toBe('0ms');
    });
  });
}

test('ported feedback pages reflow at 320 pixels', async ({ page }) => {
  const playground = new PlaygroundPage(page);
  await page.setViewportSize({ width: 320, height: 800 });

  for (const path of ['progress', 'spinner', 'skeleton', 'result', 'message', 'notification', 'popover', 'popconfirm', 'config-provider']) {
    await playground.open(path, { theme: 'light', direction: 'ltr' });
    await expectNoHorizontalScroll(page);
  }
});
