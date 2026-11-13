import { ChangeDetectionStrategy, Component, computed, effect, inject, input, model, output, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  DahcAlertComponent,
  DahcButtonComponent,
  DahcFormFieldComponent,
  DahcInputDirective,
  DahcModalComponent,
  DahcRadioGroupComponent,
  DahcRadioOption,
  DahcSelectComponent,
  DahcSelectOption,
  DahcToastService,
} from 'dahc-ui';
import { firstValueFrom } from 'rxjs';

import { AdmissionApiService } from '../../../api/admission-api.service';
import { BulkWorkflowResult, StaffUserSummary } from '../../../api/admission.models';
import { isApiProblemError } from '../../../core/api/api-problem-error';
import { callerHandlesProblems } from '../../../core/api/api-request';

const JUSTIFICATION_MAX = 200;

/** One application selected for reassignment, with what the dialog needs to show and check. */
export interface ReassignSelection {
  readonly applicationId: string;
  readonly applicationNumber: string;
  readonly poolId: string;
}

type ReassignAction = 'REASSIGN' | 'RETURN_TO_POOL';

/**
 * Reassign / Return pop-up (US-2.2.3). Reassign moves the selected applications to another
 * officer of the same pool; Return to pool puts them back for retrieval (the contract allows both;
 * PQ-17). A justification is required. One idempotency key per opening of the dialog, reused if
 * the request is retried. Each application is checked on the server; blocked ones are listed.
 */
@Component({
  selector: 'dahc-reassign-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcAlertComponent,
    DahcButtonComponent,
    DahcFormFieldComponent,
    DahcInputDirective,
    DahcModalComponent,
    DahcRadioGroupComponent,
    DahcSelectComponent,
    ReactiveFormsModule,
  ],
  styleUrl: '../officer-dashboard/admission-pages.scss',
  template: `
    <dahc-modal [(open)]="open" i18n-heading="@@portal.admission.workload.dialogHeading" heading="Reassign or return applications">
      @if (result(); as result) {
        <div class="dialog-form">
          <dahc-alert [variant]="result.blockedCount === 0 ? 'success' : 'warning'" [announce]="true">
            <span i18n="@@portal.admission.workload.resultSummary">{{ result.processedCount }} of {{ result.selectedCount }} applications were updated.</span>
          </dahc-alert>
          @if (blocked().length > 0) {
            <p class="dialog-text" i18n="@@portal.admission.workload.blockedIntro">These applications could not be changed:</p>
            <ul class="result-list">
              @for (item of blocked(); track item.applicationNumber) {
                <li>{{ item.applicationNumber }}: {{ item.reason }}</li>
              }
            </ul>
          }
        </div>
      } @else {
        <form class="dialog-form" (submit)="$event.preventDefault(); submit()" novalidate>
          <p class="dialog-text" i18n="@@portal.admission.workload.dialogText">
            {selected().length, plural, =1 {1 application selected} other {{{ selected().length }} applications selected}}.
          </p>
          @if (spansPools()) {
            <dahc-alert variant="warning" i18n="@@portal.admission.workload.spansPools">
              The selected applications belong to different pools. Select applications from one pool to reassign them to another officer.
            </dahc-alert>
          }
          <dahc-radio-group
            [formControl]="action"
            i18n-label="@@portal.admission.workload.action"
            label="Action"
            [required]="true"
            [options]="actionOptions" />
          @if (action.value === 'REASSIGN') {
            <dahc-select
              [formControl]="target"
              i18n-label="@@portal.admission.workload.target"
              label="Officer to reassign to"
              [required]="true"
              [options]="officerOptions()"
              [invalid]="targetError() !== ''"
              [errorMessage]="targetError()"
              i18n-description="@@portal.admission.workload.targetHint"
              description="Only officers of the same pool are listed." />
          }
          <dahc-form-field
            i18n-label="@@portal.admission.workload.justification"
            label="Justification"
            [required]="true"
            [showCount]="true"
            i18n-hint="@@portal.admission.workload.justificationHint"
            hint="Up to 200 characters."
            [invalid]="justificationError() !== ''"
            [error]="justificationError()">
            <textarea dahcInput [formControl]="justification" [attr.maxlength]="justificationMax"></textarea>
          </dahc-form-field>
          @if (error() !== '') {
            <dahc-alert variant="error" [announce]="true">{{ error() }}</dahc-alert>
          }
        </form>
      }
      <div dahcDialogFooter class="dialog-buttons">
        @if (result()) {
          <button dahc-button type="button" (click)="open.set(false)" i18n="@@portal.admission.workload.done">Done</button>
        } @else {
          <button dahc-button type="button" variant="secondary" (click)="open.set(false)" i18n="@@portal.action.cancel">Cancel</button>
          <button dahc-button type="button" [loading]="busy()" [disabled]="action.value === 'REASSIGN' && spansPools()" (click)="submit()" i18n="@@portal.admission.workload.confirm">
            Confirm
          </button>
        }
      </div>
    </dahc-modal>
  `,
})
export class ReassignDialogComponent {
  private readonly api = inject(AdmissionApiService);
  private readonly toasts = inject(DahcToastService);

  readonly selection = input.required<readonly ReassignSelection[]>();
  /** The officer whose applications are selected; never offered as the target. */
  readonly currentOfficerId = input<string>('');
  readonly open = model<boolean>(false);
  readonly completed = output<void>();

