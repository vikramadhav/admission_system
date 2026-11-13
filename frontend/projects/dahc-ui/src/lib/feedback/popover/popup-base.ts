import {
  DOCUMENT,
  DestroyRef,
  Directive,
  ElementRef,
  afterRenderEffect,
  contentChild,
  effect,
  inject,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';

import { dahcUniqueId } from '../../core/a11y/unique-id';
import { DahcPlacement, dahcAutoUpdate, dahcPositionFloating } from '../../core/overlay/position';

/**
 * Marks the element that opens a dahc-popover or dahc-popconfirm:
 * <dahc-popover heading="Points"><button dahc-button dahcPopoverTrigger>Details</button>…</dahc-popover>
 */
@Directive({ selector: '[dahcPopoverTrigger]' })
export class DahcPopoverTriggerDirective {
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
}

/**
 * Shared click-triggered popup: the projected [dahcPopoverTrigger] toggles a panel shown in the top
 * layer (Popover API) next to it. Escape and outside clicks close it and focus returns to the
 * trigger; Tab closes it and moves on. Ported from dubai-health-ui PopupBase (overlay/dh-popups.ts).
 */
@Directive({
  host: {
    '(document:pointerdown)': 'onDocumentPointerDown($event)',
    '(click)': 'onHostClick($event)',
    '(keydown)': 'onHostKeydown($event)',
  },
})
export abstract class DahcPopupBase {
  readonly open = model<boolean>(false);
  readonly placement = input<DahcPlacement>('bottom');
  readonly opened = output<void>();

  protected readonly panelId = dahcUniqueId('dahc-popup');
  protected readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');

  private readonly triggerRef = contentChild(DahcPopoverTriggerDirective);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  private stopAutoUpdate: (() => void) | null = null;

  /** The ARIA popup type the trigger announces. */
  protected abstract readonly popupRole: 'dialog';

  /** Moves focus into the open panel. */
  protected abstract focusPanel(): void;

  constructor() {
    effect(() => {
      const trigger = this.triggerRef()?.element.nativeElement;

      if (trigger) {
        trigger.setAttribute('aria-haspopup', this.popupRole);
        trigger.setAttribute('aria-expanded', String(this.open()));
        trigger.setAttribute('aria-controls', this.panelId);
      }
    });

    afterRenderEffect(() => this.sync(this.open()));
    inject(DestroyRef).onDestroy(() => this.stopAutoUpdate?.());
  }

  close(returnFocus = true): void {
    this.open.set(false);

    if (returnFocus) {
      this.triggerRef()?.element.nativeElement.focus();
    }
  }

  /** Clicks on the trigger toggle the panel (the trigger itself is a button, so keyboard works). */
  protected onHostClick(event: MouseEvent): void {
    if (this.isFromTrigger(event)) {
      this.open.update(open => !open);
    }
  }

  protected onHostKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' && !this.open() && this.isFromTrigger(event)) {
      event.preventDefault();
      this.open.set(true);
    } else if (event.key === 'Escape' && this.open()) {
      // Also when focus is still on the trigger.
      event.preventDefault();
      event.stopPropagation();
      this.close(true);
    }
  }

  private isFromTrigger(event: Event): boolean {
    const trigger = this.triggerRef()?.element.nativeElement;

    return trigger !== undefined && event.target instanceof Node && trigger.contains(event.target);
  }

  /** Tab out of the panel closes it (Escape is handled on the host). */
  protected onPanelKeydown(event: KeyboardEvent): void {
    if (event.key === 'Tab') {
      this.close(false);
    }
  }

  protected onDocumentPointerDown(event: PointerEvent): void {
    if (this.open() && !event.composedPath().includes(this.host.nativeElement)) {
      this.close(false);
    }
  }

  private sync(open: boolean): void {
    const panel = this.panel().nativeElement;
    const trigger = this.triggerRef()?.element.nativeElement;
    const isOpen = panel.matches(':popover-open');

    if (open && !isOpen && trigger) {
      panel.showPopover();
      const place = (): void => {
        dahcPositionFloating(trigger, panel, { placement: this.placement(), offset: 8 });
      };
      place();
      const view = this.document.defaultView;
      this.stopAutoUpdate = view ? dahcAutoUpdate(view, place) : null;
      this.focusPanel();
      this.opened.emit();
    } else if (!open && isOpen) {
      this.stopAutoUpdate?.();
      this.stopAutoUpdate = null;
      panel.hidePopover();
    }
  }
}
