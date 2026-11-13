import { ChangeDetectionStrategy, Component, effect, inject, model, output, signal } from '@angular/core';
import { AbstractControl, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DahcAlertComponent, DahcButtonComponent, DahcFormFieldComponent, DahcInputDirective, DahcModalComponent } from 'dahc-ui';

import { PortfolioScoringFacade, problemText } from './portfolio-scoring.facade';

const REASON_MAX_LENGTH = 500;

/**
 * Returns the portfolio for a conflict of interest (US-3.3.2): a reason of up to 500
 * characters is required. Saved answers are discarded and the referee is excluded from this
 * portfolio for good; it goes back to the pool of its round.
 */
@Component({
  selector: 'dahc-conflict-of-interest-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcAlertComponent, DahcButtonComponent, DahcFormFieldComponent, DahcInputDirective, DahcModalComponent, ReactiveFormsModule],
  styles: `
    .dialog-form { display: grid; gap: var(--dahc-space-4); }
    .dialog-buttons { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: var(--dahc-space-3); }
    textarea[dahcInput] { min-block-size: calc(var(--dahc-size-control-lg) * 2); resize: vertical; }
  `,
  template: `
    <dahc-modal [(open)]="open" i18n-heading="@@portal.scoring.portfolio.coiHeading" heading="Return for conflict of interest">
      <form class="dialog-form" (ngSubmit)="submit()" novalidate>
        <dahc-alert variant="warning" i18n="@@portal.scoring.portfolio.coiWarning">
          Any scores you saved for this portfolio are discarded. The portfolio leaves your inbox and you cannot be assigned to it again.
        </dahc-alert>
        <dahc-form-field
          i18n-label="@@portal.scoring.portfolio.coiReason"
          label="Reason"
          [required]="true"
          [showCount]="true"
          [invalid]="reasonError() !== ''"
          [error]="reasonError()">
          <textarea dahcInput [formControl]="reason" [attr.maxlength]="maxLength"></textarea>
        </dahc-form-field>
        @if (error() !== '') {
          <dahc-alert variant="error" [announce]="true">{{ error() }}</dahc-alert>
        }
      </form>
      <div dahcDialogFooter class="dialog-buttons">
        <button dahc-button type="button" variant="secondary" (click)="open.set(false)" i18n="@@portal.action.cancel">Cancel</button>
        <button dahc-button type="button" variant="danger" [loading]="busy()" (click)="submit()" i18n="@@portal.scoring.portfolio.coiSubmit">Return portfolio</button>
      </div>
    </dahc-modal>
  `,
})
export class ConflictOfInterestDialogComponent {
  private readonly facade = inject(PortfolioScoringFacade);

  readonly open = model<boolean>(false);
  readonly returned = output<void>();

  protected readonly maxLength = REASON_MAX_LENGTH;
  protected readonly reason = new FormControl<string>('', { nonNullable: true, validators: [Validators.required, notBlank, Validators.maxLength(REASON_MAX_LENGTH)] });
  protected readonly busy = signal<boolean>(false);
  protected readonly error = signal<string>('');
  protected readonly attempted = signal<boolean>(false);

  constructor() {
    effect(() => {
      if (this.open()) {
        this.reason.reset('');
        this.attempted.set(false);
        this.error.set('');
      }
    });
  }

  protected reasonError(): string {
    if (!(this.reason.touched || this.attempted()) || !this.reason.errors) {
      return '';
    }

    return this.reason.errors['maxlength']
      ? $localize`:@@portal.error.maxlength:Enter no more than ${REASON_MAX_LENGTH}:length: characters.`
      : $localize`:@@portal.scoring.portfolio.coiReasonRequired:Enter the reason for the conflict of interest.`;
  }

  protected async submit(): Promise<void> {
    this.attempted.set(true);
    this.reason.markAsTouched();

    if (this.reason.invalid) {
      return;
    }

    this.busy.set(true);
    this.error.set('');

    try {
      await this.facade.declareConflict(this.reason.value.trim());
      this.open.set(false);
      this.returned.emit();
    } catch (error: unknown) {
      this.error.set(problemText(error));
    } finally {
      this.busy.set(false);
    }
  }
}

function notBlank(control: AbstractControl): { required: true } | null {
  return typeof control.value === 'string' && control.value.trim() === '' ? { required: true } : null;
}
