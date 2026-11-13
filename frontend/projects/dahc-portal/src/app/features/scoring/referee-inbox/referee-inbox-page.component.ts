import { ChangeDetectionStrategy, Component, LOCALE_ID, computed, effect, inject, input, untracked } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
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
  DahcTagComponent,
  DahcTagPurpose,
} from 'dahc-ui';
import { map } from 'rxjs';

import { ScoringApiService } from '../../../api/scoring-api.service';
import { RefereeInboxItem } from '../../../api/scoring.models';
import { SessionService } from '../../../core/auth/session.service';
import { formatDahcDateTime } from '../../../core/locale/date-time.pipe';
import { CursorList } from '../../../shared/cursor-list/cursor-list';
import { LoadMoreComponent } from '../../../shared/cursor-list/load-more.component';
import { portfolioStatusDisplay } from '../../../shared/workflow/workflow-status';
import { refereeRoleLabel, roundLabel, seniorBreadcrumbRoot } from '../senior-dashboard/senior-labels';

interface InboxRow extends DahcTableRow {
  readonly id: string;
  readonly portfolioId: string;
  readonly applicationNumber: string;
  readonly programName: string;
  readonly round: string;
  readonly retrievedAt: string;
  readonly dueAt: string;
  readonly overdue: boolean;
  readonly status: string;
  readonly statusPurpose: DahcTagPurpose;
}

/**
 * One referee's inbox as the senior referee sees it (US-3.1.3, US-3.2.2): the anonymised
 * portfolios (application ID only, never the candidate's name) with round, dates and status.
 * Each portfolio opens the oversight page, where it can be reassigned or its score overridden.
 */
@Component({
  selector: 'dahc-referee-inbox-page',
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
  styleUrl: '../senior-dashboard/senior-pages.scss',
  template: `
    <dahc-page-header [heading]="heading()" [description]="description()" [breadcrumbs]="breadcrumbs()" [focusOnLoad]="true" />

    <div class="dahc-portal-page">
      <section class="section" aria-labelledby="referee-inbox-list">
        <h2 id="referee-inbox-list" class="section-heading" i18n="@@portal.scoring.refereeInbox.listHeading">Portfolios</h2>
        @if (inbox.problem(); as problem) {
          <dahc-alert variant="error" [announce]="true">
            {{ problem.detail ?? problem.title }}
            <button dahc-button type="button" variant="link" (click)="inbox.reload()" i18n="@@portal.action.tryAgain">Try again</button>
          </dahc-alert>
        }
        <dahc-table
          i18n-caption="@@portal.scoring.refereeInbox.caption"
          caption="Portfolios assigned to this referee"
          [columns]="columns"
          [rows]="rows()"
          [loading]="inbox.loading()"
          i18n-emptyText="@@portal.scoring.refereeInbox.empty"
          emptyText="This referee has no portfolios."
          scrollX="760px">
          <ng-template dahcTableCell="applicationNumber" let-row>
            <a [routerLink]="['/scoring/senior/portfolios', inboxRow(row).portfolioId]">{{ inboxRow(row).applicationNumber }}</a>
          </ng-template>
          <ng-template dahcTableCell="dueAt" let-row>
            @if (inboxRow(row).overdue) {
              <span class="overdue">
                {{ inboxRow(row).dueAt }}
                <dahc-tag purpose="error" i18n="@@portal.scoring.refereeInbox.overdue">Overdue</dahc-tag>
              </span>
            } @else {
              {{ inboxRow(row).dueAt }}
            }
          </ng-template>
          <ng-template dahcTableCell="status" let-row>
            <dahc-tag [purpose]="inboxRow(row).statusPurpose">{{ inboxRow(row).status }}</dahc-tag>
          </ng-template>
        </dahc-table>
        <dahc-load-more [shown]="rows().length" [hasMore]="inbox.hasMore()" [loading]="inbox.loading()" (loadMore)="inbox.loadMore()" />
      </section>
      <div class="actions">
        <a dahc-button variant="secondary" routerLink="/scoring/senior">
          <dahc-icon name="chevron-left" />
          <span i18n="@@portal.scoring.refereeInbox.back">Back to scoring oversight</span>
        </a>
      </div>
    </div>
  `,
})
export class RefereeInboxPageComponent {
  private readonly api = inject(ScoringApiService);
  private readonly sessions = inject(SessionService);
  private readonly locale = inject(LOCALE_ID);

  /** Route parameter. */
  readonly refereeId = input.required<string>();

  protected readonly columns: readonly DahcTableColumn[] = [
    { key: 'applicationNumber', title: $localize`:@@portal.scoring.refereeInbox.colApplication:Application ID` },
    { key: 'programName', title: $localize`:@@portal.scoring.refereeInbox.colProgram:Program` },
    { key: 'round', title: $localize`:@@portal.scoring.refereeInbox.colRound:Round` },
    { key: 'retrievedAt', title: $localize`:@@portal.scoring.refereeInbox.colRetrieved:Retrieval date` },
    { key: 'dueAt', title: $localize`:@@portal.scoring.refereeInbox.colDue:Due date` },
    { key: 'status', title: $localize`:@@portal.scoring.refereeInbox.colStatus:Portfolio status` },
  ];

  /** The referee's name and role come from the senior dashboard's workload list. */
  private readonly workload = rxResource({
    stream: () => this.api.getSeniorDashboard().pipe(map(result => result.data.refereesWorkload)),
  });

  private readonly referee = computed(() => (this.workload.hasValue() ? this.workload.value().find(row => row.refereeId === this.refereeId()) : undefined));

  protected readonly inbox = new CursorList<RefereeInboxItem>(cursor =>
    this.api.listRefereePortfolios(this.refereeId(), { cursor, sort: 'dueAt' }).pipe(map(result => ({ items: result.data, nextCursor: result.pagination?.nextCursor ?? null }))),
  );

  protected readonly heading = computed<string>(() => {
    const name = this.referee()?.refereeName;

    return name
      ? $localize`:@@portal.scoring.refereeInbox.heading:Portfolios of ${name}:name:`
      : $localize`:@@portal.scoring.refereeInbox.headingFallback:Referee portfolios`;
  });

  protected readonly description = computed<string>(() => {
    const referee = this.referee();

    return referee ? refereeRoleLabel(referee.role) : '';
  });

  protected readonly breadcrumbs = computed<readonly DahcNavLink[]>(() => [seniorBreadcrumbRoot(), { label: this.heading() }]);

  protected readonly rows = computed<readonly InboxRow[]>(() =>
    this.inbox.items().map(item => {
      const status = portfolioStatusDisplay(item.portfolioStatus);

      return {
        id: `${item.portfolioId}-${item.round}`,
        portfolioId: item.portfolioId,
        applicationNumber: item.applicationNumber,
        programName: item.programName,
        round: roundLabel(item.round),
        retrievedAt: this.date(item.retrievedAt),
        dueAt: this.date(item.dueAt),
        overdue: item.overdue === true,
        status: status.label,
        statusPurpose: status.purpose,
      };
    }),
  );

  constructor() {
    effect(() => {
      this.refereeId();
      untracked(() => this.inbox.reload());
    });
  }

  protected inboxRow(row: DahcTableRow): InboxRow {
    return row as InboxRow;
  }

  private date(value: string | null | undefined): string {
    return value ? formatDahcDateTime(value, this.locale, this.sessions.timeZoneId(), 'date') : '–';
  }
}
