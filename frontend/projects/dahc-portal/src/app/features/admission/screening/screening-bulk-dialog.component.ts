import { ChangeDetectionStrategy, Component, computed, effect, inject, input, model, output, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  DahcAlertComponent,
  DahcButtonComponent,
  DahcCheckboxComponent,
  DahcDetailItemComponent,
  DahcDetailListComponent,
  DahcModalComponent,
  DahcSelectComponent,
  DahcSelectOption,
  DahcTagComponent,
  DahcToastService,
} from 'dahc-ui';
import { Observable, firstValueFrom, startWith } from 'rxjs';

import { BulkWorkflowResult } from '../../../api/admission.models';
import { ScreeningApiService } from '../../../api/screening-api.service';
import { BulkActionRequest, ScreeningApplicationRow } from '../../../api/screening.models';
import { isApiProblemError } from '../../../core/api/api-problem-error';
import { callerHandlesProblems } from '../../../core/api/api-request';
import { ApiResult } from '../../../core/api/api.models';
import { applicationStatusDisplay } from '../../../shared/application-status';
import { StatusDisplay, announcementStatusDisplay } from '../../../shared/workflow/workflow-status';

export type ScreeningBulkKind = 'announce' | 'screen-out' | 'reannounce';

interface NotReadyRow {
  readonly applicationNumber: string;
  readonly candidateName: string;
  readonly status: StatusDisplay;
}

interface BlockedRow {
  readonly applicationNumber: string;
  readonly reason: string;
}

/**
 * Bulk screening actions on the selected applications, each with a summary, a confirmation and
 * the per-application result (BulkWorkflowResult):
 * - Initial announcement (US-4.3.1): only "Ready to announce" applications are published.
 * - Bulk screen-out (US-4.4.1): one reason for all; already screened-out ones are highlighted.
 * - Reannouncement (US-4.5.1): only "Ready to reannounce" applications are published.
 * The whole selection is sent; the API decides and reports blocked applications with a code.
 */
@Component({
  selector: 'dahc-screening-bulk-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcAlertComponent,
    DahcButtonComponent,
    DahcCheckboxComponent,
    DahcDetailItemComponent,
    DahcDetailListComponent,
    DahcModalComponent,
    DahcSelectComponent,
    DahcTagComponent,
    ReactiveFormsModule,
  ],
  styleUrl: './screening.scss',
  templateUrl: './screening-bulk-dialog.component.html',
})
export class ScreeningBulkDialogComponent {
  private readonly api = inject(ScreeningApiService);
  private readonly toasts = inject(DahcToastService);

  readonly kind = input.required<ScreeningBulkKind>();
  readonly rows = input.required<readonly ScreeningApplicationRow[]>();
  readonly reasonOptions = input<readonly DahcSelectOption[]>([]);
  readonly open = model<boolean>(false);
  /** Emitted after the API processed the request, so the page reloads. */
  readonly completed = output<void>();

  protected readonly busy = signal<boolean>(false);
  protected readonly error = signal<string>('');
  protected readonly attempted = signal<boolean>(false);
  protected readonly result = signal<BulkWorkflowResult | null>(null);

  protected readonly confirmed = new FormControl<boolean>(false, { nonNullable: true });
  protected readonly reasonCode = new FormControl<string>('', { nonNullable: true, validators: [Validators.required] });

  private readonly confirmedValue = toSignal(this.confirmed.valueChanges.pipe(startWith(this.confirmed.value)), { initialValue: false });
  /** One key per opening of the panel, reused if the same request is retried (contract idempotency). */
  private idempotencyKey = crypto.randomUUID();
  /** The rows as they were when the panel opened; the result refers to them after the list reloads. */
  private readonly snapshot = signal<readonly ScreeningApplicationRow[]>([]);

  protected readonly heading = computed<string>(() => {
    switch (this.kind()) {
      case 'announce':
        return $localize`:@@portal.admission.screening.announce.heading:Announce initial scores`;
      case 'screen-out':
        return $localize`:@@portal.admission.screening.screenOut.heading:Screen out applications`;
      case 'reannounce':
        return $localize`:@@portal.admission.screening.reannounce.heading:Reannounce scores after appeal`;
    }
  });

  protected readonly announcementType = computed<string>(() =>
    this.kind() === 'reannounce'
      ? $localize`:@@portal.admission.screening.type.reannouncement:Reannouncement`
      : $localize`:@@portal.admission.screening.type.initial:Initial announcement`,
  );

  protected readonly selected = computed<readonly ScreeningApplicationRow[]>(() => this.snapshot());

  protected readonly ready = computed<readonly ScreeningApplicationRow[]>(() => this.selected().filter(row => this.isReady(row)));

