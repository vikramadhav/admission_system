import { ChangeDetectionStrategy, Component, LOCALE_ID, computed, effect, inject, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  DahcAlertComponent,
  DahcButtonComponent,
  DahcEmptyStateComponent,
  DahcNavLink,
  DahcPageHeaderComponent,
  DahcSelectComponent,
  DahcSelectOption,
  DahcTableCellDirective,
  DahcTableColumn,
  DahcTableComponent,
  DahcTableRow,
  DahcTagComponent,
  DahcTagPurpose,
} from 'dahc-ui';
import { map } from 'rxjs';

import { AdmissionApiService } from '../../../api/admission-api.service';
import { ReinstatementRequestStatus, ReinstatementRequestSummary } from '../../../api/admission.models';
import { SessionService } from '../../../core/auth/session.service';
import { formatDahcDateTime } from '../../../core/locale/date-time.pipe';
import { CursorList } from '../../../shared/cursor-list/cursor-list';
import { LoadMoreComponent } from '../../../shared/cursor-list/load-more.component';
import { reinstatementStatusDisplay } from './reinstatement-labels';

interface RequestRow extends DahcTableRow {
  readonly id: string;
  readonly applicationNumber: string;
  readonly candidateName: string;
  readonly programName: string;
  readonly requestedAt: string;
  readonly status: string;
  readonly statusPurpose: DahcTagPurpose;
}

const ALL = 'ALL';

/**
 * Reinstatement queue for the supervisor (US-2.5.1): requests ordered by request date, oldest
 * first, pending ones by default; decided and earlier requests stay viewable.
 */
@Component({
  selector: 'dahc-reinstatement-queue-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcAlertComponent,
    DahcButtonComponent,
    DahcEmptyStateComponent,
    DahcPageHeaderComponent,
    DahcSelectComponent,
    DahcTableCellDirective,
    DahcTableComponent,
    DahcTagComponent,
    LoadMoreComponent,
    ReactiveFormsModule,
    RouterLink,
  ],
  styleUrl: '../officer-dashboard/admission-pages.scss',
  template: `
    <dahc-page-header
      i18n-heading="@@portal.admission.reinstatement.queueHeading"
      heading="Reinstatement requests"
      i18n-description="@@portal.admission.reinstatement.queueDescription"
      description="Candidates who withdrew and asked to continue. Approving restores the application exactly as it was before the withdrawal."
      [breadcrumbs]="breadcrumbs"
      [focusOnLoad]="true" />
    <div class="dahc-portal-page">
      <div class="toolbar">
        <dahc-select
          [formControl]="statusFilter"
          i18n-label="@@portal.admission.reinstatement.statusFilter"
          label="Status"
          [options]="statusOptions" />
      </div>
      @if (list.problem(); as problem) {
        <dahc-alert variant="error" [announce]="true">
          {{ problem.detail ?? problem.title }}
          <button dahc-button type="button" variant="link" (click)="list.reload()" i18n="@@portal.action.tryAgain">Try again</button>
        </dahc-alert>
      }
      @if (list.loaded() && rows().length === 0 && !list.loading()) {
        <dahc-empty-state
          [headingLevel]="2"
          i18n-heading="@@portal.admission.reinstatement.emptyHeading"
          heading="No reinstatement requests"
          i18n-description="@@portal.admission.reinstatement.emptyText"
          description="There are no requests with this status." />
      } @else {
        <dahc-table
          i18n-caption="@@portal.admission.reinstatement.caption"
          caption="Reinstatement requests, oldest first"
          [columns]="columns"
          [rows]="rows()"
          [loading]="list.loading()"
          scrollX="720px">
          <ng-template dahcTableCell="applicationNumber" let-row>
            <a [routerLink]="['/admission/supervisor/reinstatements', asRow(row).id]">{{ asRow(row).applicationNumber }}</a>
          </ng-template>
          <ng-template dahcTableCell="status" let-row>
            <dahc-tag [purpose]="asRow(row).statusPurpose">{{ asRow(row).status }}</dahc-tag>
          </ng-template>
        </dahc-table>
        <dahc-load-more [shown]="rows().length" [hasMore]="list.hasMore()" [loading]="list.loading()" (loadMore)="list.loadMore()" />
      }
    </div>
  `,
})
export class ReinstatementQueuePageComponent {
  private readonly api = inject(AdmissionApiService);
  private readonly sessions = inject(SessionService);
  private readonly locale = inject(LOCALE_ID);

  protected readonly breadcrumbs: readonly DahcNavLink[] = [
    { label: $localize`:@@portal.nav.supervisorDashboard:Supervision`, route: '/admission/supervisor' },
    { label: $localize`:@@portal.admission.reinstatement.queueHeading:Reinstatement requests` },
  ];
  protected readonly statusOptions: readonly DahcSelectOption[] = [
    { value: 'SUBMITTED', label: reinstatementStatusDisplay('SUBMITTED').label },
    { value: 'APPROVED', label: reinstatementStatusDisplay('APPROVED').label },
    { value: 'REJECTED', label: reinstatementStatusDisplay('REJECTED').label },
    { value: ALL, label: $localize`:@@portal.admission.reinstatement.all:All requests` },
  ];
  protected readonly columns: readonly DahcTableColumn[] = [
    { key: 'applicationNumber', title: $localize`:@@portal.admission.reinstatement.colApplication:Application ID` },
    { key: 'candidateName', title: $localize`:@@portal.admission.reinstatement.colCandidate:Candidate name` },
    { key: 'programName', title: $localize`:@@portal.admission.reinstatement.colProgram:Program` },
    { key: 'requestedAt', title: $localize`:@@portal.admission.reinstatement.colRequested:Requested` },
    { key: 'status', title: $localize`:@@portal.admission.reinstatement.colStatus:Status` },
  ];
  protected readonly statusFilter = new FormControl<string>('SUBMITTED', { nonNullable: true });

  private readonly status = toSignal(this.statusFilter.valueChanges, { initialValue: this.statusFilter.value });

  protected readonly list = new CursorList<ReinstatementRequestSummary>(cursor => {
    const status = this.status();

    return this.api
      .listReinstatementRequests({ cursor, sort: 'requestedAt', status: status === ALL ? null : (status as ReinstatementRequestStatus) })
      .pipe(map(result => ({ items: result.data, nextCursor: result.pagination?.nextCursor ?? null })));
  });

  protected readonly rows = computed<readonly RequestRow[]>(() =>
    this.list.items().map(item => {
      const status = reinstatementStatusDisplay(item.status);

      return {
        id: item.requestId,
        applicationNumber: item.applicationNumber,
        candidateName: item.candidateName,
        programName: item.programName,
        requestedAt: formatDahcDateTime(item.requestedAt, this.locale, this.sessions.timeZoneId(), 'dateTime'),
        status: status.label,
        statusPurpose: status.purpose,
      };
    }),
  );

  constructor() {
    effect(() => {
      this.status();
      untracked(() => this.list.reload());
    });
  }

  protected asRow(row: DahcTableRow): RequestRow {
    return row as RequestRow;
  }
}
