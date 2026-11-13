import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { DISPLAY_MODES, PlaygroundPage } from '../../support/playground';

// Data entry components ported from dubai-health-ui.

for (const mode of DISPLAY_MODES) {
  test.describe(`ported data entry (${mode.theme}, ${mode.direction})`, () => {
    test('input number steps with the buttons and the keyboard and clamps typed values', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('input-number', mode);
      await expectNoAccessibilityViolations(page);

      const field = playground.preview.getByRole('spinbutton', { name: 'Number of dependants' });
      await expect(field).toHaveValue('4');
      await playground.preview.getByRole('button', { name: 'Increase' }).click();
      await expect(page.getByTestId('form-value')).toHaveText('Form value: 5');

      await field.fill('25');
      await field.press('Tab');
      await expect(field).toHaveValue('10');
      await expect(page.getByTestId('form-value')).toHaveText('Form value: 10');
      await expect(playground.preview.getByRole('button', { name: 'Increase' })).toBeDisabled();
    });

    test('slider moves with arrow keys (mirrored in RTL) and the range thumbs cannot cross', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('slider', mode);
      await expectNoAccessibilityViolations(page);

      const volume = playground.preview.getByRole('slider', { name: 'Volume' });
      await expect(volume).toHaveAttribute('aria-valuetext', '40%');
      await volume.focus();
      await page.keyboard.press(mode.direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight');
      await expect(volume).toHaveAttribute('aria-valuenow', '41');
      await page.keyboard.press('End');
      await expect(page.getByTestId('form-value')).toHaveText('Form value: 100');

      const low = playground.preview.getByRole('slider', { name: 'Budget minimum' });
      const high = playground.preview.getByRole('slider', { name: 'Budget maximum' });
      await expect(high).toHaveAttribute('aria-valuemin', '200');
      await low.focus();
      await page.keyboard.press('End');
      await expect(low).toHaveAttribute('aria-valuenow', '600');
      await expect(page.getByTestId('range-value')).toHaveText('Range value: [600,600]');
      await page.keyboard.press('PageDown');
      await expect(low).toHaveAttribute('aria-valuetext', '100 AED');
    });

    test('rate is a radio group with a roving tab stop and clears on a second click', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('rate', mode);
      await expectNoAccessibilityViolations(page);

      const group = playground.preview.getByRole('radiogroup', { name: 'Rate your visit' });
      const third = group.getByRole('radio', { name: '3 of 5' });
      await expect(third).toHaveAttribute('aria-checked', 'true');
      await third.focus();
      await page.keyboard.press(mode.direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight');
      await expect(group.getByRole('radio', { name: '4 of 5' })).toBeFocused();
      await expect(page.getByTestId('form-value')).toHaveText('Form value: 4');

      await group.getByRole('radio', { name: '4 of 5' }).click();
      await expect(page.getByTestId('form-value')).toHaveText('Form value: 0');
      await expect(playground.states.getByRole('img', { name: 'Read-only rating: 4 of 5' })).toBeVisible();
    });

    test('segmented picks with arrow keys and skips the disabled option', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('segmented', mode);
      await expectNoAccessibilityViolations(page);

      const group = playground.preview.getByRole('radiogroup', { name: 'Period' });
      await expect(group.getByRole('radio', { name: 'Week' })).toBeChecked();
      await group.getByRole('radio', { name: 'Week' }).focus();
      await page.keyboard.press('ArrowDown');
      await expect(group.getByRole('radio', { name: 'Month' })).toBeChecked();
      await expect(page.getByTestId('form-value')).toHaveText('Form value: "month"');
      await expect(group.getByRole('radio', { name: 'Year' })).toBeDisabled();
    });

    test('time picker writes HH:MM', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('time-picker', mode);
      await expectNoAccessibilityViolations(page);

      const field = playground.preview.getByLabel('Appointment time');
      await expect(field).toHaveValue('09:30');
      await expect(field).toHaveAccessibleDescription('Between 07:00 and 20:00, every 15 minutes.');
      await field.fill('14:15');
      await expect(page.getByTestId('form-value')).toHaveText('Form value: "14:15"');
    });

    test('auto-complete suggests while typing and picks with the keyboard', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('auto-complete', mode);
      await expectNoAccessibilityViolations(page);

      const field = playground.preview.getByRole('combobox', { name: 'Hospital' });
      await field.fill('hos');
      await expect(field).toHaveAttribute('aria-expanded', 'true');
      const list = page.getByRole('listbox', { name: 'Suggestions' });
      await expect(list.getByRole('option')).toHaveText(['Rashid Hospital', 'Dubai Hospital', 'Latifa Hospital', 'Hatta Hospital', 'Al Jalila Children Hospital']);
      await expectNoAccessibilityViolations(page);

      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await expect(field).toHaveAttribute('aria-activedescendant', /-1$/);
      await page.keyboard.press('Enter');
      await expect(field).toHaveValue('Dubai Hospital');
      await expect(list).toBeHidden();
      await expect(page.getByTestId('form-value')).toHaveText('Form value: "Dubai Hospital"');

      await field.fill('My clinic');
      await expect(page.getByTestId('form-value')).toHaveText('Form value: "My clinic"');
    });

    test('cascader moves between columns with the keyboard and selects a leaf path', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('cascader', mode);
      await expectNoAccessibilityViolations(page);

      const field = playground.preview.getByRole('combobox', { name: 'Area' });
      await expect(field).toContainText('United Arab Emirates / Dubai / Deira');
      await field.focus();
      await page.keyboard.press('Enter');
      await expect(field).toHaveAttribute('aria-expanded', 'true');
      await expect(page.getByRole('listbox', { name: 'Level 3' })).toBeVisible();
      await expectNoAccessibilityViolations(page);

      const back = mode.direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
      const forward = mode.direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
      await page.keyboard.press(back);
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press(forward);
      await expect(page.getByRole('listbox', { name: 'Level 3' }).getByRole('option')).toHaveText([/Al Khan/, /Al Nahda/]);
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      await expect(field).toHaveAttribute('aria-expanded', 'false');
      await expect(field).toBeFocused();
      await expect(page.getByTestId('form-value')).toHaveText('Form value: ["ae","sharjah","nahda"]');
    });

    test('tree select opens into a tree, expands with the keyboard and selects a leaf', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('tree-select', mode);
      await expectNoAccessibilityViolations(page);

      const field = playground.preview.getByRole('combobox', { name: 'Department' });
      await expect(field).toContainText('Cardiology');
      await field.click();
      const tree = page.getByRole('tree', { name: 'Department' });
      await expect(tree.getByRole('treeitem', { name: 'Cardiology' })).toBeFocused();
      await expectNoAccessibilityViolations(page);

      const collapse = mode.direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
      const expand = mode.direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
      await page.keyboard.press(collapse);
      await expect(tree.getByRole('treeitem', { name: 'Medicine' })).toBeFocused();
      await page.keyboard.press(collapse);
      await expect(tree.getByRole('treeitem', { name: 'Medicine' })).toHaveAttribute('aria-expanded', 'false');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press(expand);
      await expect(tree.getByRole('treeitem', { name: 'Surgery', exact: true })).toHaveAttribute('aria-expanded', 'true');
      await page.keyboard.press(expand);
      await expect(tree.getByRole('treeitem', { name: 'General surgery' })).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(tree).toBeHidden();
      await expect(field).toBeFocused();
      await expect(page.getByTestId('form-value')).toHaveText('Form value: "general-surgery"');
    });

    test('color picker picks a swatch with the keyboard and applies a hex value', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('color-picker', mode);
      await expectNoAccessibilityViolations(page);

      const field = playground.preview.getByRole('combobox', { name: 'Brand colour' });
      await expect(field).toContainText('#002F70');
      await field.click();
      const dialog = page.getByRole('dialog', { name: 'Brand colour' });
      await expect(dialog.getByRole('option', { name: /^Navy #002F70/ })).toBeFocused();
      await expectNoAccessibilityViolations(page);

      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      await expect(dialog).toBeHidden();
      await expect(page.getByTestId('form-value')).toHaveText(/^Form value: "#[0-9a-f]{6}"$/);
      await expect(page.getByTestId('form-value')).not.toHaveText('Form value: "#002f70"');

      await field.click();
      await dialog.getByRole('textbox', { name: 'Hex value' }).fill('#abc');
      await dialog.getByRole('button', { name: 'Apply' }).click();
      await expect(page.getByTestId('form-value')).toHaveText('Form value: "#aabbcc"');
    });

    test('transfer checks items in a listbox and moves them', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('transfer', mode);
      await expectNoAccessibilityViolations(page);

      const source = playground.preview.getByRole('listbox', { name: 'Programmes' });
      const target = playground.preview.getByRole('listbox', { name: 'Assigned' });
      await expect(target.getByRole('option')).toHaveText(['Radiology']);
      await source.focus();
      await page.keyboard.press('Space');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Space');
      await expect(source.getByRole('option', { name: 'Psychiatry' })).toHaveAttribute('aria-selected', 'true');
      await playground.preview.getByRole('button', { name: 'Move to Assigned' }).click();
      await expect(page.getByTestId('form-value')).toHaveText('Form value: ["cardiology","radiology","psychiatry"]');
      await expect(playground.outputs().getByRole('listitem').first()).toHaveText('moved (to-target: cardiology, psychiatry)');

      await playground.preview.getByRole('checkbox', { name: 'Select all Assigned' }).click();
      await playground.preview.getByRole('button', { name: 'Move to Programmes' }).click();
      await expect(page.getByTestId('form-value')).toHaveText('Form value: []');
      await expectNoAccessibilityViolations(page);
    });

    test('mention suggests after @ and inserts the name', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('mention', mode);
      await expectNoAccessibilityViolations(page);

      const field = playground.preview.getByRole('combobox', { name: 'Comment' });
      await field.pressSequentially('Thanks @fa');
      await expect(field).toHaveAttribute('aria-expanded', 'true');
      await expect(page.getByRole('listbox', { name: 'Suggestions' }).getByRole('option')).toHaveText(['@Fatima Al Suwaidi']);
      await page.keyboard.press('Enter');
      await expect(field).toHaveValue('Thanks @Fatima Al Suwaidi ');
      await expect(page.getByTestId('form-value')).toHaveText('Form value: "Thanks @Fatima Al Suwaidi "');
      await expect(playground.outputs().getByRole('listitem').first()).toHaveText('mentioned (fatima)');
    });

    test('form layout places fields in two columns from 48rem', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await page.setViewportSize({ width: 1280, height: 900 });
      await playground.open('form-layout', mode);
      await expectNoAccessibilityViolations(page);

      const first = await playground.preview.getByRole('textbox', { name: 'First name' }).boundingBox();
      const last = await playground.preview.getByRole('textbox', { name: 'Last name' }).boundingBox();
      const email = await playground.preview.getByRole('textbox', { name: 'E-mail' }).boundingBox();
      expect(first?.y).toBe(last?.y);
      expect(email?.width ?? 0).toBeGreaterThan((first?.width ?? 0) * 1.5);
    });
  });
}

test('ported data entry pages reflow at 320 pixels', async ({ page }) => {
  const playground = new PlaygroundPage(page);
  await page.setViewportSize({ width: 320, height: 800 });

  for (const path of ['input-number', 'slider', 'rate', 'segmented', 'time-picker', 'auto-complete', 'cascader', 'tree-select', 'color-picker', 'transfer', 'mention', 'form-layout']) {
    await playground.open(path, { theme: 'light', direction: 'ltr' });
    await expectNoHorizontalScroll(page);
  }
});
