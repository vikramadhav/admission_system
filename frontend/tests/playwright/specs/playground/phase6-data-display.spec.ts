import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { DISPLAY_MODES, PlaygroundPage } from '../../support/playground';

for (const mode of DISPLAY_MODES) {
  test.describe(`data display (${mode.theme}, ${mode.direction})`, () => {
    test('accordion opens one section at a time unless multiple is set', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('accordion', mode);
      await expectNoAccessibilityViolations(page);

      const who = playground.preview.getByRole('button', { name: 'Who can apply?' });
      const documents = playground.preview.getByRole('button', { name: 'Which documents do I need?' });
      await expect(who).toHaveAttribute('aria-expanded', 'true');
      await expect(playground.preview.getByRole('region', { name: 'Who can apply?' })).toBeVisible();

      await documents.focus();
      await page.keyboard.press('Enter');
      await expect(documents).toHaveAttribute('aria-expanded', 'true');
      await expect(who).toHaveAttribute('aria-expanded', 'false');

      await playground.property('multiple').check();
      await who.click();
      await expect(who).toHaveAttribute('aria-expanded', 'true');
      await expect(documents).toHaveAttribute('aria-expanded', 'true');

      await expect(playground.preview.getByRole('button', { name: 'Appeals (closed)' })).toBeDisabled();
      await expect(playground.preview.getByRole('heading', { level: 3, name: 'Who can apply?' })).toBeVisible();
    });

    test('stat tiles read label, value and a spoken empty value', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('stat-tile', mode);
      await expectNoAccessibilityViolations(page);

      const empty = playground.states.locator('dahc-stat-tile', { hasText: 'Shortlisting' });
      await expect(empty).toContainText('Not available');
      await expect(playground.preview.locator('dahc-stat-tile')).toContainText('42 / 60');
    });

    test('list exposes its items and trailing content', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('list', mode);
      await expectNoAccessibilityViolations(page);

      const list = playground.preview.getByRole('list');
      await expect(list.getByRole('listitem')).toHaveCount(3);
      await expect(list.getByRole('listitem').first()).toContainText('Complete');
    });

    test('card actionable variant lifts on hover', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('card', mode);
      await playground.property('variant').selectOption({ label: 'actionable' });
      await expectNoAccessibilityViolations(page);

      const surface = playground.preview.locator('.dahc-card__surface').first();
      await expect(surface).toHaveCSS('box-shadow', 'none');
      await surface.hover();
      await expect(surface).not.toHaveCSS('box-shadow', 'none');
    });
  });
}

test('the default card follows the GME panel (radius 16, no shadow)', async ({ page }) => {
  const playground = new PlaygroundPage(page);
  await playground.open('card', { theme: 'light', direction: 'ltr' });

  const surface = playground.preview.locator('.dahc-card__surface').first();
  await expect(surface).toHaveCSS('border-radius', '16px');
  await expect(surface).toHaveCSS('box-shadow', 'none');
  await expect(surface).toHaveCSS('padding-top', '24px');
});

test('data display pages reflow at 320 pixels', async ({ page }) => {
  const playground = new PlaygroundPage(page);
  await page.setViewportSize({ width: 320, height: 800 });

  for (const path of ['accordion', 'stat-tile', 'list', 'badge', 'card']) {
    await playground.open(path, { theme: 'light', direction: 'ltr' });
    await expectNoHorizontalScroll(page);
  }
});
