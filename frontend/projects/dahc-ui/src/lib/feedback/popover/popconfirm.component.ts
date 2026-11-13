import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { DahcButtonComponent } from '../../actions/button/button.component';
import { dahcUniqueId } from '../../core/a11y/unique-id';
import { DahcPopupBase } from './popup-base';

/**
 * Asks for confirmation next to the element that triggered an action (role="alertdialog"):
 * <dahc-popconfirm heading="Delete this file?" (confirmed)="delete()"><button dahc-button dahcPopoverTrigger>Delete</button></dahc-popconfirm>
 * Focus moves to the confirm button when it opens; Escape or a click outside cancels and returns
 * focus to the trigger. DERIVED design (UDD-019) with DH secondary and primary small buttons.
 * Ported from dubai-health-ui dh-popconfirm (overlay/dh-popups.ts).
 */
@Component({
  selector: 'dahc-popconfirm',
  template: `
    <span class="dahc-popover__trigger">
      <ng-content select="[dahcPopoverTrigger]" />
    </span>
    <div
      #panel
      class="dahc-popup dahc-popover__panel"
      popover="manual"
      role="alertdialog"
      [id]="panelId"
      [attr.aria-labelledby]="headingId"
      [attr.aria-describedby]="bodyId"
      (keydown)="onPanelKeydown($event)">
      <p class="dahc-popover__heading dahc-popconfirm__heading" [id]="headingId">{{ heading() }}</p>
      <div class="dahc-popconfirm__body" [id]="bodyId"><ng-content /></div>
      <div class="dahc-popconfirm__actions">
        <button dahc-button type="button" variant="secondary" size="sm" (click)="answer(false)">{{ cancelText() }}</button>
        <button #ok dahc-button type="button" size="sm" (click)="answer(true)">{{ okText() }}</button>
      </div>
    </div>
  `,
  styleUrl: './popover.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcButtonComponent],
})
export class DahcPopconfirmComponent extends DahcPopupBase {
  readonly heading = input<string>($localize`:@@dahcUi.popconfirm.heading:Are you sure?`);
  readonly okText = input<string>($localize`:@@dahcUi.popconfirm.ok:Yes`);
  readonly cancelText = input<string>($localize`:@@dahcUi.popconfirm.cancel:No`);
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  protected readonly popupRole = 'dialog' as const;
  protected readonly headingId = dahcUniqueId('dahc-popconfirm-heading');
  protected readonly bodyId = dahcUniqueId('dahc-popconfirm-body');

  protected answer(ok: boolean): void {
    if (ok) {
      this.confirmed.emit();
    } else {
      this.cancelled.emit();
    }

    this.close(true);
  }

  protected focusPanel(): void {
    this.panel().nativeElement.querySelector<HTMLButtonElement>('.dahc-popconfirm__actions button:last-child')?.focus();
  }
}
