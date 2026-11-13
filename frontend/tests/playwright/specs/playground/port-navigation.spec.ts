import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { DISPLAY_MODES, PlaygroundPage } from '../../support/playground';

// Navigation components ported from dubai-health-ui: link, anchor, dropdown, navigation menu,
// float button and back to top.

for (const mode of DISPLAY_MODES) {
  test.describe(`ported navigation (${mode.theme}, ${mode.direction})`, () => {
    test('link is a real anchor and opening a new tab adds rel noopener', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('link', mode);
      await expectNoAccessibilityViolations(page);

      const link = playground.preview.getByRole('link', { name: 'Read the admission guide' });
      await expect(link).toHaveAttribute('href', '#guide');
      await expect(link).not.toHaveAttribute('rel');

      await playground.property('target _blank').check();
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    test('anchor highlights the section in view and follows its links', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('anchor', mode);
      await expectNoAccessibilityViolations(page);

      const nav = playground.preview.getByRole('navigation', { name: 'On this page' });
      await expect(nav.getByRole('link', { name: 'Eligibility' })).toHaveAttribute('aria-current', 'location');

      await nav.getByRole('link', { name: 'Fees' }).click();
      await expect(nav.getByRole('link', { name: 'Fees' })).toHaveAttribute('aria-current', 'location');
      await expect(nav.getByRole('link', { name: 'Eligibility' })).not.toHaveAttribute('aria-current');
      await expect(playground.preview.locator('#anchor-fees')).toBeFocused();
    });

    test('dropdown opens from its trigger, moves with the arrow keys and chooses with Enter', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('dropdown', mode);

      const trigger = playground.preview.getByRole('button', { name: 'Actions' });
      await expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
      await trigger.focus();
      await page.keyboard.press('ArrowDown');

      const menu = page.getByRole('menu', { name: 'Application actions' });
      await expect(menu).toBeVisible();
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
      await expect(menu.getByRole('menuitem', { name: 'View application' })).toBeFocused();
      await expectNoAccessibilityViolations(page);

      // The disabled item is skipped.
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await expect(menu.getByRole('menuitem', { name: 'Withdraw application' })).toBeFocused();

      await page.keyboard.press('Home');
      await page.keyboard.press('Enter');
      await expect(menu).toBeHidden();
      await expect(trigger).toBeFocused();
      await expect(playground.outputs().getByRole('listitem').first()).toHaveText('itemSelected (view)');

      await trigger.click();
      await expect(menu).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(menu).toBeHidden();
      await expect(trigger).toBeFocused();
    });

    test('navigation menu marks the current page, moves with the arrow keys and expands sub-menus', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('nav-menu', mode);
      await expectNoAccessibilityViolations(page);

      const main = playground.preview.getByRole('navigation', { name: 'Main' });
      await expect(main.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
      await expect(main.getByRole('link', { name: 'Archive' })).toHaveCount(0);

      const next = mode.direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
      await main.getByRole('link', { name: 'Home' }).focus();
      await page.keyboard.press(next);
      await expect(main.getByRole('link', { name: 'Programs' })).toBeFocused();
      await page.keyboard.press('End');
      await expect(main.getByRole('link', { name: 'News' })).toBeFocused();

      const side = page.getByRole('navigation', { name: 'Side menu' });
      const group = side.getByRole('button', { name: 'Applications' });
      await expect(group).toHaveAttribute('aria-expanded', 'true');
      await expect(side.getByRole('link', { name: 'Drafts' })).toBeVisible();
      await group.click();
      await expect(group).toHaveAttribute('aria-expanded', 'false');
      await expect(side.getByRole('link', { name: 'Drafts' })).toBeHidden();
      await expectNoAccessibilityViolations(page);
    });

    test('float button is named by its label and back to top appears after scrolling', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('float-button', mode);
      await expectNoAccessibilityViolations(page);

      await playground.preview.getByRole('button', { name: 'Contact us' }).click();
      await expect(playground.outputs().getByRole('listitem').first()).toHaveText('click');

      await playground.open('back-top', mode);
      const scroller = playground.preview.getByRole('region', { name: 'Long content' });
      const backTop = scroller.getByRole('button', { name: 'Back to top' });
      await expect(backTop).toBeHidden();

      await scroller.evaluate(element => element.scrollTo({ top: 400 }));
      await expect(backTop).toBeVisible();
      await expectNoAccessibilityViolations(page);
      await backTop.click();
      await expect.poll(() => scroller.evaluate(element => element.scrollTop)).toBe(0);
      await expect(playground.outputs().getByRole('listitem').first()).toHaveText('backToTop');
    });
  });
}

test('ported navigation pages reflow at 320 pixels', async ({ page }) => {
  const playground = new PlaygroundPage(page);
  await page.setViewportSize({ width: 320, height: 800 });

  for (const path of ['link', 'anchor', 'dropdown', 'nav-menu', 'float-button', 'back-top']) {
    await playground.open(path, { theme: 'light', direction: 'ltr' });
    await expectNoHorizontalScroll(page);
  }
});
