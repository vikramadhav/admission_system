import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { DISPLAY_MODES, PlaygroundPage } from '../../support/playground';

/** A day button's accessible name in en-US ("March 14, 1997") or en-GB ("14 March 1997") form. */
function day(date: number, month: string, year: number): RegExp {
  return new RegExp(`${month} ${date}, ${year}|${date} ${month} ${year}`);
}

for (const mode of DISPLAY_MODES) {
  test.describe(`date picker (${mode.theme}, ${mode.direction})`, () => {
    let playground: PlaygroundPage;

    test.beforeEach(async ({ page }) => {
      playground = new PlaygroundPage(page);
      await playground.open('date-picker', mode);
    });

    test('has no WCAG 2.2 AA violations, closed and open', async () => {
      await expectNoAccessibilityViolations(playground.page);

      await playground.preview.getByRole('button', { name: 'Choose date' }).click();
      await expect(playground.page.getByRole('dialog', { name: 'Choose date' })).toBeVisible();
      await expectNoAccessibilityViolations(playground.page);
    });

    test('shows the value as DD/MM/YYYY and writes typed dates as ISO', async () => {
      const field = playground.preview.getByRole('textbox', { name: 'Date of birth' });

      await expect(field).toHaveValue('14/03/1997');
      await field.fill('02/07/1990');
      await field.press('Tab');

      await expect(playground.page.getByTestId('form-value')).toHaveText('Form value: "1990-07-02"');
    });

    test('rejects an unreadable date and a date outside min and max', async () => {
      const field = playground.preview.getByRole('textbox', { name: 'Date of birth' });

      await field.fill('31/02/1990');
      await field.press('Tab');
      await expect(field).toHaveAttribute('aria-invalid', 'true');
      await expect(field).toHaveAccessibleDescription('Enter a date as DD/MM/YYYY.');
      await expect(playground.page.getByTestId('form-errors')).toContainText('dahcDateFormat');

      await field.fill('01/01/2015');
      await field.press('Tab');
      await expect(field).toHaveAccessibleDescription('Choose a date on or before 31/12/2008.');
      await expect(playground.page.getByTestId('form-errors')).toContainText('dahcDateMax');
    });

    test('chooses a date from the calendar with the keyboard and returns focus', async () => {
      const toggle = playground.preview.getByRole('button', { name: 'Choose date' });
      await toggle.click();

      const dialog = playground.page.getByRole('dialog', { name: 'Choose date' });
      const focusedDay = dialog.getByRole('button', { name: day(14, 'March', 1997) });
      await expect(focusedDay).toBeFocused();

      await playground.page.keyboard.press('ArrowDown');
      await expect(dialog.getByRole('button', { name: day(21, 'March', 1997) })).toBeFocused();
      await playground.page.keyboard.press('Enter');

      await expect(dialog).toBeHidden();
      await expect(playground.page.getByTestId('form-value')).toHaveText('Form value: "1997-03-21"');
      await expect(playground.preview.getByRole('textbox', { name: 'Date of birth' })).toBeFocused();
    });

    test('closes with Escape back to the calendar button', async () => {
      const toggle = playground.preview.getByRole('button', { name: 'Choose date' });
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');

      await playground.page.keyboard.press('Escape');
      await expect(playground.page.getByRole('dialog', { name: 'Choose date' })).toBeHidden();
      await expect(toggle).toBeFocused();
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    });

    test('the standalone calendar disables days before min', async () => {
      const calendar = playground.states.locator('dahc-calendar');

      await expect(calendar.getByRole('button', { name: day(31, 'October', 2026) })).toBeDisabled();
      await calendar.getByRole('button', { name: day(20, 'November', 2026) }).click();
      await expect(playground.page.getByTestId('calendar-value')).toHaveText('Calendar value: 2026-11-20');
    });
  });
}

test('date picker serves its real source and reflows at 320 pixels', async ({ page }) => {
  const playground = new PlaygroundPage(page);
  await page.setViewportSize({ width: 320, height: 800 });
  await playground.open('date-picker', { theme: 'light', direction: 'ltr' });

  await playground.expectSourceFile('forms/date-picker/date-picker.component.ts', "selector: 'dahc-date-picker'");
  await expectNoHorizontalScroll(page);

  await playground.preview.getByRole('button', { name: 'Choose date' }).click();
  const popup = await page.getByRole('dialog', { name: 'Choose date' }).boundingBox();
  expect(popup?.x).toBeGreaterThanOrEqual(0);
  expect((popup?.x ?? 0) + (popup?.width ?? 0)).toBeLessThanOrEqual(320);
});

test('the calendar popup uses 40-pixel days on wide screens', async ({ page }) => {
  const playground = new PlaygroundPage(page);
  await page.setViewportSize({ width: 1280, height: 900 });
  await playground.open('date-picker', { theme: 'light', direction: 'ltr' });

  await playground.preview.getByRole('button', { name: 'Choose date' }).click();
  const dayBox = await page.getByRole('dialog', { name: 'Choose date' }).getByRole('button', { name: day(14, 'March', 1997) }).boundingBox();
  expect(dayBox?.width).toBe(40);
});
