/** A design token as the browser sees it: name, the value written in the stylesheet, and the computed value. */
export interface TokenEntry {
  readonly name: string;
  /** Value as written in the stylesheet for the active theme, for example `var(--dahc-navy)`. */
  readonly declared: string;
  /** Value after var() substitution, for example `#002f70`. */
  readonly resolved: string;
}

/**
 * Reads the custom properties starting with `prefix` from the loaded stylesheets (the :root rule
 * and the active [data-theme] rule), so the foundations pages always show what the design system
 * actually emits and can never drift from its token source.
 */
export function readTokens(document: Document, prefix: string, theme: string): readonly TokenEntry[] {
  const declarations = new Map<string, string>();
  const themeSelector = `[data-theme="${theme}"]`;

  for (const rule of styleRules(document)) {
    const isRoot = rule.selectorText === ':root';
    const isActiveTheme = rule.selectorText === themeSelector;

    if (!isRoot && !isActiveTheme) {
      continue;
    }

    for (const property of Array.from(rule.style)) {
      if (property.startsWith(prefix) && (isActiveTheme || !declarations.has(property))) {
        declarations.set(property, rule.style.getPropertyValue(property).trim());
      }
    }
  }

  const computed = document.defaultView?.getComputedStyle(document.documentElement);

  return Array.from(declarations, ([name, declared]) => ({
    name,
    declared,
    resolved: computed?.getPropertyValue(name).trim() ?? declared,
  }));
}

function* styleRules(document: Document): Generator<CSSStyleRule> {
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;

    try {
      rules = sheet.cssRules;
    } catch {
      continue; // A cross-origin stylesheet cannot be read; design system styles are same-origin.
    }

    yield* walk(rules);
  }
}

function* walk(rules: CSSRuleList): Generator<CSSStyleRule> {
  for (const rule of Array.from(rules)) {
    if (rule instanceof CSSStyleRule) {
      yield rule;
    } else if (rule instanceof CSSGroupingRule && !(rule instanceof CSSMediaRule)) {
      yield* walk(rule.cssRules);
    }
  }
}
