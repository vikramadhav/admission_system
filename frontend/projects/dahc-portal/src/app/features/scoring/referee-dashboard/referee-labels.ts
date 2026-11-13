import { DahcStatTileColor, DahcTableColumn, DahcTableRow, DahcTableSort, DahcTagPurpose } from 'dahc-ui';

import { RefereeDashboard, RefereeInboxItem, RefereeInboxSort, RefereePool, ScoringRound } from '../../../api/scoring.models';
import { formatDahcDateTime } from '../../../core/locale/date-time.pipe';
import { portfolioStatusDisplay } from '../../../shared/workflow/workflow-status';

/** Label of a scoring round (US-3.1.2 inbox column "Round"). */
export function roundLabel(round: ScoringRound): string {
  switch (round) {
    case 'ROUND_1':
      return $localize`:@@portal.scoring.referee.round1:Round 1`;
    case 'ROUND_2':
      return $localize`:@@portal.scoring.referee.round2:Round 2`;
    case 'ROUND_3':
      return $localize`:@@portal.scoring.referee.round3:Round 3`;
    case 'SECOND_EVALUATION':
      return $localize`:@@portal.scoring.referee.secondEvaluation:2nd evaluation`;
  }
}

/** Kind of a referee pool (PROPOSAL, PQ-03). */
export function poolKindLabel(kind: RefereePool['kind']): string {
  switch (kind) {
    case 'STANDARD':
      return $localize`:@@portal.scoring.referee.poolStandard:Round 1 and 2 pool`;
    case 'DISCREPANCY':
      return $localize`:@@portal.scoring.referee.poolDiscrepancy:Discrepancy pool (Round 3)`;
    case 'APPEAL':
      return $localize`:@@portal.scoring.referee.poolAppeal:Appeal pool (2nd evaluation)`;
  }
}

export interface RefereeTile {
  readonly label: string;
  readonly value: string;
  readonly color: DahcStatTileColor;
}

/** Queue insights of the referee dashboard (US-3.1.2). */
export function refereeTiles(insights: RefereeDashboard['queueInsights']): readonly RefereeTile[] {
  return [
    { label: $localize`:@@portal.scoring.referee.tileInPool:Portfolios in pool`, value: String(insights.portfoliosInPool), color: 'light-blue' },
    { label: $localize`:@@portal.scoring.referee.tilePending:Pending my action`, value: String(insights.pendingMyAction), color: 'blue' },
    { label: $localize`:@@portal.scoring.referee.tileComplete:Complete`, value: String(insights.complete), color: 'green' },
    { label: $localize`:@@portal.scoring.referee.tileCoi:Returned for conflict of interest`, value: String(insights.returnedForCoi), color: 'orange' },
  ];
}

/** An inbox row. There is deliberately no candidate field: referees never see candidate identity (STP-3.1). */
export interface RefereeInboxRow extends DahcTableRow {
  readonly id: string;
  readonly portfolioId: string;
  readonly applicationNumber: string;
  readonly programName: string;
  readonly round: string;
  readonly retrievedAt: string;
  readonly dueAt: string;
  readonly overdue: boolean;
  /** Only portfolios being scored open the scoring page. */
  readonly open: boolean;
  readonly portfolioStatus: string;
  readonly statusPurpose: DahcTagPurpose;
}

export function refereeColumns(): readonly DahcTableColumn[] {
  return [
    { key: 'applicationNumber', title: $localize`:@@portal.scoring.referee.colApplication:Application ID`, sortable: true },
    { key: 'programName', title: $localize`:@@portal.scoring.referee.colProgram:Program` },
    { key: 'round', title: $localize`:@@portal.scoring.referee.colRound:Round`, sortable: true },
    { key: 'retrievedAt', title: $localize`:@@portal.scoring.referee.colRetrieved:Retrieved`, sortable: true },
    { key: 'dueAt', title: $localize`:@@portal.scoring.referee.colDue:Due`, sortable: true },
    { key: 'portfolioStatus', title: $localize`:@@portal.scoring.referee.colStatus:Portfolio status`, sortable: true },
  ];
}

const SORT_KEYS: Readonly<Record<string, RefereeInboxSort>> = {
  applicationNumber: 'applicationId',
  round: 'round',
  retrievedAt: 'retrievedAt',
  dueAt: 'dueAt',
  portfolioStatus: 'portfolioStatus',
};

/** The table sort as the API's allow-listed `sort`; default due date, oldest first (US-3.1.2). */
export function refereeSort(sort: DahcTableSort | null): RefereeInboxSort | `-${RefereeInboxSort}` {
  const key = sort ? SORT_KEYS[sort.key] : undefined;

  if (!sort || !key) {
    return 'dueAt';
  }

  return sort.order === 'descending' ? `-${key}` : key;
}

export function refereeRow(item: RefereeInboxItem, locale: string, timeZoneId: string): RefereeInboxRow {
  const status = portfolioStatusDisplay(item.portfolioStatus);
  const date = (value: string | null | undefined): string => formatDahcDateTime(value, locale, timeZoneId, 'date') || '–';

  return {
    id: `${item.portfolioId}-${item.round}`,
    portfolioId: item.portfolioId,
    applicationNumber: item.applicationNumber,
    programName: item.programName,
    round: roundLabel(item.round),
    retrievedAt: date(item.retrievedAt),
    dueAt: date(item.dueAt),
    overdue: item.overdue === true,
    open: item.roundStatus === undefined || item.roundStatus === 'IN_PROGRESS',
    portfolioStatus: status.label,
    statusPurpose: status.purpose,
  };
}
