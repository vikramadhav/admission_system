import { Injectable, Signal, signal } from '@angular/core';

export type DahcNotificationVariant = 'info' | 'success' | 'warning' | 'error';

export interface DahcNotificationOptions {
  readonly variant?: DahcNotificationVariant;
  readonly heading: string;
  readonly message?: string;
  /** Milliseconds before the card closes itself; 0 keeps it until dismissed. Default 5000. */
  readonly duration?: number;
}

export interface DahcNotification {
  readonly id: number;
  readonly variant: DahcNotificationVariant;
  readonly heading: string;
  readonly message: string;
  readonly duration: number;
}

const DEFAULT_DURATION_MS = 5000;

/**
 * Notification cards (heading and message) in the top-end corner, shown by the
 * dahc-notification-region the app places once. Ported from dubai-health-ui dh-notification
 * (overlay/dh-toast.ts, notify()). DahcToastService covers the same need with the GME tinted
 * toast; this is the DH white card.
 */
@Injectable({ providedIn: 'root' })
export class DahcNotificationService {
  private readonly list = signal<readonly DahcNotification[]>([]);
  private nextId = 1;

  readonly notifications: Signal<readonly DahcNotification[]> = this.list.asReadonly();

  /** Shows a notification and returns its id. */
  notify(options: DahcNotificationOptions): number {
    const notification: DahcNotification = {
      id: this.nextId++,
      variant: options.variant ?? 'info',
      heading: options.heading,
      message: options.message ?? '',
      duration: options.duration ?? DEFAULT_DURATION_MS,
    };
    this.list.update(items => [...items, notification]);

    return notification.id;
  }

  dismiss(id: number): void {
    this.list.update(items => items.filter(item => item.id !== id));
  }

  clear(): void {
    this.list.set([]);
  }
}
