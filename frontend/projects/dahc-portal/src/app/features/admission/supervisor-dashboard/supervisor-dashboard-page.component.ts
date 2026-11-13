import { ChangeDetectionStrategy, Component, LOCALE_ID, computed, effect, inject, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  DahcAlertComponent,
  DahcButtonComponent,
  DahcEmptyStateComponent,
  DahcPageHeaderComponent,
  DahcSearchComponent,
  DahcSelectComponent,
  DahcSelectOption,
  DahcStatTileComponent,
  DahcTableCellDirective,
  DahcTableColumn,
  DahcTableComponent,
  DahcTableRow,
  DahcTableSort,
  DahcTagComponent,
  DahcTagPurpose,
} from 'dahc-ui';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';

import { AdmissionApiService, SupervisorInboxSort } from '../../../api/admission-api.service';
import { RefereeRole, SupervisorDashboard, SupervisorInboxItem, SupervisorQueue } from '../../../api/admission.models';
import { SessionService } from '../../../core/auth/session.service';
import { formatDahcDateTime } from '../../../core/locale/date-time.pipe';
import { CursorList } from '../../../shared/cursor-list/cursor-list';
import { LoadMoreComponent } from '../../../shared/cursor-list/load-more.component';
import { InsightTile, poolTiles } from '../officer-dashboard/verification-inbox';

interface SupervisorInboxRow extends DahcTableRow {
  readonly id: string;
  readonly link: readonly string[];
  readonly applicationNumber: string;
  readonly candidateName: string;
  readonly programName: string;
  readonly queue: string;
  readonly queuePurpose: DahcTagPurpose;
  readonly officerName: string;
  readonly requestedAt: string;
}

interface OfficerRow extends DahcTableRow {
  readonly id: string;
  readonly officerName: string;
  readonly inProgress: number;
  readonly pendingWithSupervisor: number;
  readonly resubmitted: number;
  readonly completed: number;
  readonly autoReturned: number;
  readonly overdue: number;
}

interface RefereeRow extends DahcTableRow {
  readonly id: string;
  readonly refereeName: string;
  readonly role: string;
  readonly inProgress: number;
  readonly completed: number;
  readonly autoReturned: number;
  readonly coiReturned: number;
}

const SORT_KEYS: Readonly<Record<string, SupervisorInboxSort>> = {
  applicationNumber: 'applicationId',
  candidateName: 'candidateName',
  queue: 'queue',
  requestedAt: 'requestedAt',
};

/**
 * Admission supervisor dashboard (US-2.1.3): insights across all pools, the supervisor's queue
 * insights, the inbox of escalation, screen-out and reinstatement requests (filter, search,
 * "Load more"), the officers' workload with a link to each officer's queue (US-2.2.2 level 1)
 * and the referees' workload (fields of US-3.1.3, read-only here).
 */
@Component({
  selector: 'dahc-supervisor-dashboard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcAlertComponent,
    DahcButtonComponent,
    DahcEmptyStateComponent,
    DahcPageHeaderComponent,
    DahcSearchComponent,
    DahcSelectComponent,
    DahcStatTileComponent,
    DahcTableCellDirective,
    DahcTableComponent,
    DahcTagComponent,
    LoadMoreComponent,
    ReactiveFormsModule,
    RouterLink,
  ],
  styleUrl: '../officer-dashboard/admission-pages.scss',
  templateUrl: './supervisor-dashboard-page.component.html',
})
export class SupervisorDashboardPageComponent {
  private readonly api = inject(AdmissionApiService);
  private readonly sessions = inject(SessionService);
  private readonly locale = inject(LOCALE_ID);

  protected readonly search = new FormControl<string>('', { nonNullable: true });
  protected readonly queueFilter = new FormControl<string>('', { nonNullable: true });
  protected readonly sort = signal<DahcTableSort | null>(null);
  protected readonly dashboard = signal<SupervisorDashboard | null>(null);

  protected readonly queueOptions: readonly DahcSelectOption[] = [
    { value: 'ESCALATION', label: queueLabel('ESCALATION') },
    { value: 'SCREEN_OUT', label: queueLabel('SCREEN_OUT') },
    { value: 'REINSTATEMENT', label: queueLabel('REINSTATEMENT') },
  ];