  protected readonly justificationMax = JUSTIFICATION_MAX;
  protected readonly actionOptions: readonly DahcRadioOption[] = [
    { value: 'REASSIGN', label: $localize`:@@portal.admission.workload.reassign:Reassign to another officer` },
    { value: 'RETURN_TO_POOL', label: $localize`:@@portal.admission.workload.returnToPool:Return to pool` },
  ];
  protected readonly action = new FormControl<string>('REASSIGN', { nonNullable: true });
  protected readonly target = new FormControl<string>('', { nonNullable: true });
  protected readonly justification = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(JUSTIFICATION_MAX)],
  });
  protected readonly officers = signal<readonly StaffUserSummary[]>([]);
  protected readonly busy = signal<boolean>(false);
  protected readonly error = signal<string>('');
  protected readonly attempted = signal<boolean>(false);
  protected readonly result = signal<BulkWorkflowResult | null>(null);
  /** The selection when the dialog opened; the page clears its selection after a change. */
  protected readonly selected = signal<readonly ReassignSelection[]>([]);

  private readonly actionValue = toSignal(this.action.valueChanges, { initialValue: this.action.value });
  private readonly targetValue = toSignal(this.target.valueChanges, { initialValue: this.target.value });
  private readonly justificationValue = toSignal(this.justification.valueChanges, { initialValue: this.justification.value });
  private idempotencyKey = crypto.randomUUID();

  protected readonly spansPools = computed<boolean>(() => new Set(this.selected().map(item => item.poolId)).size > 1);

  protected readonly officerOptions = computed<readonly DahcSelectOption[]>(() =>
    this.officers()
      .filter(officer => officer.userId !== this.currentOfficerId())
      .map(officer => ({
        value: officer.userId,
        label:
          officer.activeAssignments === undefined
            ? officer.displayName
            : $localize`:@@portal.admission.workload.officerOption:${officer.displayName}:name: (${officer.activeAssignments}:count: in progress)`,
      })),
  );

  protected readonly targetError = computed<string>(() => {
    this.targetValue();

    return this.attempted() && this.actionValue() === 'REASSIGN' && this.target.value === ''
      ? $localize`:@@portal.admission.workload.targetRequired:Choose the officer to reassign to.`
      : '';
  });

  protected readonly justificationError = computed<string>(() => {
    this.justificationValue();

    if (!this.attempted()) {
      return '';
    }

    return this.justification.value.trim() === '' ? $localize`:@@portal.error.required:This field is required.` : '';
  });

  protected readonly blocked = computed<readonly { readonly applicationNumber: string; readonly reason: string }[]>(() =>
    (this.result()?.results ?? [])
      .filter(item => item.outcome === 'BLOCKED')
      .map(item => ({
        applicationNumber: this.selected().find(entry => entry.applicationId === item.resourceId)?.applicationNumber ?? item.resourceId,
        reason: blockedReason(item.code),
      })),
  );

  constructor() {
    effect(() => {
      if (this.open()) {
        untracked(() => this.reset());
      }
    });
  }

  protected async submit(): Promise<void> {
    this.attempted.set(true);
    const action = this.action.value as ReassignAction;

    if (this.justification.value.trim() === '' || (action === 'REASSIGN' && (this.target.value === '' || this.spansPools()))) {
      return;
    }

    this.busy.set(true);
    this.error.set('');

    try {
      const result = await firstValueFrom(
        this.api.reassignApplications(
          {
            action,
            applicationIds: this.selected().map(item => item.applicationId),
            targetOfficerId: action === 'REASSIGN' ? this.target.value : null,
            justification: this.justification.value.trim(),
            confirmed: true,
          },
          this.idempotencyKey,
          callerHandlesProblems(),
        ),
      );
      this.result.set(result.data);

      if (result.data.processedCount > 0) {
        this.toasts.show({
          variant: 'success',
          heading:
            action === 'REASSIGN'
              ? $localize`:@@portal.admission.workload.reassigned:${result.data.processedCount}:count: applications reassigned`
              : $localize`:@@portal.admission.workload.returned:${result.data.processedCount}:count: applications returned to the pool`,
        });
      }

      this.completed.emit();
    } catch (error: unknown) {
      this.error.set(
        isApiProblemError(error) ? (error.problem.detail ?? error.problem.title) : $localize`:@@portal.problem.unexpected:Something went wrong. Please try again later.`,
      );
    } finally {
      this.busy.set(false);
    }
  }

  private reset(): void {
    this.selected.set(this.selection());
    this.idempotencyKey = crypto.randomUUID();
    this.action.setValue('REASSIGN');
    this.target.setValue('');
    this.justification.reset('');
    this.attempted.set(false);
    this.error.set('');
    this.result.set(null);
    this.officers.set([]);
    const pools = [...new Set(this.selected().map(item => item.poolId))];

    if (pools.length === 1 && pools[0]) {
      void firstValueFrom(this.api.listPoolOfficers(pools[0])).then(
        result => this.officers.set(result.data),
        () => this.officers.set([]),
      );
    }
  }
}

function blockedReason(code: string | undefined): string {
  switch (code) {
    case 'assignment.not_eligible':
      return $localize`:@@portal.admission.workload.notEligible:only applications in progress or resubmitted can be reassigned`;
    case 'assignment.target_not_in_pool':
      return $localize`:@@portal.admission.workload.notInPool:the officer is not assigned to this application's pool`;
    default:
      return code ?? $localize`:@@portal.admission.workload.blocked:not changed`;
  }
}
