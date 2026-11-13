import { ChangeDetectionStrategy, Component, LOCALE_ID, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  DahcAlertComponent,
  DahcButtonComponent,
  DahcIconComponent,
  DahcNavLink,
  DahcPageHeaderComponent,
  DahcTableCellDirective,
  DahcTableColumn,
  DahcTableComponent,
  DahcTableRow,
  DahcTableSort,
  DahcTagComponent,
  DahcTagPurpose,
} from 'dahc-ui';
import { map } from 'rxjs';

import { ApplicationStatus } from '../../../api/application.models';
import { MonitoringApiService } from '../../../api/monitoring-api.service';
import { MonitoringApplicationRow, MonitoringSort } from '../../../api/monitoring.models';
import { SessionService } from '../../../core/auth/session.service';
import { formatDahcDateTime } from '../../../core/locale/date-time.pipe';
import { applicationStatusDisplay } from '../../../shared/application-status';
import { CursorList } from '../../../shared/cursor-list/cursor-list';
import { LoadMoreComponent } from '../../../shared/cursor-list/load-more.component';
import { portfolioStatusDisplay, verificationStatusDisplay } from '../../../shared/workflow/workflow-status';

interface Row extends DahcTableRow {
  readonly id: string;
  readonly applicationNumber: string;
  readonly candidateName: string;
  readonly cycle: string;
  readonly programName: string;
  readonly status: string;
  readonly statusPurpose: DahcTagPurpose;
  readonly verification: string;
  readonly portfolio: string;
  readonly submittedAt: string;
}

/** Table column keys mapped to the contract's sort allow-list. */
const SORT_KEYS: Readonly<Record<string, MonitoringSort>> = {
  applicationNumber: 'applicationId',
  candidateName: 'candidateName',
  status: 'applicationStatus',
  submittedAt: 'submittedAt',
};

/**
 * Applications behind a chart segment of the central monitoring dashboard (US-2.1.4): read-only
 * list with the segment's filters from the query string; each application opens its read-only
 * details.
 */
@Component({
  selector: 'dahc-monitoring-applications-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcAlertComponent,
    DahcButtonComponent,
    DahcIconComponent,
    DahcPageHeaderComponent,
    DahcTableCellDirective,
    DahcTableComponent,
    DahcTagComponent,
    LoadMoreComponent,
    RouterLink,
  ],
  styleUrl: '../monitoring-pages.scss',
  template: `
    <dahc-page-header [heading]="heading()" [description]="description()" [breadcrumbs]="breadcrumbs" [focusOnLoad]="true" />

    <div class="dahc-portal-page">
      <section class="section" aria-labelledby="monitoring-list">
        <h2 id="monitoring-list" class="section-heading" i18n="@@portal.monitoring.applications.listHeading">Applications</h2>
        @if (list.problem(); as problem) {
          <dahc-alert variant="error" [announce]="true">
            {{ problem.detail ?? problem.title }}
            <button dahc-button type="button" variant="link" (click)="list.reload()" i18n="@@portal.action.tryAgain">Try again</button>
          </dahc-alert>
        }
        <dahc-table
          i18n-caption="@@portal.monitoring.applications.caption"
          caption="Applications in the selected chart segment"
          [columns]="columns"
          [rows]="rows()"
          [sort]="sort()"
          (sortChange)="changeSort($event)"
          [loading]="list.loading()"
          i18n-emptyText="@@portal.monitoring.applications.empty"
          emptyText="No applications match this segment."
          scrollX="960px">
          <ng-template dahcTableCell="applicationNumber" let-row>
            <a [routerLink]="['/monitoring/applications', asRow(row).id]">{{ asRow(row).applicationNumber }}</a>
          </ng-template>
          <ng-template dahcTableCell="status" let-row>
            <dahc-tag [purpose]="asRow(row).statusPurpose">{{ asRow(row).status }}</dahc-tag>
          </ng-template>
        </dahc-table>
        <dahc-load-more [shown]="rows().length" [hasMore]="list.hasMore()" [loading]="list.loading()" (loadMore)="list.loadMore()" />
      </section>
      <div class="actions">
        <a dahc-button variant="secondary" routerLink="/monitoring" [queryParams]="backParams()">
          <dahc-icon name="chevron-left" />
          <span i18n="@@portal.monitoring.applications.back">Back to site monitoring</span>
        </a>
      </div>
    </div>
  `,
})
export class MonitoringApplicationsPageComponent {
  private readonly api = inject(MonitoringApiService);
  private readonly sessions = inject(SessionService);
  private readonly locale = inject(LOCALE_ID);

