import { ChangeDetectionStrategy, Component, computed, effect, inject, model, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  DahcAlertComponent,
  DahcButtonComponent,
  DahcDetailItemComponent,
  DahcDetailListComponent,
  DahcFormFieldComponent,
  DahcInputDirective,
  DahcModalComponent,
  DahcRadioGroupComponent,
  DahcRadioOption,
  DahcSelectComponent,
  DahcSelectOption,
} from 'dahc-ui';
import { startWith } from 'rxjs';

import { NOTE_MAX_LENGTH, ReviewActionDone, controlError, newIdempotencyKey, problemText } from './review-support';
import { ReviewFacade } from './review.facade';

type Decision = 'ENDORSE_SCREEN_OUT' | 'REJECT_SCREEN_OUT';

/**
 * The supervisor endorses or rejects the officer's screen-out recommendation (US-2.4.3). On
 * endorsement the reason may be changed and the candidate is told at once; rejection needs a note
 * and sends the application back to the officer as Re-evaluating.
 */
@Component({
  selector: 'dahc-screen-out-decision-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcAlertComponent,
    DahcButtonComponent,
    DahcDetailItemComponent,
    DahcDetailListComponent,
    DahcFormFieldComponent,
    DahcInputDirective,
    DahcModalComponent,
    DahcRadioGroupComponent,
    DahcSelectComponent,
    ReactiveFormsModule,
  ],
  styleUrl: './review-dialogs.scss',
  template: `
    <dahc-modal [(open)]="open" i18n-heading="@@portal.admission.review.decision.heading" heading="Screen-out decision">
      <form class="review-form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <dahc-detail-list [columns]="1" i18n-heading="@@portal.admission.review.decision.recommendation" heading="Officer's recommendation" [headingLevel]="3">
          <div dahc-detail-item i18n-label="@@portal.admission.review.decision.officerReason" label="Reason">{{ officerReason() }}</div>
          <div dahc-detail-item i18n-label="@@portal.admission.review.decision.officerNote" label="Note">{{ recommendation()?.note || '–' }}</div>
        </dahc-detail-list>
        <dahc-radio-group
          formControlName="decision"
          i18n-label="@@portal.admission.review.decision.decision"
          label="Decision"
          orientation="vertical"
          [required]="true"
          [options]="decisions"
          [invalid]="decisionError() !== ''"
          [errorMessage]="decisionError()" />
        @if (decision() === 'ENDORSE_SCREEN_OUT') {
          <dahc-select
            formControlName="reason"
            i18n-label="@@portal.admission.review.decision.reason"
            label="Screen-out reason"
            i18n-description="@@portal.admission.review.decision.reasonHint"
            description="Keep the officer's reason or choose another one. The candidate is e-mailed with this reason."
            [options]="reasons()" />
        }
        <dahc-form-field
          i18n-label="@@portal.admission.review.decision.note"
          label="Note to the officer"
          [required]="decision() === 'REJECT_SCREEN_OUT'"
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
        <button dahc-button type="button" [loading]="busy()" (click)="submit()" i18n="@@portal.admission.review.decision.submit">Confirm decision</button>
      </div>
    </dahc-modal>
  `,
})
export class ScreenOutDecisionDialogComponent {
  private readonly facade = inject(ReviewFacade);

  readonly open = model<boolean>(false);
  readonly completed = output<ReviewActionDone>();

  protected readonly maxLength = NOTE_MAX_LENGTH;
  protected readonly decisions: readonly DahcRadioOption[] = [
    { value: 'ENDORSE_SCREEN_OUT', label: $localize`:@@portal.admission.review.decision.endorse:Endorse screen out` },
    { value: 'REJECT_SCREEN_OUT', label: $localize`:@@portal.admission.review.decision.reject:Reject screen out` },
  ];
  protected readonly form = new FormGroup({
    decision: new FormControl<Decision | ''>('', { nonNullable: true, validators: [Validators.required] }),
    reason: new FormControl<string>('', { nonNullable: true }),
    note: new FormControl<string>('', { nonNullable: true, validators: [Validators.maxLength(NOTE_MAX_LENGTH)] }),
  });
  protected readonly decision = toSignal(this.form.controls.decision.valueChanges.pipe(startWith(this.form.controls.decision.value)), {
    initialValue: '' as Decision | '',
  });
  protected readonly reasons = signal<readonly DahcSelectOption[]>([]);
  protected readonly recommendation = computed(() => this.facade.review()?.screenOutRecommendation ?? null);
  protected readonly officerReason = computed<string>(() => {
    const code = this.recommendation()?.reasonCode ?? '';

    return this.reasons().find(option => option.value === code)?.label ?? code;
  });
  protected readonly busy = signal<boolean>(false);
  protected readonly error = signal<string>('');
  protected readonly attempted = signal<boolean>(false);
  private key = newIdempotencyKey();

  constructor() {
    void this.loadReasons();
    effect(() => {
      if (this.open()) {
        this.form.reset({ decision: '', reason: this.recommendation()?.reasonCode ?? '', note: '' });
        this.attempted.set(false);
        this.error.set('');
        this.key = newIdempotencyKey();
      }
    });
  }

  protected decisionError(): string {
    return controlError(this.form.controls.decision, this.attempted());
  }

  protected noteError(): string {
    const control = this.form.controls.note;

    if (this.decision() === 'REJECT_SCREEN_OUT' && this.attempted() && control.value.trim() === '') {
      return $localize`:@@portal.admission.review.decision.noteRequired:Enter a note explaining why you reject the screen-out.`;
    }

    return controlError(control, this.attempted());
  }

  protected async submit(): Promise<void> {
    this.attempted.set(true);
    this.form.markAllAsTouched();
    const value = this.form.getRawValue();

    if (this.form.invalid || value.decision === '' || this.noteError() !== '') {
      return;
    }

    const note = value.note.trim();
    const endorse = value.decision === 'ENDORSE_SCREEN_OUT';
    this.busy.set(true);
    this.error.set('');

    try {
      await this.facade.decideScreenOut(
        {
          decision: value.decision,
          reasonCode: endorse && value.reason !== '' ? value.reason : null,
          note: note === '' ? null : note,
        },
        this.key,
      );
      this.open.set(false);
      this.completed.emit({
        message: endorse
          ? $localize`:@@portal.admission.review.decision.endorsed:The screen-out was endorsed and the candidate has been informed.`
          : $localize`:@@portal.admission.review.decision.rejected:The screen-out was rejected and the application went back to the officer.`,
        leave: true,
      });
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
