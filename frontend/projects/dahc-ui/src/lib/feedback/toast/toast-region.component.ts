import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input } from '@angular/core';

import { DahcIconComponent } from '../../core/icon/icon.component';
import { DahcIconName } from '../../core/icon/icon-names';
import { DahcToast, DahcToastService, DahcToastVariant } from './toast.service';

const ICONS: Record<DahcToastVariant, DahcIconName> = {
  info: 'information',
  success: 'check',
  warning: 'information',
  error: 'close',
};

/**
 * Where DahcToastService notifications appear: place <dahc-toast-region /> once in the app's root
 * template. The list is a permanent polite live region; error toasts use role="alert". A toast
 * with a duration closes itself, but the timer pauses while the pointer or keyboard focus is on
 * it (WCAG 2.2.1). PARTIAL design: DH documents Orange for "Notification banners" and the status
 * tints; the layout is DERIVED (GME ToastBanner), pending UX sign-off.
 * Ported from dubai-health-ui (packages/components/src/overlay/dh-toast.ts).
 */
@Component({
  selector: 'dahc-toast-region',
  templateUrl: './toast-region.component.html',
  styleUrl: './toast-region.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcIconComponent],
})
export class DahcToastRegionComponent {
  readonly label = input<string>($localize`:@@dahcUi.toast.region:Notifications`);
  readonly dismissLabel = input<string>($localize`:@@dahcUi.toast.dismiss:Dismiss notification`);

  protected readonly service = inject(DahcToastService);
  protected readonly icons = ICONS;

  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();
  private readonly paused = new Set<number>();

  constructor() {
    effect(() => {
      const ids = new Set(this.service.toasts().map(toast => toast.id));

      for (const toast of this.service.toasts()) {
        if (!this.timers.has(toast.id) && !this.paused.has(toast.id)) {
          this.startTimer(toast);
        }
      }

      for (const id of this.timers.keys()) {
        if (!ids.has(id)) {
          this.stopTimer(id);
        }
      }
    });

    inject(DestroyRef).onDestroy(() => {
      for (const id of this.timers.keys()) {
        this.stopTimer(id);
      }
    });
  }

  protected dismiss(toast: DahcToast): void {
    this.service.dismiss(toast.id);
  }

  protected pause(toast: DahcToast): void {
    this.paused.add(toast.id);
    this.stopTimer(toast.id);
  }

  protected resume(toast: DahcToast): void {
    this.paused.delete(toast.id);
    this.startTimer(toast);
  }

  private startTimer(toast: DahcToast): void {
    if (toast.duration <= 0 || this.timers.has(toast.id)) {
      return;
    }

    this.timers.set(
      toast.id,
      setTimeout(() => this.service.dismiss(toast.id), toast.duration),
    );
  }

  private stopTimer(id: number): void {
    clearTimeout(this.timers.get(id));
    this.timers.delete(id);
  }
}
