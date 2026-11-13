import { ChangeDetectionStrategy, Component, DOCUMENT, DestroyRef, effect, inject, input, model, output } from '@angular/core';

import { DahcIconComponent } from '../../core/icon/icon.component';

/** Breakpoint below which the sider collapses by itself (tokens/_breakpoints.scss; xxl 90rem). */
export type DahcSiderBreakpoint = '' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

const BREAKPOINTS: Readonly<Record<Exclude<DahcSiderBreakpoint, ''>, string>> = {
  sm: '36rem',
  md: '48rem',
  lg: '64rem',
  xl: '80rem',
  xxl: '90rem',
};

/**
 * Side navigation column of a dahc-layout, optionally collapsible: 256px wide, 80px collapsed,
 * white surface with the DH divider. Set `breakpoint` (for example 'lg') to collapse
 * automatically below that width. Content is usually a navigation menu.
 * Ported from dubai-health-ui dh-sider (layout/dh-layout.ts). DERIVED (UDD-019).
 */
@Component({
  selector: 'dahc-sider',
  templateUrl: './sider.component.html',
  styleUrl: './sider.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcIconComponent],
  host: {
    class: 'dahc-sider',
    '[class.dahc-sider--collapsed]': 'collapsed()',
  },
})
export class DahcSiderComponent {
  readonly collapsed = model<boolean>(false);
  /** Shows the collapse button at the bottom of the column. */
  readonly collapsible = input<boolean>(false);
  readonly breakpoint = input<DahcSiderBreakpoint>('');
  /** Accessible name of the navigation landmark. */
  readonly label = input<string>($localize`:@@dahcUi.sider.label:Side navigation`);
  readonly expandLabel = input<string>($localize`:@@dahcUi.sider.expand:Expand navigation`);
  readonly collapseLabel = input<string>($localize`:@@dahcUi.sider.collapse:Collapse navigation`);
  /** Emits after the user or the breakpoint changed the collapsed state. */
  readonly collapseChange = output<boolean>();

  private readonly window = inject(DOCUMENT).defaultView;

  constructor() {
    let query: MediaQueryList | null = null;
    const onChange = (event: MediaQueryListEvent): void => this.setCollapsed(!event.matches);

    effect(() => {
      const breakpoint = this.breakpoint();
      query?.removeEventListener('change', onChange);
      query = null;

      if (breakpoint !== '' && this.window?.matchMedia) {
        query = this.window.matchMedia(`(min-width: ${BREAKPOINTS[breakpoint]})`);
        query.addEventListener('change', onChange);
        this.setCollapsed(!query.matches);
      }
    });

    inject(DestroyRef).onDestroy(() => query?.removeEventListener('change', onChange));
  }

  toggle(): void {
    this.setCollapsed(!this.collapsed());
  }

  private setCollapsed(collapsed: boolean): void {
    if (collapsed !== this.collapsed()) {
      this.collapsed.set(collapsed);
      this.collapseChange.emit(collapsed);
    }
  }
}
