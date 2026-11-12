import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { DISPLAY_MODES, PlaygroundPage } from '../../support/playground';

for (const mode of DISPLAY_MODES) {
  test.describe(`ranked selection (${mode.theme}, ${mode.direction})`, () => {
    let playground: PlaygroundPage;

    test.beforeEach(async ({ page }) => {
      playground = new PlaygroundPage(page);
      await playground.open('ranked-selection', mode);
    });

    test('has no WCAG 2.2 AA violations', async () => {
      await expectNoAccessibilityViolations(playground.page);
    });

    test('groups the options under the label and adds chosen options to the end of the order', async () => {
      const group = playground.preview.getByRole('group', { name: 'Preference 1 training sites' });

      await expect(group).toHaveAccessibleDescription('Choose one or more sites, then put them in your order of preference.');
      await group.getByRole('checkbox', { name: 'Latifa Hospital' }).check();
      await expect(playground.preview.getByTestId('ranked-value')).toHaveText('value: ["dubai","rashid","latifa"]');

      await group.getByRole('checkbox', { name: 'Dubai Hospital' }).uncheck();
      await expect(playground.preview.getByTestId('ranked-value')).toHaveText('value: ["rashid","latifa"]');
      await expect(group.getByRole('checkbox', { name: 'Hatta Hospital' })).toBeDisabled();
    });

    test('moves an item with the keyboard, keeps focus on it and announces the new position', async () => {
      const order = playground.preview.getByRole('list', { name: 'Your order of preference' });
      const moveUp = order.getByRole('button', { name: 'Move Rashid Hospital up' });

      await moveUp.focus();
      await playground.page.keyboard.press('Enter');

      await expect(playground.preview.getByTestId('ranked-value')).toHaveText('value: ["rashid","dubai"]');
      await expect(order.getByRole('listitem').first()).toContainText('Rashid Hospital');
      await expect(order.getByRole('button', { name: 'Move Rashid Hospital down' })).toBeFocused();
      await expect(playground.page.locator('[data-dahc-live-region="polite"]')).toHaveText(
        'Rashid Hospital moved to position 1 of 2',
      );
    });

    test('keeps the end buttons focusable but inactive', async () => {
      const order = playground.preview.getByRole('list', { name: 'Your order of preference' });
      const firstUp = order.getByRole('button', { name: 'Move Dubai Hospital up' });

      await expect(firstUp).toHaveAttribute('aria-disabled', 'true');
      await firstUp.focus();
      await expect(firstUp).toBeFocused();
      await playground.page.keyboard.press('Enter');
      await expect(playground.preview.getByTestId('ranked-value')).toHaveText('value: ["dubai","rashid"]');
    });

    test('links the error message to the group', async () => {
      await playground.property('invalid').check();

      await expect(playground.preview.getByRole('group', { name: 'Preference 1 training sites' })).toHaveAccessibleDescription(
        'Choose one or more sites, then put them in your order of preference. Select at least one training site.',
      );
    });

    test('disables every choice when disabled', async () => {
      await playground.property('disabled').check();

      await expect(playground.preview.getByRole('checkbox', { name: 'Rashid Hospital' })).toBeDisabled();
      await expect(playground.preview.getByRole('button', { name: 'Move Rashid Hospital up' })).toBeDisabled();
    });
  });
}

test('ranked selection serves its real source and reflows at 320 pixels', async ({ page }) => {
  const playground = new PlaygroundPage(page);
  await page.setViewportSize({ width: 320, height: 800 });
  await playground.open('ranked-selection', { theme: 'light', direction: 'ltr' });

  await playground.expectSourceFile('ranked-selection/ranked-selection.component.ts', 'implements ControlValueAccessor');
  await expectNoHorizontalScroll(page);
});
