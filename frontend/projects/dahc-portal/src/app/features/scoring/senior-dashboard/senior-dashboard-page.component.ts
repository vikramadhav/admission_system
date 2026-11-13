import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import {
  DahcAlertComponent,
  DahcButtonComponent,
  DahcPageHeaderComponent,
  DahcStatTileColor,
  DahcStatTileComponent,
  DahcTableCellDirective,
  DahcTableColumn,
  DahcTableComponent,
  DahcTableRow,
} from 'dahc-ui';
import { map } from 'rxjs';

import { ScoringApiService } from '../../../api/scoring-api.service';
import { problemText, refereeRoleLabel } from './senior-labels';

interface PoolTile {
  readonly label: string;
  readonly value: string;
  readonly color: DahcStatTileColor;
}

interface WorkloadRow extends DahcTableRow {
  readonly id: string;
  readonly refereeName: string;
  readonly role: string;
  readonly inProgress: number;
  readonly completed: number;
  readonly autoReturned: number;
  readonly coiReturned: number;
}

/**
 * Senior referee dashboard (US-3.1.3): pool insights across the senior referee's scope and the
 * referees' workload, each referee linking to their inbox. The senior referee oversees scoring
 * only: they cannot retrieve portfolios (STP-3.2), and announcing scores belongs to the admission
 * team (EPIC-04).
 */
@Component({
  selector: 'dahc-senior-dashboard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcAlertComponent,
    DahcButtonComponent,
    DahcPageHeaderComponent,
    DahcStatTileComponent,
    DahcTableCellDirective,
    DahcTableComponent,
    RouterLink,
  ],
  styleUrl: './senior-pages.scss',
  template: `
    <dahc-page-header
      i18n-heading="@@portal.scoring.senior.heading"
      heading="Scoring oversight"
      i18n-description="@@portal.scoring.senior.description"
      description="Pool progress, referee workload, reassignments and score overrides."
      [focusOnLoad]="true" />

    <div class="dahc-portal-page">
      @if (dashboard.error()) {
        <dahc-alert variant="error" [announce]="true">
          {{ errorText() }}
          <button dahc-button type="button" variant="link" (click)="dashboard.reload()" i18n="@@portal.action.tryAgain">Try again</button>
        </dahc-alert>
      }

      <section class="section" aria-labelledby="senior-pool-insights">
        <h2 id="senior-pool-insights" class="section-heading" i18n="@@portal.scoring.senior.poolInsights">All pools</h2>
        <ul class="tiles">
          @for (tile of tiles(); track tile.label) {
            <li><dahc-stat-tile [label]="tile.label" [value]="tile.value" [color]="tile.color" /></li>
          }
        </ul>
        <p class="section-text" i18n="@@portal.scoring.senior.announcementNote">
          Scores are announced to candidates by the admission team, not from this page.
        </p>
      </section>

      <section class="section" aria-labelledby="senior-workload">
        <h2 id="senior-workload" class="section-heading" i18n="@@portal.scoring.senior.workload">Referees workload</h2>
        <p class="section-text" i18n="@@portal.scoring.senior.workloadText">
          Open a referee to see the portfolios in their inbox, then reassign or override from the portfolio.
        </p>
        <dahc-table
          i18n-caption="@@portal.scoring.senior.workloadCaption"
          caption="Referees and their portfolios"
          [columns]="columns"
          [rows]="rows()"
          [loading]="dashboard.isLoading()"
          i18n-emptyText="@@portal.scoring.senior.workloadEmpty"
          emptyText="No referees in your scope."
          scrollX="720px">
          <ng-template dahcTableCell="refereeName" let-row>
            <a [routerLink]="['/scoring/senior/referees', workloadRow(row).id]">{{ workloadRow(row).refereeName }}</a>
          </ng-template>
        </dahc-table>
      </section>
    </div>
  `,
})
export class SeniorDashboardPageComponent {
  private readonly api = inject(ScoringApiService);

  protected readonly columns: readonly DahcTableColumn[] = [
    { key: 'refereeName', title: $localize`:@@portal.scoring.senior.colReferee:Referee` },
    { key: 'role', title: $localize`:@@portal.scoring.senior.colRole:Role` },
    { key: 'inProgress', title: $localize`:@@portal.scoring.senior.colInProgress:In progress`, align: 'end' },
    { key: 'completed', title: $localize`:@@portal.scoring.senior.colCompleted:Completed`, align: 'end' },
    { key: 'autoReturned', title: $localize`:@@portal.scoring.senior.colAutoReturned:Auto returned to pool`, align: 'end' },
    { key: 'coiReturned', title: $localize`:@@portal.scoring.senior.colCoi:Returned for conflict of interest`, align: 'end' },
  ];

  protected readonly dashboard = rxResource({
    stream: () => this.api.getSeniorDashboard().pipe(map(result => result.data)),
  });

  protected readonly tiles = computed<readonly PoolTile[]>(() => {
    if (!this.dashboard.hasValue()) {
      return [];
    }

    const insights = this.dashboard.value().poolInsights;

    return [
      { label: $localize`:@@portal.scoring.senior.tilePending:Pending scoring`, value: String(insights.pendingScoring), color: 'light-blue' },
      { label: $localize`:@@portal.scoring.senior.tileRound1:First round in progress`, value: String(insights.firstRoundInProgress), color: 'blue' },
      { label: $localize`:@@portal.scoring.senior.tileRound2:Second round in progress`, value: String(insights.secondRoundInProgress), color: 'blue' },
      { label: $localize`:@@portal.scoring.senior.tileDiscrepancy:Resolving discrepancy`, value: String(insights.resolvingDiscrepancy), color: 'orange' },
      { label: $localize`:@@portal.scoring.senior.tileAppeal:Re-scoring appealed questions`, value: String(insights.rescoringAppealed), color: 'purple' },
      { label: $localize`:@@portal.scoring.senior.tileComplete:Complete`, value: String(insights.complete), color: 'green' },
    ];
  });

  protected readonly rows = computed<readonly WorkloadRow[]>(() =>
    (this.dashboard.hasValue() ? this.dashboard.value().refereesWorkload : []).map(row => ({
      id: row.refereeId,
      refereeName: row.refereeName,
      role: refereeRoleLabel(row.role),
      inProgress: row.inProgress,
      completed: row.completed,
      autoReturned: row.autoReturnedToPool,
      coiReturned: row.coiReturned,
    })),
  );

  protected readonly errorText = computed<string>(() => problemText(this.dashboard.error()));

  protected workloadRow(row: DahcTableRow): WorkloadRow {
    return row as WorkloadRow;
  }
}
