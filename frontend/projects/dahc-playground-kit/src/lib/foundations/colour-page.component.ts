import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';

import { injectPlaygroundConfig } from '../config';
import { contrastRatio } from './contrast';
import { injectTokenNames, injectTokens } from './foundation-tokens';

interface ContrastRow {
  readonly foreground: string;
  readonly background: string;
  readonly minimum: number;
  readonly ratio: number | null;
  readonly passes: boolean;
}

/** Colour foundations: primitives, semantic roles of the active theme, and WCAG contrast checks. */
@Component({
  selector: 'dahc-playground-colour-page',
  templateUrl: './colour-page.component.html',
  styleUrl: './foundations.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe],
})
export class ColourPageComponent {
  private readonly config = injectPlaygroundConfig();
  private readonly names = injectTokenNames();
  private readonly allTokens = injectTokens('');
  private readonly semanticTokens = injectTokens(this.config.colorPrefix);

  protected readonly colorPrefix = this.config.colorPrefix;

  /** Primitives are the tokens declared with a literal colour value. */
  protected readonly palette = computed(() =>
    this.allTokens()
      .filter(token => token.declared.startsWith('#'))
      .map(token => ({ name: this.names.shortName(token), value: token.resolved })),
  );

  protected readonly semantic = computed(() =>
    this.semanticTokens().map(token => ({
      name: this.names.shortName(token, this.config.colorPrefix),
      primitive: token.declared.replace(/^var\((.*)\)$/, '$1'),
      value: token.resolved,
    })),
  );

  protected readonly contrast = computed<readonly ContrastRow[]>(() => {
    const values = new Map(this.semantic().map(token => [token.name, token.value]));

    return this.config.contrastPairs.map(pair => {
      const ratio = contrastRatio(values.get(pair.foreground) ?? '', values.get(pair.background) ?? '');

      return { ...pair, ratio, passes: ratio !== null && ratio >= pair.minimum };
    });
  });

  protected readonly failures = computed<number>(() => this.contrast().filter(row => !row.passes).length);

  protected colorVar(role: string): string {
    return this.names.cssVar(this.config.colorPrefix + role);
  }
}
