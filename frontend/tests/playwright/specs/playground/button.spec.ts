import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { DISPLAY_MODES, PlaygroundPage } from '../../support/playground';

for (const mode of DISPLAY_MODES) {
  test.describe(`button (${mode.theme}, ${mode.direction})`, () => {
    let playground: PlaygroundPage;

    test.beforeEach(async ({ page }) => {
      playground = new PlaygroundPage(page);
      await playground.open('button', mode);
    });

    test('has no WCAG 2.2 AA violations', async () => {
      await expectNoAccessibilityViolations(playground.page);
    });

    test('activates with Enter and Space and reports the click', async () => {
      const button = playground.preview.getByRole('button', { name: 'Save draft' });

      await button.focus();
      await playground.page.keyboard.press('Enter');
      await playground.page.keyboard.press('Space');

      await expect(playground.outputs().getByRole('listitem')).toHaveText(['click (primary)', 'click (primary)']);
    });

    test('is disabled natively and ignores clicks while loading', async () => {
      const button = playground.preview.getByRole('button', { name: /Save draft/ });

      await playground.property('disabled').check();
      await expect(button).toBeDisabled();

      await playground.property('disabled').uncheck();
      await playground.property('loading').check();
      await expect(button).toHaveAttribute('aria-busy', 'true');
      await expect(button).toHaveAccessibleName('Please wait Save draft');
      await expect(button).toBeDisabled();
    });

    test('a disabled link leaves the tab order and is marked aria-disabled', async () => {
      const link = playground.states.getByRole('link', { name: 'Disabled link' });

      await expect(link).toHaveAttribute('aria-disabled', 'true');
      await expect(link).toHaveAttribute('tabindex', '-1');
    });

    test('shows a visible focus indicator', async () => {
      const button = playground.preview.getByRole('button', { name: 'Save draft' });

      await button.focus();
      await playground.page.keyboard.press('Shift+Tab');
      await playground.page.keyboard.press('Tab');

      await expect(button).toBeFocused();
      await expect(button).not.toHaveCSS('outline-style', 'none');
    });
  });
}

test('button heights and label style follow Figma Buttons 50:6786', async ({ page }) => {
  const playground = new PlaygroundPage(page);
  await page.setViewportSize({ width: 1280, height: 900 });
  await playground.open('button', { theme: 'light', direction: 'ltr' });

  const primary = playground.states.locator('p', { hasText: /^primary$/ }).locator('xpath=..');
  const heights = await primary.getByRole('button', { name: /^(sm|md|lg)$/ }).evaluateAll(buttons =>
    buttons.map(button => Math.round(button.getBoundingClientRect().height)),
  );
  expect(heights).toEqual([36, 44, 48]);

  const large = primary.getByRole('button', { name: 'lg' });
  await expect(large).toHaveCSS('background-color', 'rgb(0, 47, 112)');
  await expect(large).toHaveCSS('font-family', /Dubai/);
  await expect(large).toHaveCSS('font-size', '18px');
  await expect(large).toHaveCSS('font-weight', '700');
});

test('button serves its real source and reflows at 320 pixels', async ({ page }) => {
  const playground = new PlaygroundPage(page);
  await page.setViewportSize({ width: 320, height: 800 });
  await playground.open('button', { theme: 'light', direction: 'ltr' });

  await playground.expectSourceFile('actions/button/button.component.ts', "selector: 'button[dahc-button], a[dahc-button]'");
  await expectNoHorizontalScroll(page);
});