  protected readonly inboxColumns: readonly DahcTableColumn[] = [
    { key: 'applicationNumber', title: $localize`:@@portal.admission.supervisor.colApplication:Application ID`, sortable: true },
    { key: 'candidateName', title: $localize`:@@portal.admission.supervisor.colCandidate:Candidate name`, sortable: true },
    { key: 'programName', title: $localize`:@@portal.admission.supervisor.colProgram:Program` },
    { key: 'queue', title: $localize`:@@portal.admission.supervisor.colQueue:Request`, sortable: true },
    { key: 'officerName', title: $localize`:@@portal.admission.supervisor.colOfficer:Officer` },
    { key: 'requestedAt', title: $localize`:@@portal.admission.supervisor.colRequested:Requested`, sortable: true },
  ];

  protected readonly officerColumns: readonly DahcTableColumn[] = [
    { key: 'officerName', title: $localize`:@@portal.admission.supervisor.colOfficerName:Officer` },
    { key: 'inProgress', title: $localize`:@@portal.admission.supervisor.colInProgress:In progress`, align: 'end' },
    { key: 'pendingWithSupervisor', title: $localize`:@@portal.admission.supervisor.colWithSupervisor:With supervisor`, align: 'end' },
    { key: 'resubmitted', title: $localize`:@@portal.admission.supervisor.colResubmitted:Resubmitted`, align: 'end' },
    { key: 'completed', title: $localize`:@@portal.admission.supervisor.colCompleted:Completed`, align: 'end' },
    { key: 'autoReturned', title: $localize`:@@portal.admission.supervisor.colAutoReturned:Auto returned`, align: 'end' },
    { key: 'overdue', title: $localize`:@@portal.admission.supervisor.colOverdue:Overdue`, align: 'end' },
  ];

  protected readonly refereeColumns: readonly DahcTableColumn[] = [
    { key: 'refereeName', title: $localize`:@@portal.admission.supervisor.colReferee:Referee` },
    { key: 'role', title: $localize`:@@portal.admission.supervisor.colRole:Role` },
    { key: 'inProgress', title: $localize`:@@portal.admission.supervisor.colInProgress:In progress`, align: 'end' },
    { key: 'completed', title: $localize`:@@portal.admission.supervisor.colCompleted:Completed`, align: 'end' },
    { key: 'autoReturned', title: $localize`:@@portal.admission.supervisor.colAutoReturned:Auto returned`, align: 'end' },
    { key: 'coiReturned', title: $localize`:@@portal.admission.supervisor.colCoi:Conflict of interest`, align: 'end' },
  ];

  private readonly query = toSignal(this.search.valueChanges.pipe(debounceTime(300), map(value => value.trim()), distinctUntilChanged()), {
    initialValue: '',
  });
  private readonly queue = toSignal(this.queueFilter.valueChanges.pipe(map(value => (value === '' ? null : (value as SupervisorQueue)))), {
    initialValue: null,
  });

  protected readonly inbox = new CursorList<SupervisorInboxItem>(cursor => {
    const sort = this.sort();
    const key = sort ? SORT_KEYS[sort.key] : undefined;

    return this.api
      .getSupervisorDashboard({
        cursor,
        sort: key ? (sort?.order === 'descending' ? `-${key}` : key) : 'requestedAt',
        queue: this.queue(),
        q: this.query(),
      })
      .pipe(
        map(result => {
          this.dashboard.set(result.data);

          return { items: result.data.inbox.items, nextCursor: result.data.inbox.page.nextCursor };
        }),
      );
  });

  protected readonly poolTiles = computed<readonly InsightTile[]>(() => {
    const dashboard = this.dashboard();

    return dashboard ? poolTiles(dashboard.poolInsights) : [];
  });

