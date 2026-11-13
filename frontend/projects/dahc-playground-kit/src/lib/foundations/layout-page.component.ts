import { ChangeDetectionStrategy, Component, Signal, computed } from '@angular/core';

import { injectPlaygroundConfig } from '../config';
import { TokenEntry } from './token-reader';
import { injectTokenNames, injectTokens } from './foundation-tokens';

interface TokenRow {
  readonly name: string;
  readonly value: string;
}

/** Spacing, sizing, radius, shadows, motion, z-index and breakpoint foundations. */
@Component({
  selector: 'dahc-playground-layout-page',
  templateUrl: './layout-page.component.html',
  styleUrl: './foundations.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutPageComponent {
  private readonly names = injectTokenNames();

  protected readonly breakpoints = injectPlaygroundConfig().breakpoints;
  protected readonly space = this.rows(injectTokens('space-'));
  protected readonly size = this.rows(injectTokens('size-'));
  protected readonly radius = this.rows(injectTokens('radius-'));
  protected readonly shadow = this.rows(injectTokens('shadow-'));
  protected readonly motion = this.rows(injectTokens('motion-'));
  protected readonly zIndex = this.rows(injectTokens('z-'));

  protected cssVar(name: string): string {
    return this.names.cssVar(name);
  }

  private rows(tokens: Signal<readonly TokenEntry[]>): Signal<readonly TokenRow[]> {
    return computed(() => tokens().map(token => ({ name: this.names.shortName(token), value: token.resolved })));
  }
}
