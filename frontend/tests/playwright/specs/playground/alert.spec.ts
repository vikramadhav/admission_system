import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { DISPLAY_MODES, PlaygroundPage } from '../../support/playground';

for (const mode of DISPLAY_MODES) {
  test.describe(`alert (${mode.theme}, ${mode.direction})`, () => {
    let playground: PlaygroundPage;

    test.beforeEach(async ({ page }) => {
      playground = new PlaygroundPage(page);
      await playground.open('alert', mode);
    });

    test('has no WCAG 2.2 AA violations', async () => {
      await expectNoAccessibilityViolations(playground.page);
    });

    test('names its variant in text, not only by colour', async () => {
      await expect(playground.preview).toContainText('Error: Your draft could not be saved');
    });

    test('is a live region only when announce is set: alert for errors, status otherwise', async () => {
      await expect(playground.preview.getByRole('alert')).toHaveCount(0);

      await playground.property('announce').check();
      await expect(playground.preview.getByRole('alert')).toContainText('Your draft could not be saved');

      await playground.property('variant').selectOption({ label: 'success' });
      await expect(playground.preview.getByRole('status')).toContainText('Success');
    });

    test('dismisses with the keyboard and emits dismissed', async () => {
      const dismiss = playground.preview.getByRole('button', { name: 'Dismiss message' });

      await dismiss.focus();
      await playground.page.keyboard.press('Enter');

      await expect(playground.preview.getByRole('button', { name: 'Dismiss message' })).toHaveCount(0);
      await expect(playground.outputs().getByRole('listitem')).toHaveText(['dismissed']);
    });

    test('hides the dismiss button when not dismissible', async () => {
      await playground.property('dismissible').uncheck();

      await expect(playground.preview.getByRole('button', { name: 'Dismiss message' })).toHaveCount(0);
    });
  });
}

test('alert serves its real source and reflows at 320 pixels', async ({ page }) => {
  const playground = new PlaygroundPage(page);
  await page.setViewportSize({ width: 320, height: 800 });
  await playground.open('alert', { theme: 'light', direction: 'ltr' });

  await playground.expectSourceFile('feedback/alert/alert.component.ts', "selector: 'dahc-alert'");
  await expectNoHorizontalScroll(page);
});
