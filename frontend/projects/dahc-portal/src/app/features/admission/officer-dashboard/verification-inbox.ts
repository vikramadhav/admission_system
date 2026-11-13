import { DahcTableColumn, DahcTableRow, DahcTableSort, DahcTagPurpose } from 'dahc-ui';

import { VerificationInboxSort } from '../../../api/admission-api.service';
import { OfficerInsight, OfficerQueueInsights, VerificationInboxItem } from '../../../api/admission.models';
import { formatDahcDateTime } from '../../../core/locale/date-time.pipe';
import { InsightTile } from '../../../shared/workflow/pool-insights';
import { verificationStatusDisplay } from '../../../shared/workflow/workflow-status';

/**
 * Shared by the officer dashboard (US-2.1.2) and the supervisor's officer workload (US-2.2.2):
 * the verification inbox table, its server sort and the insight tiles.
 */
export interface InboxRow extends DahcTableRow {
  readonly id: string;
  readonly poolId: string;
  readonly applicationNumber: string;
  readonly candidateName: string;
  readonly programName: string;
  readonly submittedAt: string;
  readonly retrievedAt: string;
  readonly dueAt: string;
  readonly overdue: boolean;
  readonly verificationStatus: string;
  readonly statusPurpose: DahcTagPurpose;
  readonly gpaShortlistingScore: string;
  readonly examShortlistingScore: string;
}

export function inboxColumns(): readonly DahcTableColumn[] {
  return [
    { key: 'applicationNumber', title: $localize`:@@portal.admission.officer.colApplication:Application ID`, sortable: true },
    { key: 'candidateName', title: $localize`:@@portal.admission.officer.colCandidate:Candidate name`, sortable: true },
    { key: 'programName', title: $localize`:@@portal.admission.officer.colProgram:Program` },
    { key: 'submittedAt', title: $localize`:@@portal.admission.officer.colSubmitted:Submitted`, sortable: true },
    { key: 'retrievedAt', title: $localize`:@@portal.admission.officer.colRetrieved:Retrieved`, sortable: true },
    { key: 'dueAt', title: $localize`:@@portal.admission.officer.colDue:Due`, sortable: true },
    { key: 'verificationStatus', title: $localize`:@@portal.admission.officer.colStatus:Verification status`, sortable: true },
    { key: 'gpaShortlistingScore', title: $localize`:@@portal.admission.officer.colGpa:GPA score`, sortable: true, align: 'end' },
    { key: 'examShortlistingScore', title: $localize`:@@portal.admission.officer.colExam:Exam score`, sortable: true, align: 'end' },
  ];
}

const SORT_KEYS: Readonly<Record<string, VerificationInboxSort>> = {
  applicationNumber: 'applicationId',
  candidateName: 'candidateName',
  submittedAt: 'submittedAt',
  retrievedAt: 'retrievedAt',
  dueAt: 'dueAt',
  verificationStatus: 'verificationStatus',
  gpaShortlistingScore: 'gpaShortlistingScore',
  examShortlistingScore: 'examShortlistingScore',
};

/** The table's sort as the API's allow-listed `sort` value; default: due date, oldest first. */
export function inboxSort(sort: DahcTableSort | null): VerificationInboxSort | `-${VerificationInboxSort}` {
  const key = sort ? SORT_KEYS[sort.key] : undefined;

  if (!sort || !key) {
    return 'dueAt';
  }

  return sort.order === 'descending' ? `-${key}` : key;
}

export function inboxRow(item: VerificationInboxItem, locale: string, timeZoneId: string): InboxRow {
  const status = verificationStatusDisplay(item.verificationStatus);
  const date = (value: string | null | undefined): string => formatDahcDateTime(value, locale, timeZoneId, 'date') || '–';

  return {
    id: item.applicationId,
    poolId: item.poolId,
    applicationNumber: item.applicationNumber,
    candidateName: item.candidateName,
    programName: item.specialtyName ? `${item.programName} – ${item.specialtyName}` : item.programName,
    submittedAt: date(item.submittedAt),
    retrievedAt: date(item.retrievedAt),
    dueAt: date(item.dueAt),
    overdue: item.overdue === true,
    verificationStatus: status.label,
    statusPurpose: status.purpose,
    gpaShortlistingScore: score(item.gpaShortlistingScore),
    examShortlistingScore: score(item.examShortlistingScore),
  };
}

function score(value: number | null | undefined): string {
  return value === null || value === undefined ? '–' : value.toFixed(2);
}

export interface QueueTile extends InsightTile {
  readonly insight: OfficerInsight;
}

/** Personal queue insights; each filters the inbox to its category (US-2.1.2 AC10). */
export function queueTiles(insights: OfficerQueueInsights): readonly QueueTile[] {
  return [
    { insight: 'IN_PROGRESS', label: $localize`:@@portal.admission.officer.queueInProgress:In progress`, value: String(insights.inProgress), color: 'blue' },
    { insight: 'PENDING_RESPONSE', label: $localize`:@@portal.admission.officer.queuePendingResponse:Pending response`, value: String(insights.pendingResponse), color: 'orange' },
    { insight: 'PENDING_WITH_SUPERVISOR', label: $localize`:@@portal.admission.officer.queueWithSupervisor:Pending with supervisor`, value: String(insights.pendingWithSupervisor), color: 'purple' },
    { insight: 'RESUBMITTED_BY_CANDIDATE', label: $localize`:@@portal.admission.officer.queueByCandidate:Resubmitted by candidate`, value: String(insights.resubmittedByCandidate), color: 'light-blue' },
    { insight: 'RESUBMITTED_BY_SUPERVISOR', label: $localize`:@@portal.admission.officer.queueBySupervisor:Resubmitted by supervisor`, value: String(insights.resubmittedBySupervisor), color: 'light-blue' },
    { insight: 'COMPLETED', label: $localize`:@@portal.admission.officer.queueCompleted:Completed`, value: String(insights.completed), color: 'green' },
    { insight: 'SCREENED_OUT', label: $localize`:@@portal.admission.officer.queueScreenedOut:Screened out`, value: String(insights.screenedOut), color: 'red' },
    { insight: 'AUTO_RETURNED_TO_POOL', label: $localize`:@@portal.admission.officer.queueAutoReturned:Auto returned to pool`, value: String(insights.autoReturnedToPool), color: 'pink' },
  ];
}

export type { InsightTile } from '../../../shared/workflow/pool-insights';
export { poolTiles } from '../../../shared/workflow/pool-insights';
