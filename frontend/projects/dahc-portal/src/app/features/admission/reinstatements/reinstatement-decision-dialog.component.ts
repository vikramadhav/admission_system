import { ChangeDetectionStrategy, Component, computed, effect, inject, input, model, output, signal, untracked } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  DahcAlertComponent,
  DahcButtonComponent,
  DahcFormFieldComponent,
  DahcInputDirective,
  DahcModalComponent,
  DahcSelectComponent,
  DahcSelectOption,
  DahcToastService,
} from 'dahc-ui';
import { firstValueFrom, map } from 'rxjs';

import { AdmissionApiService } from '../../../api/admission-api.service';
import { isApiProblemError } from '../../../core/api/api-problem-error';
import { callerHandlesProblems } from '../../../core/api/api-request';

const NOTE_MAX = 500;

export type ReinstatementDecisionKind = 'APPROVE' | 'REJECT';

/**
 * Approve or reject a reinstatement request (US-2.5.2). Both need a note (contract: 1 to 500
 * characters); rejection also needs a reason from lookup REINSTATEMENT_REJECTION_REASON (PQ-19).
 * One idempotency key per opening of the dialog.
 */
@Component({
  selector: 'dahc-reinstatement-decision-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcAlertComponent, DahcButtonComponent, DahcFormFieldComponent, DahcInputDirective, DahcModalComponent, DahcSelectComponent, ReactiveFormsModule],
  styleUrl: '../officer-dashboard/admission-pages.scss',
  template: `
    <dahc-modal [(open)]="open" [heading]="heading()">
      <form class="dialog-form" (submit)="$event.preventDefault(); submit()" novalidate>
        <p class="dialog-text">{{ text() }}</p>
        @if (decision() === 'REJECT') {
          <dahc-select
            [formControl]="reason"
            i18n-label="@@portal.admission.reinstatement.rejectReason"
            label="Reason for rejection"
            [required]="true"
            [options]="reasonOptions()"
            [invalid]="reasonError() !== ''"
            [errorMessage]="reasonError()" />
        }
        <dahc-form-field
          i18n-label="@@portal.admission.reinstatement.note"
          label="Note"
          [required]="true"
          [showCount]="true"
          i18n-hint="@@portal.admission.reinstatement.noteHint"
          hint="Up to 500 characters. The candidate is told the decision by e-mail."
          [invalid]="noteError() !== ''"
          [error]="noteError()">
          <textarea dahcInput [formControl]="note" [attr.maxlength]="noteMax"></textarea>
        </dahc-form-field>
        @if (error() !== '') {
          <dahc-alert variant="error" [announce]="true">{{ error() }}</dahc-alert>
        }
      </form>
      <div dahcDialogFooter class="dialog-buttons">
        <button dahc-button type="button" variant="secondary" (click)="open.set(false)" i18n="@@portal.action.cancel">Cancel</button>
        <button dahc-button type="button" [variant]="decision() === 'REJECT' ? 'danger' : 'primary'" [loading]="busy()" (click)="submit()">{{ confirmLabel() }}</button>
      </div>
    </dahc-modal>
  `,
})
export class ReinstatementDecisionDialogComponent {
  private readonly api = inject(AdmissionApiService);
  private readonly toasts = inject(DahcToastService);

  readonly requestId = input.required<string>();
  readonly applicationNumber = input<string>('');
  readonly decision = input<ReinstatementDecisionKind>('APPROVE');
  readonly open = model<boolean>(false);
  readonly completed = output<void>();

  protected readonly noteMax = NOTE_MAX;
  protected readonly note = new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(NOTE_MAX)] });
  protected readonly reason = new FormControl<string>('', { nonNullable: true });
  protected readonly busy = signal<boolean>(false);
  protected readonly error = signal<string>('');
  protected readonly attempted = signal<boolean>(false);

  private readonly noteValue = toSignal(this.note.valueChanges, { initialValue: '' });
  private readonly reasonValue = toSignal(this.reason.valueChanges, { initialValue: '' });
  private idempotencyKey = crypto.randomUUID();

  private readonly reasons = rxResource({
    params: () => (this.open() && this.decision() === 'REJECT' ? true : undefined),
    stream: () => this.api.listLookup('REINSTATEMENT_REJECTION_REASON').pipe(map(result => result.data)),
  });

  protected readonly reasonOptions = computed<readonly DahcSelectOption[]>(() =>
    (this.reasons.hasValue() ? this.reasons.value() : []).filter(item => item.active).map(item => ({ value: item.code, label: item.label })),
  );
  protected readonly heading = computed<string>(() =>
    this.decision() === 'APPROVE'
      ? $localize`:@@portal.admission.reinstatement.approveHeading:Approve reinstatement`
      : $localize`:@@portal.admission.reinstatement.rejectHeading:Reject reinstatement`,
  );
  protected readonly text = computed<string>(() =>
    this.decision() === 'APPROVE'
      ? $localize`:@@portal.admission.reinstatement.approveText:Application ${this.applicationNumber()}:number: goes back to the status it had before the withdrawal and to the same pool.`
      : $localize`:@@portal.admission.reinstatement.rejectText:Application ${this.applicationNumber()}:number: stays withdrawn.`,
  );
  protected readonly confirmLabel = computed<string>(() =>
    this.decision() === 'APPROVE'
      ? $localize`:@@portal.admission.reinstatement.approve:Approve`
      : $localize`:@@portal.admission.reinstatement.reject:Reject`,
  );
  protected readonly noteError = computed<string>(() => {
    this.noteValue();

    return this.attempted() && this.note.value.trim() === '' ? $localize`:@@portal.error.required:This field is required.` : '';
  });
  protected readonly reasonError = computed<string>(() => {
    this.reasonValue();

    return this.attempted() && this.decision() === 'REJECT' && this.reason.value === ''
      ? $localize`:@@portal.admission.reinstatement.reasonRequired:Choose a reason.`
      : '';
  });

  constructor() {
    effect(() => {
      if (this.open()) {
        untracked(() => {
          this.idempotencyKey = crypto.randomUUID();
          this.note.reset('');
          this.reason.reset('');
          this.attempted.set(false);
          this.error.set('');
        });
      }
    });
  }

  protected async submit(): Promise<void> {
    this.attempted.set(true);
    const decision = this.decision();

    if (this.note.value.trim() === '' || (decision === 'REJECT' && this.reason.value === '')) {
      return;
    }

    this.busy.set(true);
    this.error.set('');

    try {
      await firstValueFrom(
        this.api.decideReinstatement(
          this.requestId(),
          { decision, reasonCode: decision === 'REJECT' ? this.reason.value : null, note: this.note.value.trim() },
          this.idempotencyKey,
          callerHandlesProblems(),
        ),
      );
      this.toasts.show({
        variant: 'success',
        heading:
          decision === 'APPROVE'
            ? $localize`:@@portal.admission.reinstatement.approved:Reinstatement approved`
            : $localize`:@@portal.admission.reinstatement.rejected:Reinstatement rejected`,
      });
      this.open.set(false);
      this.completed.emit();
    } catch (error: unknown) {
      this.error.set(
        isApiProblemError(error) ? (error.problem.detail ?? error.problem.title) : $localize`:@@portal.problem.unexpected:Something went wrong. Please try again later.`,
      );
    } finally {
      this.busy.set(false);
    }
  }
}
