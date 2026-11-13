import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { DISPLAY_MODES, PlaygroundPage } from '../../support/playground';

// Data display components ported from dubai-health-ui.

for (const mode of DISPLAY_MODES) {
  test.describe(`ported data display (${mode.theme}, ${mode.direction})`, () => {
    test('avatar is an image named after the person and falls back to initials', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('avatar', mode);
      await expectNoAccessibilityViolations(page);

      await expect(playground.preview.getByRole('img', { name: 'Aisha Al Mansoori' })).toHaveText('AM');
      await expect(playground.preview.getByRole('img', { name: 'محمد بن راشد' })).toHaveText('مر');
      await expect(playground.preview.getByRole('img', { name: 'Photo that fails' })).toHaveText('PF');
      await expect(playground.states.getByRole('img', { name: 'Avatar' })).toBeVisible();

      await playground.property('name').fill('Omar Haddad');
      await expect(playground.preview.getByRole('img', { name: 'Omar Haddad' })).toHaveText('OH');
    });

    test('image preview opens a modal dialog that closes with Escape and returns focus', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('image', mode);
      await expectNoAccessibilityViolations(page);

      const open = playground.preview.getByRole('button', { name: 'View larger: Dubai Health logo' });
      await open.click();
      const dialog = page.getByRole('dialog', { name: 'Dubai Health logo' });
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole('button', { name: 'Close preview' })).toBeVisible();
      await expectNoAccessibilityViolations(page);

      await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();
      await expect(open).toBeFocused();

      await playground.property('preview').uncheck();
      await expect(playground.preview.getByRole('button')).toHaveCount(0);
      await expect(playground.preview.getByRole('img', { name: 'Dubai Health logo' })).toBeVisible();
    });

    test('carousel moves with previous, next and slide buttons and names its slides', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('carousel', mode);
      await expectNoAccessibilityViolations(page);

      const carousel = playground.preview.getByRole('region', { name: 'Highlights' });
      await expect(carousel).toHaveAttribute('aria-roledescription', 'carousel');
      await expect(carousel.getByRole('group', { name: '1 of 3' })).toBeVisible();
      await expect(carousel.getByRole('group', { name: '2 of 3' })).toBeHidden();

      await carousel.getByRole('button', { name: 'Next slide' }).click();
      await expect(carousel.getByRole('group', { name: '2 of 3' })).toContainText('Upload your documents');
      await expect(carousel.getByRole('button', { name: 'Go to slide 2' })).toHaveAttribute('aria-current', 'true');

      await carousel.getByRole('button', { name: 'Previous slide' }).click();
      await carousel.getByRole('button', { name: 'Previous slide' }).click();
      await expect(carousel.getByRole('group', { name: '3 of 3' })).toBeVisible();

      await carousel.getByRole('button', { name: 'Go to slide 1' }).click();
      await expect(playground.properties.getByTestId('carousel-index')).toHaveText('index: 0');
      // Reduced motion (set by the helper): no automatic rotation, so no pause button.
      await playground.property('autoplay (ms)').selectOption('4000');
      await expect(carousel.getByRole('button', { name: 'Stop automatic slide show' })).toHaveCount(0);
    });

    test('comment is an article with author, role, time and nested replies', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('comment', mode);
      await expectNoAccessibilityViolations(page);

      const comment = playground.preview.getByRole('article', { name: 'Comment by Sara Al Hashimi' });
      await expect(comment).toContainText('Admission Officer');
      await expect(comment.locator('time').first()).toHaveAttribute('datetime', '2026-03-12T10:24');
      await expect(comment.getByRole('article', { name: 'Comment by Aisha Khan' })).toBeVisible();
      await expect(comment.getByRole('button', { name: 'Reply' })).toBeVisible();
    });

    test('timeline is a list that names each status', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('timeline', mode);
      await expectNoAccessibilityViolations(page);

      const timeline = playground.preview.getByRole('list', { name: 'Application history' });
      await expect(timeline.getByRole('listitem')).toHaveCount(4);
      await expect(timeline.getByRole('listitem').nth(2)).toHaveAttribute('aria-current', 'step');
      await expect(timeline.getByRole('listitem').nth(2)).toContainText('(In progress)');
      await expect(timeline.getByRole('listitem').nth(3)).toContainText('(Not started)');
      await expect(playground.states.getByRole('listitem').first()).toContainText('(Needs attention)');
    });

    test('tree follows the APG tree view keyboard model', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('tree', mode);
      await expectNoAccessibilityViolations(page);

      const tree = playground.preview.getByRole('tree', { name: 'Specialties' });
      const medicine = tree.getByRole('treeitem', { name: /^Medicine/ });
      await expect(medicine).toHaveAttribute('aria-expanded', 'true');
      await expect(medicine).toHaveAttribute('tabindex', '0');

      const inward = mode.direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
      const outward = mode.direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft';

      await medicine.focus();
      await page.keyboard.press('ArrowDown');
      await expect(tree.getByRole('treeitem', { name: 'Internal Medicine' })).toBeFocused();
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      const fellowships = tree.getByRole('treeitem', { name: /^Fellowships/ });
      await expect(fellowships).toBeFocused();
      await expect(fellowships).toHaveAttribute('aria-expanded', 'false');

      await page.keyboard.press(inward);
      await expect(fellowships).toHaveAttribute('aria-expanded', 'true');
      await page.keyboard.press(inward);
      await expect(tree.getByRole('treeitem', { name: 'Adult Cardiology' })).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(tree.getByRole('treeitem', { name: 'Adult Cardiology' })).toHaveAttribute('aria-selected', 'true');
      await expect(playground.properties.getByTestId('tree-value')).toHaveText('value: cardiology');

      await page.keyboard.press(outward);
      await expect(fellowships).toBeFocused();
      await page.keyboard.press(outward);
      await expect(fellowships).toHaveAttribute('aria-expanded', 'false');
      await page.keyboard.press('End');
      await expect(tree.getByRole('treeitem', { name: 'Pharmacy (closed)' })).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(tree.getByRole('treeitem', { name: 'Pharmacy (closed)' })).toHaveAttribute('aria-selected', 'false');
      await page.keyboard.press('Home');
      await expect(medicine).toBeFocused();

      await tree.getByText('Dentistry').click();
      await expect(tree.getByRole('treeitem', { name: /^Dentistry/ })).toHaveAttribute('aria-expanded', 'true');
      await expect(tree.getByRole('treeitem', { name: 'Orthodontics' })).toBeVisible();
    });

    test('QR code is a named image drawn from the value', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('qr-code', mode);
      await expectNoAccessibilityViolations(page);

      const code = playground.preview.getByRole('img', { name: 'QR code: https://www.dubaihealth.ae' });
      const path = code.locator('path');
      await expect(path).toHaveAttribute('d', /^M/);
      const before = await path.getAttribute('d');

      await playground.property('value').fill('GME');
      await expect(playground.preview.getByRole('img', { name: 'QR code: GME' })).toBeVisible();
      expect(await playground.preview.locator('path').getAttribute('d')).not.toBe(before);
      await expect(playground.states.getByRole('img', { name: 'Application reference QR code' })).toBeVisible();
    });

    test('watermark draws a decorative mark that does not block the content', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('watermark', mode);
      await expectNoAccessibilityViolations(page);

      const mark = playground.preview.locator('.dahc-watermark__mark');
      await expect(mark).toHaveAttribute('aria-hidden', 'true');
      await expect(mark).toHaveCSS('pointer-events', 'none');
      await expect(mark).toHaveCSS('background-image', /svg/);
      await expect(playground.preview.getByRole('heading', { name: 'Application summary' })).toBeVisible();
    });

    test('statistic formats numbers for the locale', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('statistic', mode);
      await expectNoAccessibilityViolations(page);

      await expect(playground.preview.locator('dahc-statistic').first()).toContainText(/12,480\s*\+/);
      await expect(playground.preview.locator('dahc-statistic').first()).toContainText('Candidates this cycle');
      await expect(playground.states.locator('dahc-statistic').nth(1)).toContainText('Open');
    });
  });
}

test('carousel rotates on its own with a pause button when motion is allowed', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/carousel');
  const playground = new PlaygroundPage(page);
  await playground.property('autoplay (ms)').selectOption('4000');

  const carousel = playground.preview.getByRole('region', { name: 'Highlights' });
  const pause = carousel.getByRole('button', { name: 'Stop automatic slide show' });
  await expect(pause).toBeVisible();
  await pause.click();
  await expect(carousel.getByRole('button', { name: 'Start automatic slide show' })).toBeVisible();
});

test('ported data display pages reflow at 320 pixels', async ({ page }) => {
  const playground = new PlaygroundPage(page);
  await page.setViewportSize({ width: 320, height: 800 });

  for (const path of ['avatar', 'image', 'carousel', 'comment', 'timeline', 'tree', 'qr-code', 'watermark', 'statistic']) {
    await playground.open(path, { theme: 'light', direction: 'ltr' });
    await expectNoHorizontalScroll(page);
  }
});
