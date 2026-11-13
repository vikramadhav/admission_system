import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { DISPLAY_MODES, PlaygroundPage } from '../../support/playground';

for (const mode of DISPLAY_MODES) {
  test.describe(`forms B (${mode.theme}, ${mode.direction})`, () => {
    test('multi-select opens, filters, toggles with the keyboard and keeps option order', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('multi-select', mode);
      await expectNoAccessibilityViolations(page);

      const field = playground.preview.getByRole('combobox', { name: 'Training sites' });
      await expect(field).toContainText('Dubai Hospital');
      await field.focus();
      await page.keyboard.press('ArrowDown');
      await expect(field).toHaveAttribute('aria-expanded', 'true');

      const search = page.getByRole('combobox', { name: 'Search options' });
      await expect(search).toBeFocused();
      await expectNoAccessibilityViolations(page);

      await search.fill('ras');
      const list = page.getByRole('listbox', { name: 'Training sites' });
      await expect(list.getByRole('option')).toHaveText(['Rashid Hospital']);
      await page.keyboard.press('Enter');
      await expect(list.getByRole('option', { name: 'Rashid Hospital' })).toHaveAttribute('aria-selected', 'true');
      await expect(page.getByTestId('form-value')).toHaveText('Form value: ["rashid","dubai"]');

      await search.fill('');
      await list.getByRole('option', { name: 'Latifa Hospital' }).click();
      await expect(page.getByTestId('form-value')).toHaveText('Form value: ["rashid","dubai","latifa"]');

      await page.keyboard.press('Escape');
      await expect(list).toBeHidden();
      await expect(field).toBeFocused();
      await expect(field).toContainText('Rashid Hospital, Dubai Hospital, Latifa Hospital');
    });

    test('phone input writes an international number and validates its length', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('phone-input', mode);
      await expectNoAccessibilityViolations(page);

      const number = playground.preview.getByRole('textbox', { name: 'Mobile number' });
      const country = playground.preview.getByRole('combobox', { name: 'Country code' });
      await expect(number).toHaveValue('501234567');
      await expect(country).toHaveValue('AE');

      await country.selectOption('SA');
      await number.fill('55 123 4567');
      await expect(page.getByTestId('form-value')).toHaveText('Form value: "+966551234567"');

      await number.fill('123');
      await number.blur();
      await expect(number).toHaveAttribute('aria-invalid', 'true');
      await expect(page.getByTestId('form-errors')).toContainText('dahcPhone');
    });

    test('file upload accepts a valid file, refuses wrong types and sizes, and removes', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('file-upload', mode);
      await expectNoAccessibilityViolations(page);

      const slot = playground.preview.getByRole('group', { name: /Passport copy/ });
      const input = slot.locator('input[type="file"]');
      const choose = slot.getByRole('button', { name: 'Choose file' });
      await expect(choose).toHaveAccessibleDescription('PDF, JPG or PNG, up to 2 MB.');

      await input.setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') });
      await expect(slot.getByText('This file type is not allowed.')).toBeVisible();
      await expect(page.getByTestId('form-value')).toHaveText('Form value: null');

      await input.setInputFiles({ name: 'huge.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(3 * 1024 * 1024) });
      await expect(slot.getByText('This file is too large.')).toBeVisible();

      await input.setInputFiles({ name: 'passport.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(150 * 1024) });
      await expect(slot.getByText('passport.pdf', { exact: true })).toBeVisible();
      await expect(slot.getByText('Uploaded', { exact: true })).toBeVisible();
      await expect(page.getByTestId('form-value')).toHaveText(`Form value: passport.pdf (${150 * 1024} bytes)`);
      await expectNoAccessibilityViolations(page);

      await slot.getByRole('button', { name: 'Preview' }).click();
      await expect(playground.outputs().getByRole('listitem').first()).toHaveText('previewRequested (passport.pdf)');

      await slot.getByRole('button', { name: 'Remove file passport.pdf' }).click();
      await expect(slot.getByRole('button', { name: 'Choose file' })).toBeVisible();
      await expect(page.getByTestId('form-value')).toHaveText('Form value: null');
    });
  });
}

test('forms B pages reflow at 320 pixels', async ({ page }) => {
  const playground = new PlaygroundPage(page);
  await page.setViewportSize({ width: 320, height: 800 });

  for (const path of ['multi-select', 'phone-input', 'file-upload']) {
    await playground.open(path, { theme: 'light', direction: 'ltr' });
    await expectNoHorizontalScroll(page);
  }
});
