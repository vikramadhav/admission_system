import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { DISPLAY_MODES, PlaygroundPage } from '../../support/playground';

// Features added to the existing data-display components from dubai-health-ui:
// dh-descriptions (heading, bordered, projected items), dh-list (bordered, avatar and actions
// slots) and dh-card (elevated).

for (const mode of DISPLAY_MODES) {
  test.describe(`aligned data display (${mode.theme}, ${mode.direction})`, () => {
    test('detail list shows a heading, a bordered frame and projected pairs', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('detail-list', mode);

      await playground.property('heading').fill('Application');
      await expect(playground.preview.getByRole('heading', { level: 3, name: 'Application' })).toBeVisible();
      await playground.property('bordered').check();
      await expect(playground.preview.locator('dahc-detail-list')).toHaveClass(/dahc-detail-list--bordered/);
      await expect(playground.preview.getByRole('term')).toHaveCount(4);

      const projected = playground.states.locator('dahc-detail-list', { hasText: 'Application summary' });
      await expect(projected.getByRole('heading', { level: 3, name: 'Application summary' })).toBeVisible();
      await expect(projected.getByRole('term')).toHaveText(['Application number', 'Status', 'Program', 'Bill amount']);
      await expect(projected.getByRole('definition').nth(1)).toHaveText('Draft');
      const frame = await projected.locator('dl').evaluate(element => getComputedStyle(element).borderTopStyle);
      expect(frame).toBe('solid');
      await expectNoAccessibilityViolations(page);
    });

    test('list draws a bordered frame with avatars and named actions', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('list', mode);

      await playground.property('bordered (implies divided)').check();
      await expect(playground.preview.locator('dahc-list')).toHaveClass(/dahc-list--bordered/);

      const referees = playground.states.getByRole('list', { name: 'Referees' });
      await expect(referees.getByRole('listitem')).toHaveCount(2);
      await expect(referees.locator('dahc-avatar')).toHaveCount(2);
      await expect(referees.getByRole('button', { name: 'Contact Dr Sara Hazim' })).toBeVisible();
      const radius = await referees.evaluate(element => getComputedStyle(element).borderTopLeftRadius);
      expect(radius).not.toBe('0px');
      await expectNoAccessibilityViolations(page);
    });

    test('elevated card uses a shadow instead of the border', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('card', mode);

      const elevated = playground.states.getByRole('article', { name: 'Elevated' });
      const surface = await elevated.evaluate(element => {
        const style = getComputedStyle(element);

        return { shadow: style.boxShadow, border: style.borderTopColor };
      });
      expect(surface.shadow).not.toBe('none');
      expect(surface.border).toBe('rgba(0, 0, 0, 0)');

      await playground.property('elevated').check();
      await expect(playground.preview.locator('dahc-card')).toHaveClass(/dahc-card--elevated/);
      await expectNoAccessibilityViolations(page);
    });
  });
}

test('aligned data-display pages reflow at 320 pixels', async ({ page }) => {
  const playground = new PlaygroundPage(page);
  await page.setViewportSize({ width: 320, height: 800 });

  for (const path of ['detail-list', 'list', 'card']) {
    await playground.open(path, { theme: 'light', direction: 'ltr' });
    await expectNoHorizontalScroll(page);
  }
});
