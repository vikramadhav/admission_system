import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  Signal,
  afterNextRender,
  computed,
  contentChildren,
  inject,
  input,
  model,
} from '@angular/core';

import { dahcUniqueId } from '../../core/a11y/unique-id';
import { DahcIconComponent } from '../../core/icon/icon.component';
import { DahcIconName } from '../../core/icon/icon-names';

/**
 * One tab and its content: <dahc-tab-panel name="documents" label="Documents">…</dahc-tab-panel>.
 * The content is rendered only while the tab is active.
 */
@Component({
  selector: 'dahc-tab-panel',
  template: `
    @if (active()) {
      <ng-content />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'tabpanel',
    tabindex: '0',
    class: 'dahc-tab-panel',
    '[id]': 'panelId',
    '[attr.aria-labelledby]': 'tabId',
    '[hidden]': '!active()',
  },
})
export class DahcTabPanelComponent {
  /** Identifies the panel; the tabs' active value. */
  readonly name = input.required<string>();
  /** Text of the tab. */
  readonly label = input.required<string>();
  readonly icon = input<DahcIconName | null>(null);
  readonly disabled = input<boolean>(false);

  private readonly tabs = inject(DahcTabsComponent);
  readonly panelId = dahcUniqueId('dahc-tab-panel');
  readonly tabId = `${this.panelId}-tab`;
  protected readonly active: Signal<boolean> = computed(() => this.tabs.activeName() === this.name());
}

/** default: DERIVED light style (DH tab type, 2px navy indicator); inverse: Figma Tab 50:9930 on a navy-800 bar. */
export type DahcTabsTone = 'default' | 'inverse';

/**
 * Switches between related views in the same context. WAI-ARIA tabs with automatic activation:
 * arrow keys (in the reading direction) move between tabs and show the panel, Home / End jump to
 * the first / last tab, Tab moves into the panel.
 * Figma Tabs 50:9910 / Tab 50:9930: 80px tabs on a navy-800 bar with a top radius, active tab
 * white with navy Bold 18/20, inactive white Regular 18/24 (tone "inverse"). The light default is
 * DERIVED (48px, 2px navy indicator), pending UX sign-off.
 * Ported from dubai-health-ui (packages/components/src/tabs/dh-tabs.ts).
 */
@Component({
  selector: 'dahc-tabs',
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcIconComponent],
  host: {
    '[class.dahc-tabs--inverse]': "tone() === 'inverse'",
  },
})
export class DahcTabsComponent {
  /** Accessible name of the tab list. */
  readonly label = input.required<string>();
  /** Name of the active panel: [(active)]. Empty selects the first enabled tab. */
  readonly active = model<string>('');
  readonly tone = input<DahcTabsTone>('default');

  protected readonly panels: Signal<readonly DahcTabPanelComponent[]> = contentChildren(DahcTabPanelComponent);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  /** The active panel's name, falling back to the first enabled tab. */
  readonly activeName: Signal<string> = computed(() => {
    const panels = this.panels();
    const chosen = panels.find(panel => panel.name() === this.active() && !panel.disabled());

    return (chosen ?? panels.find(panel => !panel.disabled()))?.name() ?? '';
  });

  protected select(panel: DahcTabPanelComponent, focus: boolean): void {
    if (panel.disabled()) {
      return;
    }

    this.active.set(panel.name());

    if (focus) {
      afterNextRender(() => this.host.nativeElement.querySelector<HTMLElement>(`#${panel.tabId}`)?.focus(), {
        injector: this.injector,
      });
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    const enabled = this.panels().filter(panel => !panel.disabled());
    const current = enabled.findIndex(panel => panel.name() === this.activeName());
    const isRtl = getComputedStyle(this.host.nativeElement).direction === 'rtl';
    const forward = isRtl ? 'ArrowLeft' : 'ArrowRight';
    const backward = isRtl ? 'ArrowRight' : 'ArrowLeft';
    let next: number | null = null;

    if (event.key === forward) {
      next = (current + 1) % enabled.length;
    } else if (event.key === backward) {
      next = (current - 1 + enabled.length) % enabled.length;
    } else if (event.key === 'Home') {
      next = 0;
    } else if (event.key === 'End') {
      next = enabled.length - 1;
    }

    const target = next === null ? undefined : enabled[next];

    if (target) {
      event.preventDefault();
      this.select(target, true);
    }
  }
}
