import { ChangeDetectionStrategy, Component, LOCALE_ID, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  DahcAlertComponent,
  DahcButtonComponent,
  DahcCheckboxComponent,
  DahcEmptyStateComponent,
  DahcNavLink,
  DahcPageHeaderComponent,
  DahcStatTileComponent,
  DahcTableCellDirective,
  DahcTableComponent,
  DahcTableRow,
  DahcTableSort,
  DahcTagComponent,
} from 'dahc-ui';
import { map } from 'rxjs';

import { AdmissionApiService } from '../../../api/admission-api.service';
import { OfficerWorkload, VerificationInboxItem } from '../../../api/admission.models';
import { SessionService } from '../../../core/auth/session.service';
import { CursorList } from '../../../shared/cursor-list/cursor-list';
import { LoadMoreComponent } from '../../../shared/cursor-list/load-more.component';
import { InboxRow, InsightTile, inboxColumns, inboxRow, inboxSort, queueTiles } from '../officer-dashboard/verification-inbox';
import { ReassignDialogComponent, ReassignSelection } from './reassign-dialog.component';

/**
 * One officer's workload for the supervisor (US-2.2.2 level 2): the officer's queue insights and
 * every application with all its dates, an "overdue only" filter, and selection for the
 * Reassign / Return pop-up (US-2.2.3).
 */
@Component({
  selector: 'dahc-officer-workload-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcAlertComponent,
    DahcButtonComponent,
    DahcCheckboxComponent,
    DahcEmptyStateComponent,
    DahcPageHeaderComponent,
    DahcStatTileComponent,
    DahcTableCellDirective,
    DahcTableComponent,
    DahcTagComponent,
    LoadMoreComponent,
    ReactiveFormsModule,
    ReassignDialogComponent,
    RouterLink,
  ],
  styleUrl: '../officer-dashboard/admission-pages.scss',
  templateUrl: './officer-workload-page.component.html',
})
export class OfficerWorkloadPageComponent {
  private readonly api = inject(AdmissionApiService);
  private readonly sessions = inject(SessionService);
  private readonly locale = inject(LOCALE_ID);

  /** Route parameter. */
  readonly officerId = input.required<string>();

  protected readonly columns = inboxColumns();
  protected readonly overdueOnly = new FormControl<boolean>(false, { nonNullable: true });
  protected readonly sort = signal<DahcTableSort | null>(null);
  protected readonly workload = signal<OfficerWorkload | null>(null);
  protected readonly selectedKeys = signal<readonly string[]>([]);
  protected readonly dialogOpen = signal<boolean>(false);

  private readonly overdue = toSignal(this.overdueOnly.valueChanges, { initialValue: false });

  protected readonly list = new CursorList<VerificationInboxItem>(cursor =>
    this.api.getOfficerWorkload(this.officerId(), { cursor, sort: inboxSort(this.sort()), overdue: this.overdue() }).pipe(
      map(result => {
        this.workload.set(result.data);

        return { items: result.data.items, nextCursor: result.data.page.nextCursor };
      }),
    ),
  );

  protected readonly officerName = computed<string>(() => this.workload()?.officer.officerName ?? '');
  protected readonly heading = computed<string>(() =>
    this.officerName() === ''
      ? $localize`:@@portal.admission.workload.headingLoading:Officer workload`
      : $localize`:@@portal.admission.workload.heading:Workload of ${this.officerName()}:name:`,
  );
  protected readonly breadcrumbs = computed<readonly DahcNavLink[]>(() => [
    { label: $localize`:@@portal.nav.supervisorDashboard:Supervision`, route: '/admission/supervisor' },
    { label: this.officerName() || $localize`:@@portal.admission.workload.headingLoading:Officer workload` },
  ]);
  protected readonly tiles = computed<readonly InsightTile[]>(() => {
    const workload = this.workload();

    if (!workload) {
      return [];
    }

    return [
      ...queueTiles(workload.officer.queueInsights),
      { label: $localize`:@@portal.admission.workload.overdueTile:Overdue`, value: String(workload.officer.overdueCount), color: 'red' },
    ];
  });
  protected readonly rows = computed<readonly InboxRow[]>(() => this.list.items().map(item => inboxRow(item, this.locale, this.sessions.timeZoneId())));
  protected readonly selection = computed<readonly ReassignSelection[]>(() => {
    const keys = new Set(this.selectedKeys());

    return this.rows()
      .filter(row => keys.has(row.id))
      .map(row => ({ applicationId: row.id, applicationNumber: row.applicationNumber, poolId: row.poolId }));
  });

  constructor() {
    effect(() => {
      this.officerId();
      this.sort();
      this.overdue();
      untracked(() => {
        this.selectedKeys.set([]);
        this.list.reload();
      });
    });
  }

  protected asRow(row: DahcTableRow): InboxRow {
    return row as InboxRow;
  }

  protected changed(): void {
    this.selectedKeys.set([]);
    this.list.reload();
  }
}
