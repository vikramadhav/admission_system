import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { DISPLAY_MODES, PlaygroundPage } from '../../support/playground';

for (const mode of DISPLAY_MODES) {
  test.describe(`select (${mode.theme}, ${mode.direction})`, () => {
    let playground: PlaygroundPage;

    test.beforeEach(async ({ page }) => {
      playground = new PlaygroundPage(page);
      await playground.open('select', mode);
    });

    test('has no WCAG 2.2 AA violations', async () => {
      await expectNoAccessibilityViolations(playground.page);
    });

    test('is named by its label, described by its description and writes the form value', async () => {
      const select = playground.preview.getByRole('combobox', { name: 'Program' });

      await expect(select).toHaveAccessibleDescription('Only programs open in this cycle are listed.');
      await expect(select).toHaveAttribute('required', '');

      await select.selectOption({ label: 'Fellowship' });
      await expect(playground.preview.getByTestId('select-value')).toHaveText('value: "fellowship"');
    });

    test('changes value with the keyboard', async () => {
      const select = playground.preview.getByRole('combobox', { name: 'Program' });

      await select.focus();
      await playground.page.keyboard.press('ArrowDown');

      await expect(playground.preview.getByTestId('select-value')).toHaveText('value: "internship"');
    });

    test('links the error message and marks the control invalid', async () => {
      const select = playground.preview.getByRole('combobox', { name: 'Program' });

      await playground.property('invalid').check();

      await expect(select).toHaveAttribute('aria-invalid', 'true');
      await expect(select).toHaveAccessibleDescription('Only programs open in this cycle are listed. Select a program.');
    });

    test('follows the disabled input and the form control disabled state', async () => {
      await playground.property('disabled').check();
      await expect(playground.preview.getByRole('combobox', { name: 'Program' })).toBeDisabled();
      await expect(playground.states.getByRole('combobox', { name: 'Disabled', exact: true })).toBeDisabled();
      await expect(playground.states.getByRole('combobox', { name: 'Disabled by input' })).toBeDisabled();
    });

    test('keeps a disabled option unavailable', async () => {
      const option = playground.preview.getByRole('option', { name: 'Certificate (closed)' });

      await expect(option).toBeDisabled();
    });
  });
}

test('select serves its real source and reflows at 320 pixels', async ({ page }) => {
  const playground = new PlaygroundPage(page);
  await page.setViewportSize({ width: 320, height: 800 });
  await playground.open('select', { theme: 'light', direction: 'ltr' });

  await playground.expectSourceFile('select/select.component.ts', 'implements ControlValueAccessor');
  await expectNoHorizontalScroll(page);
});
