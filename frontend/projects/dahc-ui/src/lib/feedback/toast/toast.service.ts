import { Injectable, Signal, signal } from '@angular/core';

export type DahcToastVariant = 'info' | 'success' | 'warning' | 'error';

export interface DahcToastOptions {
  readonly variant?: DahcToastVariant;
  readonly heading: string;
  readonly message?: string;
  /** Milliseconds before the toast closes itself; 0 keeps it until dismissed. Default 5000. */
  readonly duration?: number;
}

export interface DahcToast {
  readonly id: number;
  readonly variant: DahcToastVariant;
  readonly heading: string;
  readonly message: string;
  readonly duration: number;
}

const DEFAULT_DURATION_MS = 5000;

/**
 * Shows short notifications ("Draft saved") in the dahc-toast-region the app places once, near
 * the end of its root template. Ported from dubai-health-ui (overlay/dh-toast.ts, notify()).
 */
@Injectable({ providedIn: 'root' })
export class DahcToastService {
  private readonly toastList = signal<readonly DahcToast[]>([]);
  private nextId = 1;

  readonly toasts: Signal<readonly DahcToast[]> = this.toastList.asReadonly();

  /** Shows a toast and returns its id. */
  show(options: DahcToastOptions): number {
    const toast: DahcToast = {
      id: this.nextId++,
      variant: options.variant ?? 'info',
      heading: options.heading,
      message: options.message ?? '',
      duration: options.duration ?? DEFAULT_DURATION_MS,
    };
    this.toastList.update(toasts => [...toasts, toast]);

    return toast.id;
  }

  dismiss(id: number): void {
    this.toastList.update(toasts => toasts.filter(toast => toast.id !== id));
  }

  clear(): void {
    this.toastList.set([]);
  }
}
