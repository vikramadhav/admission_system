import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input } from '@angular/core';

import { DahcMessage, DahcMessageService } from './message.service';

/**
 * Where DahcMessageService messages appear: place <dahc-message-region /> once in the root
 * template. Messages show at the top centre as pills with a status dot; the list is a polite live
 * region and error messages use role="alert". The timer pauses while the pointer or focus is on a
 * message (WCAG 2.2.1). DERIVED design (UDD-019). Ported from dubai-health-ui dh-message
 * (overlay/dh-toast.ts).
 */
@Component({
  selector: 'dahc-message-region',
  template: `
    <section class="dahc-message-region" [attr.aria-label]="label()">
      <ol class="dahc-message-region__list" aria-live="polite">
        @for (message of service.messages(); track message.id) {
          <li
            [class]="'dahc-message dahc-message--' + message.variant"
            [attr.role]="message.variant === 'error' ? 'alert' : null"
            (pointerenter)="pause(message)"
            (pointerleave)="resume(message)"
            (focusin)="pause(message)"
            (focusout)="resume(message)">
            <span class="dahc-message__dot" aria-hidden="true"></span>
            <span class="dahc-message__text">{{ message.text }}</span>
            @if (message.duration <= 0) {
              <button type="button" class="dahc-message__dismiss" (click)="service.dismiss(message.id)">
                <span aria-hidden="true">×</span>
                <span class="dahc-visually-hidden">{{ dismissLabel() }}</span>
              </button>
            }
          </li>
        }
      </ol>
    </section>
  `,
  styleUrl: './message-region.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DahcMessageRegionComponent {
  readonly label = input<string>($localize`:@@dahcUi.message.region:Messages`);
  readonly dismissLabel = input<string>($localize`:@@dahcUi.message.dismiss:Dismiss message`);

  protected readonly service = inject(DahcMessageService);

  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();
  private readonly paused = new Set<number>();

  constructor() {
    effect(() => {
      const messages = this.service.messages();
      const ids = new Set(messages.map(message => message.id));

      for (const message of messages) {
        if (!this.paused.has(message.id)) {
          this.start(message);
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

  protected pause(message: DahcMessage): void {
    this.paused.add(message.id);
    this.stop(message.id);
  }

  protected resume(message: DahcMessage): void {
    this.paused.delete(message.id);
    this.start(message);
  }

  private start(message: DahcMessage): void {
    if (message.duration > 0 && !this.timers.has(message.id)) {
      this.timers.set(
        message.id,
        setTimeout(() => this.service.dismiss(message.id), message.duration),
      );
    }
  }

  private stop(id: number): void {
    clearTimeout(this.timers.get(id));
    this.timers.delete(id);
  }
}
