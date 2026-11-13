import { DOCUMENT, Directive, ElementRef, afterRenderEffect, inject, input, model, output, viewChild } from '@angular/core';

import { dahcUniqueId } from '../../core/a11y/unique-id';

export type DahcDialogCloseReason = 'close-button' | 'escape' | 'backdrop' | 'api';

/** Emitted before a dialog closes. Call cancel() to keep it open, for example to confirm unsaved changes. */
export interface DahcDialogCloseRequest {
  readonly reason: DahcDialogCloseReason;
  cancel(): void;
}

/**
 * Shared behaviour of dahc-modal and dahc-drawer, built on the native <dialog>:
 * showModal() gives a real focus trap, Escape handling and an inert page behind; focus returns
 * to the element that opened the dialog; closing can be cancelled through closeRequested.
 * Ported from dubai-health-ui (packages/components/src/internal/dialog-base.ts).
 */
@Directive({
  host: {
    // Clicks bubble from the <dialog> to the host; a click on the dialog itself hit the backdrop.
    '(click)': 'onDialogClick($event)',
  },
})
export abstract class DahcDialogBase {
  /** Whether the dialog is shown: [(open)]. */
  readonly open = model<boolean>(false);
  /** Title and accessible name of the dialog. */
  readonly heading = input<string>('');
  /** Shows the close button. */
  readonly closable = input<boolean>(true);
  /** A click on the backdrop requests closing. */
  readonly closeOnBackdrop = input<boolean>(true);
  readonly closeLabel = input<string>($localize`:@@dahcUi.dialog.close:Close`);
  readonly opened = output<void>();
  readonly closeRequested = output<DahcDialogCloseRequest>();

  protected readonly headingId = dahcUniqueId('dahc-dialog-title');
  protected readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  private readonly document = inject(DOCUMENT);
  private returnFocus: HTMLElement | null = null;

  constructor() {
    afterRenderEffect(() => this.sync(this.open()));
  }

  /** Asks to close the dialog; listeners of closeRequested can cancel it. */
  requestClose(reason: DahcDialogCloseReason = 'api'): void {
    if (!this.open()) {
      return;
    }

    let cancelled = false;
    this.closeRequested.emit({ reason, cancel: () => (cancelled = true) });

    if (!cancelled) {
      this.open.set(false);
    }
  }

  /** Escape: the browser's own close is replaced by a cancellable request. */
  protected onCancel(event: Event): void {
    event.preventDefault();
    this.requestClose('escape');
  }

  /** A click whose target is the <dialog> itself landed on the backdrop. */
  protected onDialogClick(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement && this.closeOnBackdrop()) {
      this.requestClose('backdrop');
    }
  }

  private sync(open: boolean): void {
    const dialog = this.dialog().nativeElement;

    if (open && !dialog.open) {
      const active = this.document.activeElement;
      this.returnFocus = active instanceof HTMLElement ? active : null;
      dialog.showModal();
      this.opened.emit();
    } else if (!open && dialog.open) {
      dialog.close();
      this.returnFocus?.focus();
      this.returnFocus = null;
    }
  }
}