  /** Query parameters of the chart segment (withComponentInputBinding). */
  readonly cycleId = input<string | undefined>(undefined);
  readonly programId = input<string | undefined>(undefined);
  readonly siteId = input<string | undefined>(undefined);
  readonly specialtyId = input<string | undefined>(undefined);
  readonly applicationStatus = input<string | undefined>(undefined);
  /** Human-readable name of the segment, set by the dashboard. */
  readonly label = input<string | undefined>(undefined);

  protected readonly sort = signal<DahcTableSort | null>(null);

  protected readonly columns: readonly DahcTableColumn[] = [
    { key: 'applicationNumber', title: $localize`:@@portal.monitoring.applications.colApplication:Application ID`, sortable: true },
    { key: 'candidateName', title: $localize`:@@portal.monitoring.applications.colCandidate:Candidate name`, sortable: true },
    { key: 'cycle', title: $localize`:@@portal.monitoring.applications.colCycle:Admission cycle` },
    { key: 'programName', title: $localize`:@@portal.monitoring.applications.colProgram:Program` },
    { key: 'status', title: $localize`:@@portal.monitoring.applications.colStatus:Application status`, sortable: true },
    { key: 'verification', title: $localize`:@@portal.monitoring.applications.colVerification:Verification status` },
    { key: 'portfolio', title: $localize`:@@portal.monitoring.applications.colPortfolio:Portfolio score status` },
    { key: 'submittedAt', title: $localize`:@@portal.monitoring.applications.colSubmitted:Submission date`, sortable: true },
  ];

  protected readonly breadcrumbs: readonly DahcNavLink[] = [
    { label: $localize`:@@portal.monitoring.dashboard.heading:Site monitoring`, route: '/monitoring' },
    { label: $localize`:@@portal.monitoring.applications.listHeading:Applications` },
  ];

  protected readonly list = new CursorList<MonitoringApplicationRow>(cursor => {
    const sort = this.sort();
    const key = sort ? SORT_KEYS[sort.key] : undefined;

    return this.api
      .listApplications({
        cursor,
        sort: key ? (sort?.order === 'descending' ? `-${key}` : key) : '-submittedAt',
        cycleId: this.cycleId() ?? null,
        programId: this.programId() ?? null,
        siteId: this.siteId() ?? null,
        specialtyId: this.specialtyId() ?? null,
        applicationStatus: (this.applicationStatus() as ApplicationStatus | undefined) ?? null,
      })
      .pipe(map(result => ({ items: result.data, nextCursor: result.pagination?.nextCursor ?? null })));
  });

  protected readonly heading = computed<string>(() => {
    const label = this.label();

    return label ? $localize`:@@portal.monitoring.applications.heading:Applications: ${label}:segment:` : $localize`:@@portal.monitoring.applications.listHeading:Applications`;
  });

  protected readonly description = computed<string>(() => $localize`:@@portal.monitoring.applications.description:Read-only list of the applications behind the chart segment you chose.`);

  /** The dashboard filters to restore (the segment's own filters are left out). */
  protected readonly backParams = computed<Record<string, string>>(() => {
    const params: Record<string, string> = {};
    const cycleId = this.cycleId();

    if (cycleId) {
      params['cycleId'] = cycleId;
    }

    return params;
  });

  protected readonly rows = computed<readonly Row[]>(() =>
    this.list.items().map(item => {
      const status = applicationStatusDisplay(item.applicationStatus);

      return {
        id: item.applicationId,
        applicationNumber: item.applicationNumber,
        candidateName: item.candidateName,
        cycle: item.cycleName ?? '–',
        programName: item.programName,
        status: status.label,
        statusPurpose: status.purpose,
        verification: item.verificationStatus ? verificationStatusDisplay(item.verificationStatus).label : '–',
        portfolio: item.portfolioStatus ? portfolioStatusDisplay(item.portfolioStatus).label : '–',
        submittedAt: item.submittedAt ? formatDahcDateTime(item.submittedAt, this.locale, this.sessions.timeZoneId(), 'date') : '–',
      };
    }),
  );

  constructor() {
    effect(() => {
      this.cycleId();
      this.programId();
      this.siteId();
      this.specialtyId();
      this.applicationStatus();
      this.sort();
      untracked(() => this.list.reload());
    });
  }

  protected changeSort(sort: DahcTableSort | null): void {
    this.sort.set(sort);
  }

  protected asRow(row: DahcTableRow): Row {
    return row as Row;
  }
}
