import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { DISPLAY_MODES, PlaygroundPage } from '../../support/playground';

for (const mode of DISPLAY_MODES) {
  test.describe(`form field (${mode.theme}, ${mode.direction})`, () => {
    let playground: PlaygroundPage;

    test.beforeEach(async ({ page }) => {
      playground = new PlaygroundPage(page);
      await playground.open('form-field', mode);
    });

    test('has no WCAG 2.2 AA violations', async () => {
      await expectNoAccessibilityViolations(playground.page);
    });

    test('labels the control, describes it with the hint and writes the form value', async () => {
      const input = playground.preview.getByRole('textbox', { name: 'Email address' });

      await expect(input).toHaveAccessibleDescription('We send your application receipt here.');
      await expect(input).toHaveAttribute('aria-required', 'true');

      await input.fill('aisha@example.com');
      await expect(playground.page.getByTestId('form-value')).toHaveText('Form value: "aisha@example.com"');
    });

    test('shows the error after the required field is left empty, replacing the hint', async () => {
      const input = playground.preview.getByRole('textbox', { name: 'Email address' });

      await input.focus();
      await input.blur();

      await expect(input).toHaveAttribute('aria-invalid', 'true');
      await expect(input).toHaveAccessibleDescription('Enter your email address.');

      await input.fill('aisha@example.com');
      await expect(input).not.toHaveAttribute('aria-invalid');
      await expect(input).toHaveAccessibleDescription('We send your application receipt here.');
    });

    test('draws the focus ring around the field box and darkens its border (dubai-health-ui)', async () => {
      const input = playground.preview.getByRole('textbox', { name: 'Email address' });
      const box = playground.preview.locator('.dahc-form-field__box');
      const restingBorder = await box.evaluate((el) => getComputedStyle(el).borderTopColor);

      await input.focus();
      await expect(box).toHaveCSS('outline-style', 'solid');
      await expect(box).toHaveCSS('outline-width', '2px');
      await expect(box).not.toHaveCSS('border-top-color', restingBorder);
    });

    test('shows a character counter with showCount', async () => {
      const counter = playground.states.getByRole('textbox', { name: 'Appeal response' });

      await expect(counter).toHaveAccessibleDescription(/0 \/ 200/);
      await counter.fill('Stamped page');
      await expect(playground.states.getByText('12 / 200')).toBeVisible();
    });

    test('supports textarea, read-only and disabled controls', async () => {
      await playground.property('control type').selectOption({ label: 'textarea' });
      await expect(playground.preview.locator('textarea')).toHaveAccessibleName('Email address');

      await expect(playground.states.getByRole('textbox', { name: 'Emirates ID' })).toHaveAttribute('readonly', '');
      await expect(playground.states.getByRole('textbox', { name: 'Emirates ID' })).toHaveAccessibleDescription('Verified via ICP');
      await expect(playground.states.getByRole('textbox', { name: 'Disabled' })).toBeDisabled();

      await playground.property('disabled').check();
      await expect(playground.preview.locator('textarea')).toBeDisabled();
    });
  });
}

test('the field box follows Figma Input field 50:7763', async ({ page }) => {
  const playground = new PlaygroundPage(page);
  await page.setViewportSize({ width: 1280, height: 900 });
  await playground.open('form-field', { theme: 'light', direction: 'ltr' });

  const box = playground.states.locator('dahc-form-field', { hasText: 'Default (placeholder)' }).locator('.dahc-form-field__box');
  const height = await box.evaluate(element => element.getBoundingClientRect().height);

  expect(height).toBe(48);
  await expect(box).toHaveCSS('border-radius', '12px');
  await expect(box).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(playground.states.getByRole('textbox', { name: 'Default (placeholder)' })).toHaveCSS('font-size', '16px');
});

test('form field serves its real source and reflows at 320 pixels', async ({ page }) => {
  const playground = new PlaygroundPage(page);
  await page.setViewportSize({ width: 320, height: 800 });
  await playground.open('form-field', { theme: 'light', direction: 'ltr' });

  await playground.expectSourceFile('forms/input/input.directive.ts', "selector: 'input[dahcInput], textarea[dahcInput], select[dahcInput], button[dahcInput]'");
  await expectNoHorizontalScroll(page);
});
