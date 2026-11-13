import { DOCUMENT, DestroyRef, Directive, ElementRef, effect, inject, input } from '@angular/core';

import { dahcUniqueId } from '../../core/a11y/unique-id';
import { DahcPlacement, dahcAutoUpdate, dahcPositionFloating } from '../../core/overlay/position';

/** Delay before a tooltip appears on hover, and before it hides after the pointer leaves. */
const SHOW_DELAY_MS = 300;
const HIDE_DELAY_MS = 100;

/**
 * Short text hint for its host element, shown on hover and keyboard focus:
 * <button dahc-icon-button icon="help" dahcTooltip="Help with this question">Help</button>
 * Meets WCAG 1.4.13: it can be dismissed with Escape, stays open while the pointer is over it,
 * and hides when focus and pointer leave. The text describes the host (aria-describedby); it must
 * not be the only accessible name of the host.
 * DERIVED design (DH has a dark tooltip example only): navy surface, white Regular 14/18, radius 8,
 * Shadow 3. Ported from dubai-health-ui (tooltip/dh-tooltip.ts) as a directive.
 */
@Directive({
  selector: '[dahcTooltip]',
  host: {
    '[attr.aria-describedby]': 'tooltipText() ? tooltipId : null',
    '(pointerenter)': 'schedule(true)',
    '(pointerleave)': 'schedule(false)',
    '(focusin)': 'show()',
    '(focusout)': 'hide()',
    '(keydown.escape)': 'onEscape($event)',
  },
})
export class DahcTooltipDirective {
  readonly tooltipText = input<string>('', { alias: 'dahcTooltip' });
  readonly tooltipPlacement = input<DahcPlacement>('top');

  protected readonly tooltipId = dahcUniqueId('dahc-tooltip');

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  private readonly tooltip: HTMLElement;
  private showTimer: ReturnType<typeof setTimeout> | undefined;
  private hideTimer: ReturnType<typeof setTimeout> | undefined;
  private stopAutoUpdate: (() => void) | null = null;

  constructor() {
    this.tooltip = this.createTooltip();

    effect(() => {
      this.tooltip.textContent = this.tooltipText();
    });

    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.showTimer);
      clearTimeout(this.hideTimer);
      this.stopAutoUpdate?.();
      this.tooltip.remove();
    });
  }

  show(): void {
    clearTimeout(this.hideTimer);

    if (!this.tooltipText() || this.tooltip.matches(':popover-open')) {
      return;
    }

    this.tooltip.showPopover();
    const place = (): void => {
      dahcPositionFloating(this.host.nativeElement, this.tooltip, {
        placement: this.tooltipPlacement(),
        offset: 8,
        center: true,
      });
    };
    place();
    const view = this.document.defaultView;
    this.stopAutoUpdate = view ? dahcAutoUpdate(view, place) : null;
  }

  hide(): void {
    clearTimeout(this.showTimer);
    this.stopAutoUpdate?.();
    this.stopAutoUpdate = null;

    if (this.tooltip.matches(':popover-open')) {
      this.tooltip.hidePopover();
    }
  }

  protected schedule(visible: boolean): void {
    clearTimeout(this.showTimer);
    clearTimeout(this.hideTimer);

    if (visible) {
      this.showTimer = setTimeout(() => this.show(), SHOW_DELAY_MS);
    } else {
      this.hideTimer = setTimeout(() => this.hide(), HIDE_DELAY_MS);
    }
  }

  protected onEscape(event: Event): void {
    if (this.tooltip.matches(':popover-open')) {
      event.stopPropagation();
      this.hide();
    }
  }

  /** The tooltip lives at the end of the body so no ancestor can clip it; text only, never HTML. */
  private createTooltip(): HTMLElement {
    const tooltip = this.document.createElement('div');
    tooltip.id = this.tooltipId;
    tooltip.className = 'dahc-tooltip';
    tooltip.setAttribute('role', 'tooltip');
    tooltip.setAttribute('popover', 'manual');
    tooltip.addEventListener('pointerenter', () => clearTimeout(this.hideTimer));
    tooltip.addEventListener('pointerleave', () => this.schedule(false));
    this.document.body.append(tooltip);

    return tooltip;
  }
}
