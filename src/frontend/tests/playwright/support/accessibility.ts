import AxeBuilder from '@axe-core/playwright';
import { Page, expect } from '@playwright/test';

/** WCAG 2.2 AA rules, the standard's target (s.21, s.30). */
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

export async function expectNoAccessibilityViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  const violations = results.violations.map(
    violation => `${violation.id} (${violation.impact ?? 'unknown'}): ${violation.nodes.map(node => node.target.join(' ')).join(' | ')}`,
  );

  expect(violations).toEqual([]);
}

/** Content reflows at 320 CSS pixels (WCAG 1.4.10) without horizontal page scrolling. */
export async function expectNoHorizontalScroll(page: Page): Promise<void> {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

  expect(overflow).toBeLessThanOrEqual(0);
}
