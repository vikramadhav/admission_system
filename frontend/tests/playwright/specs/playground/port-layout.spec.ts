import { expect, test } from '@playwright/test';

import { expectNoAccessibilityViolations, expectNoHorizontalScroll } from '../../support/accessibility';
import { DISPLAY_MODES, PlaygroundPage } from '../../support/playground';

for (const mode of DISPLAY_MODES) {
  test.describe(`ported layout (${mode.theme}, ${mode.direction})`, () => {
    test('flex and space follow their direction, gap and block inputs', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('flex', mode);
      await expectNoAccessibilityViolations(page);

      const flex = playground.preview.getByTestId('flex-demo');
      await expect(flex).toHaveCSS('display', 'flex');
      await expect(flex).toHaveCSS('column-gap', '16px');
      await playground.property('vertical').check();
      await expect(flex).toHaveCSS('flex-direction', 'column');
      await playground.property('gap').selectOption({ label: 'lg' });
      await expect(flex).toHaveCSS('row-gap', '24px');

      await playground.open('space', mode);
      await expectNoAccessibilityViolations(page);
      const space = playground.preview.getByTestId('space-demo');
      await expect(space).toHaveCSS('display', 'inline-flex');
      await expect(space).toHaveCSS('column-gap', '8px');
      await playground.property('block').check();
      await expect(space).toHaveCSS('display', 'flex');
    });

    test('grid columns take their span of 24 and stack on small screens', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await page.setViewportSize({ width: 1280, height: 900 });
      await playground.open('grid', mode);
      await expectNoAccessibilityViolations(page);

      const row = playground.preview.getByTestId('grid-demo');
      const column = row.locator('dahc-col').first();
      const rowBox = await row.boundingBox();
      const columnBox = await column.boundingBox();
      expect(rowBox && columnBox ? columnBox.width / rowBox.width : 0).toBeCloseTo(1 / 3, 1);

      await page.setViewportSize({ width: 600, height: 900 });
      await expect.poll(async () => {
        const [rowNow, columnNow] = await Promise.all([row.boundingBox(), column.boundingBox()]);

        return rowNow && columnNow ? columnNow.width / rowNow.width : 0;
      }).toBeCloseTo(1, 1);
    });

    test('layout sider collapses with its labelled button and reports the change', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('layout', mode);
      await expectNoAccessibilityViolations(page);

      const nav = playground.preview.getByRole('navigation', { name: 'Demo navigation' });
      await expect(nav.getByRole('link', { name: 'Overview' })).toBeVisible();
      const collapse = nav.getByRole('button', { name: 'Collapse navigation' });
      await expect(collapse).toHaveAttribute('aria-expanded', 'true');

      await collapse.click();
      const expand = nav.getByRole('button', { name: 'Expand navigation' });
      await expect(expand).toHaveAttribute('aria-expanded', 'false');
      await expect(playground.outputs().getByRole('listitem').first()).toHaveText('collapseChange (true)');
      await expect(playground.preview.locator('dahc-sider').first()).toHaveCSS('width', '80px');
      await expectNoAccessibilityViolations(page);
    });

    test('divider is a separator, unless it has a label or is decorative', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('divider', mode);
      await expectNoAccessibilityViolations(page);

      const labelled = playground.preview.getByTestId('divider-demo');
      await expect(labelled).not.toHaveAttribute('role');
      await expect(labelled).toContainText('or');
      await expect(playground.states.getByTestId('divider-plain')).toHaveAttribute('role', 'separator');
      await expect(playground.states.getByTestId('divider-plain')).toHaveAttribute('aria-orientation', 'horizontal');
      await expect(playground.states.getByTestId('divider-vertical')).toHaveAttribute('aria-orientation', 'vertical');

      await playground.property('label').fill('');
      await expect(labelled).toHaveAttribute('role', 'separator');
      await playground.property('decorative').check();
      await expect(labelled).toHaveAttribute('aria-hidden', 'true');
      await expect(labelled).not.toHaveAttribute('role');
    });

    test('splitter handle moves with the keyboard within the pane limits', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('splitter', mode);
      await expectNoAccessibilityViolations(page);

      const handle = playground.preview.getByRole('separator', { name: 'Resize the applications list' });
      await expect(handle).toHaveAttribute('aria-valuenow', '30');
      await expect(handle).toHaveAttribute('aria-orientation', 'vertical');

      await handle.focus();
      await page.keyboard.press('ArrowRight');
      await expect(handle).toHaveAttribute('aria-valuenow', mode.direction === 'rtl' ? '29' : '31');
      await page.keyboard.press('Shift+ArrowLeft');
      await expect(handle).toHaveAttribute('aria-valuenow', mode.direction === 'rtl' ? '39' : '21');
      await page.keyboard.press('End');
      await expect(handle).toHaveAttribute('aria-valuenow', '60');
      await page.keyboard.press('Home');
      await expect(handle).toHaveAttribute('aria-valuenow', '20');
      await expect(playground.outputs().getByRole('listitem').first()).toHaveText('resized (20, 80)');

      await expect(playground.states.getByRole('separator', { name: 'Fixed divider' })).toHaveAttribute('aria-disabled', 'true');

      await playground.property('layout').selectOption({ label: 'vertical' });
      await expect(handle).toHaveAttribute('aria-orientation', 'horizontal');
      await handle.focus();
      await page.keyboard.press('ArrowDown');
      await expect(handle).toHaveAttribute('aria-valuenow', '21');
    });

    test('affix page passes the accessibility scan', async ({ page }) => {
      const playground = new PlaygroundPage(page);
      await playground.open('affix', mode);
      await expectNoAccessibilityViolations(page);
      await expect(playground.preview.getByTestId('affix-demo')).toHaveCSS('position', 'sticky');
    });
  });
}

test('affix pins its content when it scrolls to the offset', async ({ page }) => {
  const playground = new PlaygroundPage(page);
  await page.setViewportSize({ width: 1280, height: 600 });
  await playground.open('affix', { theme: 'light', direction: 'ltr' });

  const affix = playground.preview.getByTestId('affix-demo');
  await expect(affix).not.toHaveClass(/dahc-affix--affixed/);

  await affix.evaluate(element => element.closest('dahc-playground-page')?.parentElement?.scrollIntoView());
  await page.mouse.move(400, 400);

  for (let step = 0; step < 6; step++) {
    await page.mouse.wheel(0, 400);
  }

  await expect(affix).toHaveClass(/dahc-affix--affixed/);
  await expect(playground.outputs().getByRole('listitem').first()).toHaveText('affixedChange (true)');
});

test('layout pages reflow at 320 pixels', async ({ page }) => {
  const playground = new PlaygroundPage(page);
  await page.setViewportSize({ width: 320, height: 800 });

  for (const path of ['affix', 'divider', 'flex', 'grid', 'layout', 'space', 'splitter']) {
    await playground.open(path, { theme: 'light', direction: 'ltr' });
    await expectNoHorizontalScroll(page);
  }
});
