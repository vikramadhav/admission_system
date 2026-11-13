import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { DISPLAY_MODES, PlaygroundPage } from '../../support/playground';

for (const mode of DISPLAY_MODES) {
  test.describe(`button group (${mode.theme}, ${mode.direction})`, () => {
    let playground: PlaygroundPage;

    test.beforeEach(async ({ page }) => {
      playground = new PlaygroundPage(page);
      await playground.open('button-group', mode);
    });

    test('has no WCAG 2.2 AA violations', async () => {
      await expectNoAccessibilityViolations(playground.page);
    });

    test('is a named radio group that arrow keys move through and the form receives', async () => {
      const group = playground.preview.getByRole('group', { name: 'Applicant type' });
      const all = group.getByRole('radio', { name: 'All' });
      const individual = group.getByRole('radio', { name: 'Individual' });

      await expect(all).toBeChecked();
      await all.focus();
      await playground.page.keyboard.press('ArrowDown');

      await expect(individual).toBeChecked();
      await expect(individual).toBeFocused();
      await expect(playground.page.getByTestId('form-value')).toHaveText('Form value: "individual"');

      await group.getByRole('radio', { name: 'Corporate' }).click();
      await expect(playground.page.getByTestId('form-value')).toHaveText('Form value: "corporate"');
    });

    test('selecting an option does not shift the others', async () => {
      const group = playground.preview.getByRole('group', { name: 'Applicant type' });
      const corporate = group.locator('label').filter({ hasText: 'Corporate' });
      const before = await corporate.boundingBox();

      await group.getByRole('radio', { name: 'Individual' }).click();
      const after = await corporate.boundingBox();

      expect(after?.x).toBe(before?.x);
      expect(after?.width).toBe(before?.width);
    });

    test('disables options and whole groups', async () => {
      await expect(playground.states.getByRole('radio', { name: 'Government' })).toBeDisabled();

      const disabledGroup = playground.states.getByRole('group', { name: 'Disabled group' });
      await expect(disabledGroup.getByRole('radio', { name: 'Individual' })).toBeChecked();
      await expect(disabledGroup.getByRole('radio', { name: 'All' })).toBeDisabled();
    });
  });
}

test('button group serves its real source and reflows at 320 pixels', async ({ page }) => {
  const playground = new PlaygroundPage(page);
  await page.setViewportSize({ width: 320, height: 800 });
  await playground.open('button-group', { theme: 'light', direction: 'ltr' });

  await playground.expectSourceFile('actions/button-group/button-group.component.ts', "selector: 'dahc-button-group'");
  await expectNoHorizontalScroll(page);
});
