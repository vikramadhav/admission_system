import { Injectable, Signal, signal } from '@angular/core';

export type DahcMessageVariant = 'info' | 'success' | 'warning' | 'error';

export interface DahcMessage {
  readonly id: number;
  readonly text: string;
  readonly variant: DahcMessageVariant;
  readonly duration: number;
}

const DEFAULT_DURATION_MS = 3000;

/**
 * Compact global messages ("Saved", "Copied") shown at the top centre by the dahc-message-region
 * the app places once. Ported from dubai-health-ui dh-message (overlay/dh-toast.ts, message()).
 */
@Injectable({ providedIn: 'root' })
export class DahcMessageService {
  private readonly messageList = signal<readonly DahcMessage[]>([]);
  private nextId = 1;

  readonly messages: Signal<readonly DahcMessage[]> = this.messageList.asReadonly();

  /** Shows a message and returns its id. duration 0 keeps it until dismissed (default 3000ms). */
  show(text: string, variant: DahcMessageVariant = 'info', duration = DEFAULT_DURATION_MS): number {
    const message: DahcMessage = { id: this.nextId++, text, variant, duration };
    this.messageList.update(messages => [...messages, message]);

    return message.id;
  }

  dismiss(id: number): void {
    this.messageList.update(messages => messages.filter(message => message.id !== id));
  }

  clear(): void {
    this.messageList.set([]);
  }
}
