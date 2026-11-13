import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input } from '@angular/core';

import { DahcIconComponent } from '../../core/icon/icon.component';
import { DahcIconName } from '../../core/icon/icon-names';
import { DahcNotification, DahcNotificationService, DahcNotificationVariant } from './notification.service';

const ICONS: Record<DahcNotificationVariant, DahcIconName> = {
  info: 'information',
  success: 'check',
  warning: 'information',
  error: 'close',
};

/**
 * Where DahcNotificationService cards appear: place <dahc-notification-region /> once in the
 * root template. Cards stack in the top-end corner below an 80px app header; the list is a polite
 * live region and error cards use role="alert" (dubai-health-ui uses role="alert" for errors and
 * "status" otherwise). Timers pause on hover and focus (WCAG 2.2.1).
 * PARTIAL design: DH documents the status tints; layout DERIVED. Ported from dubai-health-ui
 * dh-notification (overlay/dh-toast.ts): white card, radius 12, Shadow 4, tinted round dismiss.
 * The 4px status edge of the original is replaced by a status icon (owner decision: no thick
 * start edge on alerts and toasts).
 */
@Component({
  selector: 'dahc-notification-region',
  templateUrl: './notification-region.component.html',
  styleUrl: './notification-region.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcIconComponent],
})
export class DahcNotificationRegionComponent {
  readonly label = input<string>($localize`:@@dahcUi.notification.region:Notifications`);
  readonly dismissLabel = input<string>($localize`:@@dahcUi.notification.dismiss:Dismiss notification`);

  protected readonly service = inject(DahcNotificationService);
  protected readonly icons = ICONS;

  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();
  private readonly paused = new Set<number>();

  constructor() {
    effect(() => {
      const items = this.service.notifications();
      const ids = new Set(items.map(item => item.id));

      for (const item of items) {
        if (!this.paused.has(item.id)) {
          this.start(item);
        }
      }

      for (const id of this.timers.keys()) {
        if (!ids.has(id)) {
          this.stop(id);
        }
      }

      for (const id of this.paused) {
        if (!ids.has(id)) {
          this.paused.delete(id);
        }
      }
    });

    inject(DestroyRef).onDestroy(() => {
      for (const id of this.timers.keys()) {
        this.stop(id);
      }
    });
  }

  protected pause(item: DahcNotification): void {
    this.paused.add(item.id);
    this.stop(item.id);
  }

  protected resume(item: DahcNotification): void {
    this.paused.delete(item.id);
    this.start(item);
  }

  private start(item: DahcNotification): void {
    if (item.duration > 0 && !this.timers.has(item.id)) {
      this.timers.set(
        item.id,
        setTimeout(() => this.service.dismiss(item.id), item.duration),
      );
    }
  }

  private stop(id: number): void {
    clearTimeout(this.timers.get(id));
    this.timers.delete(id);
  }
}
