import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ElementRef,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  model,
  output,
  untracked,
} from '@angular/core';

import { dahcUniqueId } from '../../core/a11y/unique-id';

export type DahcSplitterLayout = 'horizontal' | 'vertical';

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

/**
 * One pane of a dahc-splitter. Every pane except the last draws the resize handle after itself:
 * a WAI-ARIA window splitter (role separator, focusable, aria-valuenow in %).
 * Ported from dubai-health-ui dh-splitter-panel (layout/dh-splitter.ts).
 */
@Component({
  selector: 'dahc-splitter-panel',
  templateUrl: './splitter-panel.component.html',
  styleUrl: './splitter-panel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'dahc-splitter-panel',
    '[class.dahc-splitter-panel--sized]': 'size() !== null',
    '[class.dahc-splitter-panel--vertical]': 'vertical()',
    '[style.flex-basis]': "size() === null ? null : size() + '%'",
  },
})
export class DahcSplitterPanelComponent {
  /** Size in % of the splitter. Panes without a size share the remaining space. */
  readonly size = model<number | null>(null);
  /** Minimum size in %. */
  readonly min = input<number>(0);
  /** Maximum size in %. */
  readonly max = input<number>(100);
  /** Whether the handle after this pane can be moved. */
  readonly resizable = input<boolean>(true);
  /** Accessible name of the handle after this pane. */
  readonly label = input<string>($localize`:@@dahcUi.splitter.resize:Resize`);

  private readonly splitter = inject(DahcSplitterComponent);
  private readonly document = inject(DOCUMENT);

  protected readonly paneId = dahcUniqueId('dahc-splitter-pane');
  protected readonly vertical = computed<boolean>(() => this.splitter.layout() === 'vertical');
  protected readonly hasHandle = computed<boolean>(() => {
    const panels = this.splitter.panels();

    return panels.indexOf(this) > -1 && panels.indexOf(this) < panels.length - 1;
  });
  protected readonly valueNow = computed<number | null>(() => {
    const size = this.size();

    return size === null ? null : Math.round(size);
  });

  protected onKeydown(event: KeyboardEvent): void {
    if (!this.resizable()) {
      return;
    }

    const vertical = this.vertical();
    const step = event.shiftKey ? 10 : 1;
    const forward = vertical ? 'ArrowDown' : 'ArrowRight';
    const back = vertical ? 'ArrowUp' : 'ArrowLeft';
    const deltas: Readonly<Record<string, number>> = { [forward]: step, [back]: -step, Home: -100, End: 100 };
    let delta = deltas[event.key];

    if (delta === undefined) {
      return;
    }

    event.preventDefault();

    if (!vertical && this.isRtl() && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      delta = -delta;
    }

    this.splitter.resize(this, delta);
  }

  protected onPointerDown(event: PointerEvent): void {
    if (!this.resizable()) {
      return;
    }

    event.preventDefault();
    const handle = event.currentTarget as HTMLElement;
    handle.setPointerCapture(event.pointerId);
    handle.focus();
    const vertical = this.vertical();
    const rect = this.splitter.element.getBoundingClientRect();
    const total = vertical ? rect.height : rect.width;
    const direction = !vertical && this.isRtl() ? -1 : 1;
    let last = vertical ? event.clientY : event.clientX;

    const move = (moveEvent: PointerEvent): void => {
      const position = vertical ? moveEvent.clientY : moveEvent.clientX;
      const deltaPx = (position - last) * direction;
      last = position;

      if (total > 0) {
        this.splitter.resize(this, (deltaPx / total) * 100);
      }
    };
    const up = (): void => {
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', up);
      handle.removeEventListener('pointercancel', up);
    };

    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', up);
    handle.addEventListener('pointercancel', up);
  }

  private isRtl(): boolean {
    const view = this.document.defaultView;

    return view ? view.getComputedStyle(this.splitter.element).direction === 'rtl' : false;
  }
}

/**
 * Resizable split panes. Drag a handle, or focus it and use the arrow keys (Shift for 10% steps,
 * Home and End for the limits). Sizes are in % and respect each pane's min and max.
 * Ported from dubai-health-ui dh-splitter (layout/dh-splitter.ts). DERIVED (UDD-019): DH divider
 * line, navy when active.
 */
@Component({
  selector: 'dahc-splitter',
  template: '<ng-content />',
  styleUrl: './splitter.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'dahc-splitter',
    '[class.dahc-splitter--vertical]': "layout() === 'vertical'",
  },
})
export class DahcSplitterComponent {
  /** 'horizontal': side by side; 'vertical': stacked. */
  readonly layout = input<DahcSplitterLayout>('horizontal');
  /** Pane sizes in % after a drag step or key press. */
  readonly resized = output<number[]>();

  readonly panels = contentChildren(DahcSplitterPanelComponent);
  /** @internal */
  readonly element: HTMLElement = inject(ElementRef<HTMLElement>).nativeElement;

  constructor() {
    // Give every pane an explicit size so the handles can move them.
    effect(() => {
      const panels = this.panels();

      untracked(() => {
        const fixed = panels.filter(panel => panel.size() !== null);
        const used = fixed.reduce((sum, panel) => sum + (panel.size() ?? 0), 0);
        const free = panels.length - fixed.length;
        const share = free > 0 ? Math.max(0, 100 - used) / free : 0;

        for (const panel of panels) {
          if (panel.size() === null) {
            panel.size.set(share);
          }
        }
      });
    });
  }

  /** Moves the handle after `panel` by `delta` %, within both panes' limits. */
  resize(panel: DahcSplitterPanelComponent, delta: number): void {
    const panels = this.panels();
    const index = panels.indexOf(panel);
    const next = panels[index + 1];
    const size = panel.size();
    const nextSize = next?.size();

    if (!next || size === null || nextSize === null || nextSize === undefined || !panel.resizable()) {
      return;
    }

    const pair = size + nextSize;
    const low = Math.max(panel.min(), pair - next.max());
    const high = Math.min(panel.max(), pair - next.min());
    const resized = clamp(size + delta, low, high);

    if (resized === size) {
      return;
    }

    panel.size.set(resized);
    next.size.set(pair - resized);
    this.resized.emit(panels.map(item => item.size() ?? 0));
  }
}
