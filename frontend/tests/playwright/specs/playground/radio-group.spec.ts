import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { DISPLAY_MODES, PlaygroundPage } from '../../support/playground';

const QUESTION = 'Have you completed an internship?';

for (const mode of DISPLAY_MODES) {
  test.describe(`radio group (${mode.theme}, ${mode.direction})`, () => {
    let playground: PlaygroundPage;

    test.beforeEach(async ({ page }) => {
      playground = new PlaygroundPage(page);
      await playground.open('radio-group', mode);
    });

    test('has no WCAG 2.2 AA violations', async () => {
      await expectNoAccessibilityViolations(playground.page);
    });

    test('is a named group whose choice moves with arrow keys and reaches the form', async () => {
      const group = playground.preview.getByRole('group', { name: QUESTION });

      await expect(group).toHaveAccessibleDescription('Include internships completed outside the UAE.');

      await group.getByRole('radio', { name: 'Yes' }).check();
      await expect(playground.page.getByTestId('form-value')).toHaveText('Form value: "yes"');

      await playground.page.keyboard.press('ArrowDown');
      await expect(group.getByRole('radio', { name: 'No' })).toBeChecked();
      await expect(playground.page.getByTestId('form-value')).toHaveText('Form value: "no"');
    });

    test('links the error to the group', async () => {
      await playground.property('invalid').check();
      const group = playground.preview.getByRole('group', { name: QUESTION });

      await expect(group).toHaveAttribute('aria-invalid', 'true');
      await expect(group).toHaveAccessibleDescription('Answer this question.');
    });

    test('disables options and whole groups', async () => {
      await expect(playground.states.getByRole('radio', { name: 'Not required' })).toBeDisabled();
      const disabledGroup = playground.states.getByRole('group', { name: 'Disabled group' });
      await expect(disabledGroup.getByRole('radio', { name: 'No' })).toBeChecked();
      await expect(disabledGroup.getByRole('radio', { name: 'Yes' })).toBeDisabled();
    });
  });
}

test('radio group serves its real source and reflows at 320 pixels', async ({ page }) => {
  const playground = new PlaygroundPage(page);
  await page.setViewportSize({ width: 320, height: 800 });
  await playground.open('radio-group', { theme: 'light', direction: 'ltr' });

  await playground.expectSourceFile('forms/radio-group/radio-group.component.ts', "selector: 'dahc-radio-group'");
  await expectNoHorizontalScroll(page);
});
