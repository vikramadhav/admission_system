import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { DISPLAY_MODES, PlaygroundPage } from '../../support/playground';

for (const mode of DISPLAY_MODES) {
  test.describe(`overlays (${mode.theme}, ${mode.direction})`, () => {
    test('modal traps focus, closes with Escape and returns focus to its opener', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('modal', mode);

      const opener = playground.preview.getByRole('button', { name: 'Open modal' });
      await opener.click();
      const dialog = page.getByRole('dialog', { name: 'Submit your application?' });
      await expect(dialog).toBeVisible();
      await expectNoAccessibilityViolations(page);

      // The page behind is inert: Tab cycles through the dialog (and may visit the browser's own UI,
      // where activeElement is the body) but never reaches page content.
      for (let step = 0; step < 6; step++) {
        await page.keyboard.press('Tab');
        const focusIsSafe = await dialog.evaluate(
          element => element.contains(document.activeElement) || document.activeElement === document.body,
        );
        expect(focusIsSafe).toBe(true);
      }

      await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();
      await expect(opener).toBeFocused();
      await expect(playground.outputs().getByRole('listitem').first()).toHaveText('closeRequested (escape)');
    });

    test('modal closing can be cancelled, and the close button closes it', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('modal', mode);

      await playground.property('cancel closing (unsaved changes)').check();
      await playground.preview.getByRole('button', { name: 'Open modal' }).click();
      const dialog = page.getByRole('dialog', { name: 'Submit your application?' });

      await dialog.getByRole('button', { name: 'Close', exact: true }).click();
      await expect(dialog).toBeVisible();
      await expect(playground.outputs().getByRole('listitem').first()).toHaveText('close cancelled');

      await playground.page.keyboard.press('Escape');
      await expect(dialog).toBeVisible();

      await dialog.getByRole('button', { name: 'Keep editing' }).click();
      await expect(dialog).toBeHidden();
    });

    test('drawer opens from the end edge in the reading direction', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('drawer', mode);

      await playground.preview.getByRole('button', { name: 'Open drawer' }).click();
      const drawer = page.getByRole('dialog', { name: 'Filter applications' });
      await expect(drawer).toBeVisible();
      await expectNoAccessibilityViolations(page);

      const box = await drawer.boundingBox();
      const viewport = page.viewportSize();
      const touchesRight = Math.round((box?.x ?? 0) + (box?.width ?? 0)) === viewport?.width;
      expect(touchesRight).toBe(mode.direction === 'ltr');

      await drawer.getByRole('button', { name: 'Apply' }).click();
      await expect(drawer).toBeHidden();
    });

    test('tooltip shows on focus, describes its element and hides with Escape', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('tooltip', mode);

      const trigger = playground.preview.getByRole('button', { name: 'Portfolio points' });
      await trigger.focus();
      const tooltip = page.getByRole('tooltip');
      await expect(tooltip).toBeVisible();
      await expect(tooltip).toHaveText('Points are added to your portfolio score.');
      await expect(trigger).toHaveAccessibleDescription('Points are added to your portfolio score.');
      await expectNoAccessibilityViolations(page);

      await page.keyboard.press('Escape');
      await expect(tooltip).toBeHidden();
      await expect(trigger).toBeFocused();
    });

    test('menu opens with the keyboard, moves with arrows, skips disabled items and chooses', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('menu', mode);

      const trigger = playground.preview.getByRole('button', { name: 'Actions' });
      await trigger.focus();
      await page.keyboard.press('ArrowDown');

      const menu = page.getByRole('menu', { name: 'Actions' });
      await expect(menu).toBeVisible();
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
      await expect(menu.getByRole('menuitem', { name: 'View application' })).toBeFocused();
      await expectNoAccessibilityViolations(page);

      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await expect(menu.getByRole('menuitem', { name: 'Withdraw application' })).toBeFocused();

      await page.keyboard.press('Enter');
      await expect(menu).toBeHidden();
      await expect(trigger).toBeFocused();
      await expect(playground.outputs().getByRole('listitem').first()).toHaveText('itemSelected (withdraw)');

      await page.keyboard.press('Enter');
      await expect(menu).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(menu).toBeHidden();
      await expect(trigger).toBeFocused();
    });
  });
}

test('overlay pages reflow at 320 pixels and the modal fits the screen', async ({ page }) => {
  const playground = new PlaygroundPage(page);
  await page.setViewportSize({ width: 320, height: 700 });

  for (const path of ['modal', 'drawer', 'tooltip', 'menu']) {
    await playground.open(path, { theme: 'light', direction: 'ltr' });
    await expectNoHorizontalScroll(page);
  }

  await playground.open('modal', { theme: 'light', direction: 'ltr' });
  await playground.preview.getByRole('button', { name: 'Open modal' }).click();
  const box = await page.getByRole('dialog', { name: 'Submit your application?' }).boundingBox();
  expect(box?.x).toBeGreaterThanOrEqual(0);
  expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(320);
});
