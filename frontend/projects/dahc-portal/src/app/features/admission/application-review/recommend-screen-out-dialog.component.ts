import { ChangeDetectionStrategy, Component, effect, inject, model, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  DahcAlertComponent,
  DahcButtonComponent,
  DahcFormFieldComponent,
  DahcInputDirective,
  DahcModalComponent,
  DahcSelectComponent,
  DahcSelectOption,
} from 'dahc-ui';

import { NOTE_MAX_LENGTH, ReviewActionDone, controlError, newIdempotencyKey, problemText } from './review-support';
import { ReviewFacade } from './review.facade';

/**
 * Recommends screening out the application (US-2.4.1): a reason from lookup SCREEN_OUT_REASON and
 * an optional note (D-23). The supervisor decides; the application leaves the officer's inbox
 * until then.
 */
@Component({
  selector: 'dahc-recommend-screen-out-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcAlertComponent, DahcButtonComponent, DahcFormFieldComponent, DahcInputDirective, DahcModalComponent, DahcSelectComponent, ReactiveFormsModule],
  styleUrl: './review-dialogs.scss',
  template: `
    <dahc-modal [(open)]="open" i18n-heading="@@portal.admission.review.screenOut.heading" heading="Recommend screen out">
      <form class="review-form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <p class="review-muted" i18n="@@portal.admission.review.screenOut.text">A supervisor must endorse the screen-out before the candidate is told.</p>
        <dahc-select
          formControlName="reason"
          i18n-label="@@portal.admission.review.screenOut.reason"
          label="Screen-out reason"
          [required]="true"
          [options]="reasons()"
          [invalid]="reasonError() !== ''"
          [errorMessage]="reasonError()" />
        <dahc-form-field
          i18n-label="@@portal.admission.review.screenOut.note"
          label="Note for the supervisor (optional)"
          [showCount]="true"
          [invalid]="noteError() !== ''"
          [error]="noteError()">
          <textarea dahcInput formControlName="note" [attr.maxlength]="maxLength"></textarea>
        </dahc-form-field>
        @if (error() !== '') {
          <dahc-alert variant="error" [announce]="true">{{ error() }}</dahc-alert>
        }
      </form>
      <div dahcDialogFooter class="review-buttons">
        <button dahc-button type="button" variant="secondary" (click)="open.set(false)" i18n="@@portal.action.cancel">Cancel</button>
        <button dahc-button type="button" variant="danger" [loading]="busy()" (click)="submit()" i18n="@@portal.admission.review.screenOut.submit">Send recommendation</button>
      </div>
    </dahc-modal>
  `,
})
export class RecommendScreenOutDialogComponent {
  private readonly facade = inject(ReviewFacade);

  readonly open = model<boolean>(false);
  readonly completed = output<ReviewActionDone>();

  protected readonly maxLength = NOTE_MAX_LENGTH;
  protected readonly form = new FormGroup({
    reason: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    note: new FormControl<string>('', { nonNullable: true, validators: [Validators.maxLength(NOTE_MAX_LENGTH)] }),
  });
  protected readonly reasons = signal<readonly DahcSelectOption[]>([]);
  protected readonly busy = signal<boolean>(false);
  protected readonly error = signal<string>('');
  protected readonly attempted = signal<boolean>(false);
  private key = newIdempotencyKey();

  constructor() {
    effect(() => {
      if (this.open()) {
        this.form.reset();
        this.attempted.set(false);
        this.error.set('');
        this.key = newIdempotencyKey();
        void this.loadReasons();
      }
    });
  }

  protected reasonError(): string {
    return controlError(this.form.controls.reason, this.attempted());
  }

  protected noteError(): string {
    return controlError(this.form.controls.note, this.attempted());
  }

  protected async submit(): Promise<void> {
    this.attempted.set(true);
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    const value = this.form.getRawValue();
    this.busy.set(true);
    this.error.set('');

    try {
      await this.facade.recommendScreenOut(value.reason, value.note.trim() === '' ? null : value.note.trim(), this.key);
      this.open.set(false);
      this.completed.emit({ message: $localize`:@@portal.admission.review.screenOut.done:Your screen-out recommendation was sent to the supervisor.`, leave: true });
    } catch (error: unknown) {
      this.error.set(problemText(error));
    } finally {
      this.busy.set(false);
    }
  }

  private async loadReasons(): Promise<void> {
    try {
      const items = await this.facade.lookup('SCREEN_OUT_REASON');
      this.reasons.set(items.map(item => ({ value: item.code, label: item.label })));
    } catch (error: unknown) {
      this.error.set(problemText(error));
    }
  }
}
