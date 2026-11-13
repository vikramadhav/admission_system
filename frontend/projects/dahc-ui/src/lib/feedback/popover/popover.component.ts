import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { DahcPopupBase } from './popup-base';

/**
 * Click-triggered panel with extra details next to its trigger (non-modal dialog):
 * <dahc-popover heading="How points work"><button dahc-button dahcPopoverTrigger>Details</button>Text…</dahc-popover>
 * The panel takes focus when it opens; Escape or a click outside closes it and returns focus.
 * DERIVED design (UDD-019): DH dropdown panel (white, radius 12, Shadow 4), 320px wide, 16px padding.
 * Ported from dubai-health-ui dh-popover (overlay/dh-popups.ts).
 */
@Component({
  selector: 'dahc-popover',
  template: `
    <span class="dahc-popover__trigger">
      <ng-content select="[dahcPopoverTrigger]" />
    </span>
    <div
      #panel
      class="dahc-popup dahc-popover__panel"
      popover="manual"
      role="dialog"
      tabindex="-1"
      [id]="panelId"
      [attr.aria-label]="heading() || fallbackLabel()"
      (keydown)="onPanelKeydown($event)">
      @if (heading() !== '') {
        <p class="dahc-popover__heading">{{ heading() }}</p>
      }
      <div class="dahc-popover__body"><ng-content /></div>
    </div>
  `,
  styleUrl: './popover.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DahcPopoverComponent extends DahcPopupBase {
  readonly heading = input<string>('');
  /** Accessible name of the panel when there is no heading. */
  readonly fallbackLabel = input<string>($localize`:@@dahcUi.popover.label:Details`);

  protected readonly popupRole = 'dialog' as const;

  protected focusPanel(): void {
    this.panel().nativeElement.focus();
  }
}
