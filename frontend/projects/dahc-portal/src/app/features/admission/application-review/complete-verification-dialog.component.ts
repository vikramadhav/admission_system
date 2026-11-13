import { ChangeDetectionStrategy, Component, effect, inject, model, output, signal } from '@angular/core';
import { DahcAlertComponent, DahcButtonComponent, DahcModalComponent } from 'dahc-ui';

import { ReviewActionDone, newIdempotencyKey, problemText } from './review-support';
import { ReviewFacade } from './review.facade';

/**
 * Completes the verification workstream (US-2.3.5). The application moves to Review Completed
 * only when portfolio scoring is also complete; the candidate is told at score announcement.
 */
@Component({
  selector: 'dahc-complete-verification-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcAlertComponent, DahcButtonComponent, DahcModalComponent],
  styleUrl: './review-dialogs.scss',
  template: `
    <dahc-modal [(open)]="open" size="sm" i18n-heading="@@portal.admission.review.complete.heading" heading="Complete verification?">
      <div class="review-form">
        <p class="review-text" i18n="@@portal.admission.review.complete.text">
          You confirm that the application data and attachments are verified. The application leaves your inbox and cannot be changed by you
          afterwards.
        </p>
        @if (facade.flagsDirty()) {
          <dahc-alert variant="warning" i18n="@@portal.admission.review.complete.unsavedFlags">Your unsaved flags will be discarded.</dahc-alert>
        }
        @if (error() !== '') {
          <dahc-alert variant="error" [announce]="true">{{ error() }}</dahc-alert>
        }
      </div>
      <div dahcDialogFooter class="review-buttons">
        <button dahc-button type="button" variant="secondary" (click)="open.set(false)" i18n="@@portal.action.cancel">Cancel</button>
        <button dahc-button type="button" [loading]="busy()" (click)="submit()" i18n="@@portal.admission.review.complete.submit">Complete verification</button>
      </div>
    </dahc-modal>
  `,
})
export class CompleteVerificationDialogComponent {
  protected readonly facade = inject(ReviewFacade);

  readonly open = model<boolean>(false);
  readonly completed = output<ReviewActionDone>();

  protected readonly busy = signal<boolean>(false);
  protected readonly error = signal<string>('');
  private key = newIdempotencyKey();

  constructor() {
    effect(() => {
      if (this.open()) {
        this.error.set('');
        this.key = newIdempotencyKey();
      }
    });
  }

  protected async submit(): Promise<void> {
    this.busy.set(true);
    this.error.set('');

    try {
      await this.facade.completeVerification(this.key);
      this.open.set(false);
      this.completed.emit({ message: $localize`:@@portal.admission.review.complete.done:Verification completed.`, leave: true });
    } catch (error: unknown) {
      this.error.set(problemText(error));
    } finally {
      this.busy.set(false);
    }
  }
}
