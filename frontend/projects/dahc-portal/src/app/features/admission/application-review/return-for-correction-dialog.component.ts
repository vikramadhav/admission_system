import { ChangeDetectionStrategy, Component, effect, inject, model, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DahcAlertComponent, DahcButtonComponent, DahcDatePickerComponent, DahcModalComponent, dahcToIsoDate } from 'dahc-ui';

import { ReviewActionDone, controlError, newIdempotencyKey, problemText } from './review-support';
import { ReviewFacade } from './review.facade';

function isoDate(date: Date): string {
  return dahcToIsoDate({ year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() });
}

/** Default correction period until the configured grace period has a source (PQ-11, OQ-C8). */
const DEFAULT_CORRECTION_DAYS = 14;

/**
 * Returns the application to the candidate for correction (US-2.3.3). Only offered once flags
 * are saved. The candidate can then edit only the flagged items, and the application stays with
 * this officer.
 */
@Component({
  selector: 'dahc-return-for-correction-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcAlertComponent, DahcButtonComponent, DahcDatePickerComponent, DahcModalComponent, ReactiveFormsModule],
  styleUrl: './review-dialogs.scss',
  template: `
    <dahc-modal [(open)]="open" i18n-heading="@@portal.admission.review.return.heading" heading="Return for correction">
      <form class="review-form" (submit)="$event.preventDefault(); submit()" novalidate>
        <p class="review-text" i18n="@@portal.admission.review.return.text">
          The candidate will be e-mailed and can correct only the {facade.savedFlags().length, plural, =1 {flagged item} other {{{ facade.savedFlags().length }} flagged items}}.
          The application stays assigned to you.
        </p>
        <dahc-date-picker
          [formControl]="deadline"
          i18n-label="@@portal.admission.review.return.deadline"
          label="Correction deadline"
          i18n-hint="@@portal.admission.review.return.deadlineHint"
          hint="The application is archived if the candidate does not respond by this date."
          [required]="true"
          [min]="today"
          [invalid]="deadlineError() !== ''"
          [errorMessage]="deadlineError()" />
        @if (error() !== '') {
          <dahc-alert variant="error" [announce]="true">{{ error() }}</dahc-alert>
        }
      </form>
      <div dahcDialogFooter class="review-buttons">
        <button dahc-button type="button" variant="secondary" (click)="open.set(false)" i18n="@@portal.action.cancel">Cancel</button>
        <button dahc-button type="button" [loading]="busy()" (click)="submit()" i18n="@@portal.admission.review.return.submit">Return to candidate</button>
      </div>
    </dahc-modal>
  `,
})
export class ReturnForCorrectionDialogComponent {
  protected readonly facade = inject(ReviewFacade);

  readonly open = model<boolean>(false);
  readonly completed = output<ReviewActionDone>();

  protected readonly today = isoDate(new Date());
  protected readonly deadline = new FormControl<string>('', { nonNullable: true, validators: [Validators.required] });
  protected readonly busy = signal<boolean>(false);
  protected readonly error = signal<string>('');
  protected readonly attempted = signal<boolean>(false);
  private key = newIdempotencyKey();

  constructor() {
    effect(() => {
      if (this.open()) {
        this.deadline.reset(isoDate(new Date(Date.now() + DEFAULT_CORRECTION_DAYS * 86_400_000)));
        this.attempted.set(false);
        this.error.set('');
        this.key = newIdempotencyKey();
      }
    });
  }

  protected deadlineError(): string {
    return controlError(this.deadline, this.attempted());
  }

  protected async submit(): Promise<void> {
    this.attempted.set(true);
    this.deadline.markAsTouched();

    if (this.deadline.invalid) {
      return;
    }

    this.busy.set(true);
    this.error.set('');

    try {
      // End of the chosen day in the browser's zone, sent as UTC with its offset (D-07).
      await this.facade.returnForCorrection(new Date(`${this.deadline.value}T23:59:59`).toISOString(), this.key);
      this.open.set(false);
      this.completed.emit({ message: $localize`:@@portal.admission.review.return.done:The application was returned to the candidate for correction.`, leave: true });
    } catch (error: unknown) {
      this.error.set(problemText(error));
    } finally {
      this.busy.set(false);
    }
  }
}