  protected readonly notReady = computed<readonly NotReadyRow[]>(() =>
    this.selected()
      .filter(row => !this.isReady(row))
      .map(row => ({
        applicationNumber: row.applicationNumber,
        candidateName: row.candidateName,
        status: this.kind() === 'screen-out' ? applicationStatusDisplay(row.applicationStatus) : announcementStatusDisplay(row.announcementStatus),
      })),
  );

  protected readonly blocked = computed<readonly BlockedRow[]>(() => {
    const result = this.result();
    const numbers = new Map(this.selected().map(row => [row.applicationId, row.applicationNumber]));

    return (result?.results ?? [])
      .filter(item => item.outcome === 'BLOCKED')
      .map(item => ({ applicationNumber: numbers.get(item.resourceId) ?? item.resourceId, reason: blockedReason(item.code) }));
  });

  protected readonly reasonError = computed<string>(() =>
    this.attempted() && this.kind() === 'screen-out' && this.reasonCode.invalid
      ? $localize`:@@portal.admission.screening.screenOut.reasonRequired:Choose the screen-out reason.`
      : '',
  );

  protected readonly confirmError = computed<string>(() =>
    this.attempted() && !this.confirmedValue() ? $localize`:@@portal.admission.screening.confirmRequired:Confirm before you continue.` : '',
  );

  constructor() {
    // Every opening starts a new intent: fresh key, empty form, the current selection.
    effect(() => {
      if (this.open()) {
        untracked(() => this.reset());
      }
    });
  }

  protected async submit(): Promise<void> {
    this.attempted.set(true);
    this.reasonCode.markAsTouched();

    if (!this.confirmed.value || (this.kind() === 'screen-out' && this.reasonCode.invalid) || this.busy()) {
      return;
    }

    this.busy.set(true);
    this.error.set('');

    const request: BulkActionRequest = {
      applicationIds: this.selected().map(row => row.applicationId),
      reasonCode: this.kind() === 'screen-out' ? this.reasonCode.value : this.kind() === 'announce' ? 'INITIAL_ANNOUNCEMENT' : 'REANNOUNCEMENT',
      confirmed: true,
    };

    try {
      const response = await firstValueFrom(this.send(request));
      this.result.set(response.data);
      this.completed.emit();

      if (response.data.processedCount > 0) {
        this.toasts.show({ variant: 'success', heading: this.successHeading(response.data.processedCount) });
      }
    } catch (error: unknown) {
      this.error.set(
        isApiProblemError(error)
          ? (error.problem.detail ?? error.problem.title)
          : $localize`:@@portal.problem.unexpected:Something went wrong. Please try again later.`,
      );
    } finally {
      this.busy.set(false);
    }
  }

  protected isReady(row: ScreeningApplicationRow): boolean {
    switch (this.kind()) {
      case 'announce':
        return row.announcementStatus === 'READY_FOR_INITIAL_ANNOUNCEMENT';
      case 'reannounce':
        return row.announcementStatus === 'READY_FOR_REANNOUNCEMENT';
      case 'screen-out':
        return row.applicationStatus !== 'SCREENED_OUT';
    }
  }

  private send(request: BulkActionRequest): Observable<ApiResult<BulkWorkflowResult>> {
    const context = callerHandlesProblems();

    switch (this.kind()) {
      case 'announce':
        return this.api.announce(request, this.idempotencyKey, context);
      case 'screen-out':
        return this.api.bulkScreenOut(request, this.idempotencyKey, context);
      case 'reannounce':
        return this.api.reannounce(request, this.idempotencyKey, context);
    }
  }

  private successHeading(count: number): string {
    switch (this.kind()) {
      case 'announce':
        return $localize`:@@portal.admission.screening.announce.done:Scores announced for ${count}:count: applications`;
      case 'screen-out':
        return $localize`:@@portal.admission.screening.screenOut.done:${count}:count: applications screened out`;
      case 'reannounce':
        return $localize`:@@portal.admission.screening.reannounce.done:Scores reannounced for ${count}:count: applications`;
    }
  }

  private reset(): void {
    this.idempotencyKey = crypto.randomUUID();
    this.snapshot.set(this.rows());
    this.result.set(null);
    this.error.set('');
    this.attempted.set(false);
    this.busy.set(false);
    this.confirmed.reset(false);
    this.reasonCode.reset('');
  }
}

function blockedReason(code: string | undefined): string {
  switch (code) {
    case 'announcement.not_ready':
      return $localize`:@@portal.admission.screening.blocked.notReady:Not ready to announce: verification and portfolio scoring must both be complete.`;
    case 'reannouncement.not_ready':
      return $localize`:@@portal.admission.screening.blocked.notReadyReannouncement:Not ready to reannounce: the appeal is not complete.`;
    case 'screen_out.already_screened_out':
      return $localize`:@@portal.admission.screening.blocked.alreadyScreenedOut:Already screened out.`;
    default:
      return $localize`:@@portal.admission.screening.blocked.other:Not processed (${code ?? ''}:code:).`;
  }
}
