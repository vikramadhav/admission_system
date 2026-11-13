import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { DISPLAY_MODES, PlaygroundPage } from '../../support/playground';

const FOUNDATION_PAGES = ['foundations/colour', 'foundations/typography', 'foundations/layout'] as const;

for (const mode of DISPLAY_MODES) {
  test.describe(`foundations (${mode.theme}, ${mode.direction})`, () => {
    test('every semantic colour pair meets WCAG 2.2 AA contrast', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('foundations/colour', mode);

      const rows = page.getByTestId('contrast-row');
      await expect(rows.first()).toBeVisible();

      const failing = await rows.filter({ hasText: 'Fail' }).allInnerTexts();
      expect(failing).toEqual([]);
      await expect(page.getByTestId('contrast-summary')).toContainText('meet WCAG 2.2 AA');
    });

    for (const path of FOUNDATION_PAGES) {
      test(`${path} has no WCAG 2.2 AA violations`, async ({ page }) => {
        const playground = new PlaygroundPage(page);
        await playground.open(path, mode);

        await expectNoAccessibilityViolations(page);
      });
    }
  });
}

test('the light theme emits the Figma primitives and semantic roles', async ({ page }) => {
  const playground = new PlaygroundPage(page);
  await playground.open('foundations/colour', { theme: 'light', direction: 'ltr' });

  const tokens = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    const read = (name: string): string => style.getPropertyValue(name).trim().toLowerCase();

    return {
      navy: read('--dahc-navy'),
      page: read('--dahc-page'),
      textPrimary: read('--dahc-color-text-primary'),
      background: read('--dahc-color-background'),
      link: read('--dahc-color-text-link'),
      shadow4: read('--dahc-shadow-4'),
    };
  });

  expect(tokens).toEqual({
    navy: '#002f70',
    page: '#ecf2f5',
    textPrimary: '#002f70',
    background: '#ecf2f5',
    link: '#026dae',
    shadow4: '0 12px 24px -8px rgba(0, 51, 102, 0.12)',
  });
});

test('the Dubai typeface loads in every weight the type roles use', async ({ page }) => {
  const playground = new PlaygroundPage(page);
  await playground.open('foundations/typography', { theme: 'light', direction: 'ltr' });

  await expect(page.getByTestId('type-role')).toHaveCount(19);

  const loaded = await page.evaluate(async () => {
    await document.fonts.ready;

    return ['400', '500', '700'].map(weight => document.fonts.check(`${weight} 16px Dubai`));
  });

  expect(loaded).toEqual([true, true, true]);
  const family = await page.locator('body').evaluate(element => getComputedStyle(element).fontFamily);
  expect(family).toContain('Dubai');
});

test('type roles switch to the Figma mobile scale below 768 pixels', async ({ page }) => {
  const playground = new PlaygroundPage(page);
  const headingSize = async (): Promise<string> =>
    page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--dahc-type-heading-1-size').trim());

  await page.setViewportSize({ width: 1280, height: 800 });
  await playground.open('foundations/typography', { theme: 'light', direction: 'ltr' });
  expect(await headingSize()).toBe('2.25rem');

  await page.setViewportSize({ width: 375, height: 800 });
  expect(await headingSize()).toBe('1.125rem');
});

for (const path of FOUNDATION_PAGES) {
  test(`${path} reflows at 320 pixels`, async ({ page }) => {
    const playground = new PlaygroundPage(page);
    await page.setViewportSize({ width: 320, height: 800 });
    await playground.open(path, { theme: 'light', direction: 'ltr' });

    await expectNoHorizontalScroll(page);
  });
}