  protected readonly queueTiles = computed<readonly InsightTile[]>(() => {
    const insights = this.dashboard()?.queueInsights;

    if (!insights) {
      return [];
    }

    return [
      { label: $localize`:@@portal.admission.supervisor.qPendingEscalated:Pending escalated`, value: String(insights.pendingEscalated), color: 'orange' },
      { label: $localize`:@@portal.admission.supervisor.qPendingScreenOut:Pending screen-out`, value: String(insights.pendingScreenOut), color: 'orange' },
      { label: $localize`:@@portal.admission.supervisor.qPendingReinstatement:Pending reinstatement`, value: String(insights.pendingReinstatement), color: 'purple' },
      { label: $localize`:@@portal.admission.supervisor.qTotalComplete:Total complete`, value: String(insights.totalComplete), color: 'green' },
      { label: $localize`:@@portal.admission.supervisor.qTotalScreenedOut:Total screened out`, value: String(insights.totalScreenedOut), color: 'red' },
      { label: $localize`:@@portal.admission.supervisor.qTotalReinstated:Total reinstated`, value: String(insights.totalReinstated), color: 'light-blue' },
      {
        label: $localize`:@@portal.admission.supervisor.qTotalRejected:Total reinstatement rejected`,
        value: String(insights.totalReinstatementRejected),
        color: 'pink',
      },
    ];
  });

  protected readonly inboxRows = computed<readonly SupervisorInboxRow[]>(() =>
    this.inbox.items().map(item => ({
      id: item.itemId,
      link:
        item.queue === 'REINSTATEMENT' && item.reinstatementRequestId
          ? ['/admission/supervisor/reinstatements', item.reinstatementRequestId]
          : ['/admission/applications', item.applicationId],
      applicationNumber: item.applicationNumber,
      candidateName: item.candidateName,
      programName: item.specialtyName ? `${item.programName} – ${item.specialtyName}` : item.programName,
      queue: queueLabel(item.queue),
      queuePurpose: item.queue === 'REINSTATEMENT' ? 'informative-purple' : item.queue === 'SCREEN_OUT' ? 'error' : 'warning',
      officerName: item.officerName ?? '–',
      requestedAt: formatDahcDateTime(item.requestedAt, this.locale, this.sessions.timeZoneId(), 'dateTime'),
    })),
  );

  protected readonly officerRows = computed<readonly OfficerRow[]>(() =>
    (this.dashboard()?.officersWorkload ?? []).map(row => ({
      id: row.officerId,
      officerName: row.officerName,
      inProgress: row.queueInsights.inProgress,
      pendingWithSupervisor: row.queueInsights.pendingWithSupervisor,
      resubmitted: row.queueInsights.resubmittedByCandidate + row.queueInsights.resubmittedBySupervisor,
      completed: row.queueInsights.completed,
      autoReturned: row.queueInsights.autoReturnedToPool,
      overdue: row.overdueCount,
    })),
  );

  protected readonly refereeRows = computed<readonly RefereeRow[]>(() =>
    (this.dashboard()?.refereesWorkload ?? []).map(row => ({
      id: row.refereeId,
      refereeName: row.refereeName,
      role: refereeRoleLabel(row.role),
      inProgress: row.inProgress,
      completed: row.completed,
      autoReturned: row.autoReturnedToPool,
      coiReturned: row.coiReturned,
    })),
  );

  constructor() {
    effect(() => {
      this.sort();
      this.query();
      this.queue();
      untracked(() => this.inbox.reload());
    });
  }

  protected inboxRow(row: DahcTableRow): SupervisorInboxRow {
    return row as SupervisorInboxRow;
  }

  protected officerRow(row: DahcTableRow): OfficerRow {
    return row as OfficerRow;
  }
}

function queueLabel(queue: SupervisorQueue): string {
  switch (queue) {
    case 'ESCALATION':
      return $localize`:@@portal.admission.supervisor.queueEscalation:Escalation`;
    case 'SCREEN_OUT':
      return $localize`:@@portal.admission.supervisor.queueScreenOut:Screen-out`;
    case 'REINSTATEMENT':
      return $localize`:@@portal.admission.supervisor.queueReinstatement:Reinstatement`;
  }
}

function refereeRoleLabel(role: RefereeRole): string {
  switch (role) {
    case 'REFEREE':
      return $localize`:@@portal.role.referee:Referee`;
    case 'THIRD_REFEREE':
      return $localize`:@@portal.role.thirdReferee:Third referee`;
    case 'SECOND_EVALUATION_REFEREE':
      return $localize`:@@portal.role.secondEvaluationReferee:2nd evaluation referee`;
  }
}
