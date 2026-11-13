import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { DISPLAY_MODES, PlaygroundPage } from '../../support/playground';

const LABEL = 'I confirm the information I provided is accurate.';

for (const mode of DISPLAY_MODES) {
  test.describe(`checkbox (${mode.theme}, ${mode.direction})`, () => {
    let playground: PlaygroundPage;

    test.beforeEach(async ({ page }) => {
      playground = new PlaygroundPage(page);
      await playground.open('checkbox', mode);
    });

    test('has no WCAG 2.2 AA violations', async () => {
      await expectNoAccessibilityViolations(playground.page);
    });

    test('toggles with Space and with a click on its label, and writes the form value', async () => {
      const checkbox = playground.preview.getByRole('checkbox', { name: LABEL });

      await checkbox.focus();
      await playground.page.keyboard.press('Space');
      await expect(checkbox).toBeChecked();
      await expect(playground.page.getByTestId('form-value')).toHaveText('Form value: true');

      await playground.preview.getByText(LABEL).click();
      await expect(checkbox).not.toBeChecked();
      await expect(playground.page.getByTestId('form-value')).toHaveText('Form value: false');
    });

    test('shows indeterminate, invalid and disabled states', async () => {
      await expect(playground.states.getByRole('checkbox', { name: 'Indeterminate' })).toHaveJSProperty('indeterminate', true);
      await expect(playground.states.getByRole('checkbox', { name: 'Invalid' })).toHaveAttribute('aria-invalid', 'true');
      await expect(playground.states.getByRole('checkbox', { name: 'Disabled and checked' })).toBeDisabled();
      await expect(playground.states.getByRole('checkbox', { name: 'Disabled and checked' })).toBeChecked();
    });

    test('shows a focus ring on the box', async () => {
      const checkbox = playground.preview.getByRole('checkbox', { name: LABEL });

      await checkbox.focus();
      await playground.page.keyboard.press('Shift+Tab');
      await playground.page.keyboard.press('Tab');
      await expect(playground.preview.locator('.dahc-checkbox__box')).not.toHaveCSS('outline-style', 'none');
    });
  });
}

test('checkbox serves its real source and reflows at 320 pixels', async ({ page }) => {
  const playground = new PlaygroundPage(page);
  await page.setViewportSize({ width: 320, height: 800 });
  await playground.open('checkbox', { theme: 'light', direction: 'ltr' });

  await playground.expectSourceFile('forms/checkbox/checkbox.component.ts', "selector: 'dahc-checkbox'");
  await expectNoHorizontalScroll(page);
});
