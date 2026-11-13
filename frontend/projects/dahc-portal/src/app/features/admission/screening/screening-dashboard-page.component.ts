import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  DahcAlertComponent,
  DahcButtonComponent,
  DahcPageHeaderComponent,
  DahcSearchComponent,
  DahcSelectComponent,
  DahcSelectOption,
  DahcTableCellDirective,
  DahcTableColumn,
  DahcTableComponent,
  DahcTableRow,
  DahcTableSort,
  DahcTagComponent,
  DahcTagPurpose,
} from 'dahc-ui';

import { AnnouncementStatus } from '../../../api/admission.models';
import { CasperAttendance, ScreeningApplicationRow, ScreeningSort } from '../../../api/screening.models';
import { SessionService } from '../../../core/auth/session.service';
import { formatDahcDateTime } from '../../../core/locale/date-time.pipe';
import { LocaleService } from '../../../core/locale/locale.service';
import { applicationStatusDisplay } from '../../../shared/application-status';
import { LoadMoreComponent } from '../../../shared/cursor-list/load-more.component';
import {
  announcementStatusDisplay,
  portfolioStatusDisplay,
  verificationStatusDisplay,
  weightedScore,
} from '../../../shared/workflow/workflow-status';
import { CasperImportDrawerComponent } from './casper-import-drawer.component';
import { ScreeningBulkDialogComponent, ScreeningBulkKind } from './screening-bulk-dialog.component';
import { DEFAULT_SCREENING_SORT, ScreeningFacade, ScreeningSortValue } from './screening.facade';

/** The select's empty placeholder option stands for "All". */
const ALL = '';

interface ScreeningTableRow extends DahcTableRow {
  readonly applicationId: string;
  readonly applicationNumber: string;
  readonly candidateName: string;
  readonly programName: string;
  readonly applicationStatusLabel: string;
  readonly applicationStatusPurpose: DahcTagPurpose;
  readonly verificationLabel: string;
  readonly verificationPurpose: DahcTagPurpose;
  readonly portfolioLabel: string;
  readonly portfolioPurpose: DahcTagPurpose;
  readonly announcementStatus: string;
  readonly announcementLabel: string;
  readonly announcementPurpose: DahcTagPurpose;
  readonly casperAttendance: string;
  readonly appealed: string;
  readonly gpaShortlistingScore: number | null;
  readonly gpaText: string;
  readonly examShortlistingScore: number | null;
  readonly examText: string;
  readonly casperShortlistingScore: number | null;
  readonly casperText: string;
  readonly portfolioScore: number | null;
  readonly portfolioText: string;
  readonly shortlistingScore: number | null;
  readonly shortlistingText: string;
  readonly reviewCompletedAt: string;
  readonly initialAnnouncedAt: string;
  readonly reannouncedAt: string;
  readonly screenOutReason: string;
}

/** Table column keys that the contract allows as server sort keys. */
const SORT_KEYS: Readonly<Record<string, ScreeningSort>> = {
  applicationNumber: 'applicationId',
  candidateName: 'candidateName',
  announcementStatus: 'announcementStatus',
  gpaShortlistingScore: 'gpaShortlistingScore',
  examShortlistingScore: 'examShortlistingScore',
  casperShortlistingScore: 'casperShortlistingScore',
  portfolioScore: 'portfolioScore',
  shortlistingScore: 'shortlistingScore',
  reviewCompletedAt: 'reviewCompletedAt',
};

/**
 * Screening dashboard (US-4.1.1), admission supervisor only: current-cycle applications that
 * completed verification and portfolio scoring, highest shortlisting score first, with filters,
 * row selection and the screening actions: CASPER upload (US-4.2.1), initial announcement
 * (US-4.3.1), bulk screen-out (US-4.4.1) and reannouncement (US-4.5.1). Verification screen-outs
 * were already announced when endorsed (US-2.4.3).
 */
@Component({
  selector: 'dahc-screening-dashboard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ScreeningFacade],
  imports: [
    CasperImportDrawerComponent,
    DahcAlertComponent,
    DahcButtonComponent,
    DahcPageHeaderComponent,
    DahcSearchComponent,
    DahcSelectComponent,
    DahcTableCellDirective,
    DahcTableComponent,
    DahcTagComponent,
    LoadMoreComponent,
    ReactiveFormsModule,
    ScreeningBulkDialogComponent,
  ],
  styleUrls: ['./screening.scss', './screening-dashboard-page.component.scss'],
  templateUrl: './screening-dashboard-page.component.html',
})
export class ScreeningDashboardPageComponent {
  private readonly sessions = inject(SessionService);
  private readonly locale = inject(LocaleService);

  protected readonly facade = inject(ScreeningFacade);
  protected readonly casperOpen = signal<boolean>(false);
  protected readonly bulkOpen = signal<boolean>(false);
  protected readonly bulkKind = signal<ScreeningBulkKind>('announce');

  protected readonly filters = new FormGroup({
    announcementStatus: new FormControl<string>(ALL, { nonNullable: true }),
    casperAttendance: new FormControl<string>(ALL, { nonNullable: true }),
    appealed: new FormControl<string>(ALL, { nonNullable: true }),
  });
  private readonly query = signal<string>('');

  protected readonly tableSort = signal<DahcTableSort | null>({ key: 'shortlistingScore', order: 'descending' });

  protected readonly announcementOptions: readonly DahcSelectOption[] = [
    ...(['PENDING', 'READY_FOR_INITIAL_ANNOUNCEMENT', 'ANNOUNCED', 'APPEAL_UNDER_REVIEW', 'READY_FOR_REANNOUNCEMENT', 'REANNOUNCED'] as const).map(
      status => ({ value: status, label: announcementStatusDisplay(status).label }),
    ),
  ];

  protected readonly attendanceOptions: readonly DahcSelectOption[] = [
    { value: 'ATTENDED', label: casperLabel('ATTENDED') },
    { value: 'ABSENT', label: casperLabel('ABSENT') },
    { value: 'NA', label: casperLabel('NA') },
  ];

  protected readonly appealedOptions: readonly DahcSelectOption[] = [
    { value: 'true', label: $localize`:@@portal.admission.screening.yes:Yes` },
    { value: 'false', label: $localize`:@@portal.admission.screening.no:No` },
  ];

  protected readonly columns: readonly DahcTableColumn[] = [
    { key: 'applicationNumber', title: $localize`:@@portal.admission.screening.col.applicationId:Application ID`, sortable: true, fixed: 'start', width: '150px' },
    { key: 'candidateName', title: $localize`:@@portal.admission.screening.col.candidate:Candidate name`, sortable: true, width: '200px' },
    { key: 'programName', title: $localize`:@@portal.admission.screening.col.program:Program`, width: '180px' },
    { key: 'applicationStatus', title: $localize`:@@portal.admission.screening.col.applicationStatus:Application status`, width: '170px' },
    { key: 'verification', title: $localize`:@@portal.admission.screening.col.verification:Verification`, width: '150px' },
    { key: 'portfolio', title: $localize`:@@portal.admission.screening.col.portfolio:Portfolio`, width: '150px' },
    { key: 'announcementStatus', title: $localize`:@@portal.admission.screening.col.announcement:Announcement`, sortable: true, width: '180px' },
    { key: 'casperAttendance', title: $localize`:@@portal.admission.screening.col.casperAttendance:CASPER attendance`, width: '150px' },
    { key: 'appealed', title: $localize`:@@portal.admission.screening.col.appealed:Appealed`, width: '110px' },
    { key: 'gpaShortlistingScore', title: $localize`:@@portal.admission.screening.col.gpa:GPA score`, sortable: true, align: 'end', width: '130px' },
    { key: 'examShortlistingScore', title: $localize`:@@portal.admission.screening.col.exam:Entrance exam score`, sortable: true, align: 'end', width: '150px' },
    { key: 'casperShortlistingScore', title: $localize`:@@portal.admission.screening.col.casper:CASPER score`, sortable: true, align: 'end', width: '140px' },
    { key: 'portfolioScore', title: $localize`:@@portal.admission.screening.col.portfolioScore:Portfolio score`, sortable: true, align: 'end', width: '140px' },
    { key: 'shortlistingScore', title: $localize`:@@portal.admission.screening.col.shortlisting:Shortlisting score`, sortable: true, align: 'end', width: '150px' },
    { key: 'reviewCompletedAt', title: $localize`:@@portal.admission.screening.col.reviewCompleted:Review completed`, sortable: true, width: '150px' },
    { key: 'initialAnnouncedAt', title: $localize`:@@portal.admission.screening.col.initialAnnouncement:Initial announcement`, width: '160px' },
    { key: 'reannouncedAt', title: $localize`:@@portal.admission.screening.col.reannouncement:Reannouncement`, width: '150px' },
    { key: 'screenOutReason', title: $localize`:@@portal.admission.screening.col.screenOutReason:Screen-out reason`, width: '240px' },
  ];

  protected readonly rows = computed<readonly ScreeningTableRow[]>(() => {
    const reasons = this.facade.reasonLabels();

    return this.facade.list.items().map(row => this.toTableRow(row, reasons));
  });

  protected readonly selectedCount = computed<number>(() => this.facade.selectedRows().length);

  protected readonly reasonOptions = computed<readonly DahcSelectOption[]>(() =>
    (this.facade.screenOutReasons.value() ?? []).map(item => ({ value: item.code, label: item.label })),
  );

  constructor() {
    this.facade.load();
    this.filters.valueChanges.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe(() => this.applyFilters());
  }

  protected asRow(row: DahcTableRow): ScreeningTableRow {
    return row as ScreeningTableRow;
  }

  protected search(text: string): void {
    this.query.set(text.trim());
    this.applyFilters();
  }

  protected onSort(sort: DahcTableSort | null): void {
    this.tableSort.set(sort);
    const key = sort ? SORT_KEYS[sort.key] : undefined;
    const value: ScreeningSortValue = key === undefined || sort === null ? DEFAULT_SCREENING_SORT : sort.order === 'descending' ? `-${key}` : key;
    this.facade.setSort(value);
  }

  protected openBulk(kind: ScreeningBulkKind): void {
    if (this.selectedCount() === 0) {
      return;
    }

    this.bulkKind.set(kind);
    this.bulkOpen.set(true);
  }

  private applyFilters(): void {
    const value = this.filters.getRawValue();

    this.facade.setFilters({
      announcementStatus: value.announcementStatus === ALL ? null : (value.announcementStatus as AnnouncementStatus),
      casperAttendance: value.casperAttendance === ALL ? null : (value.casperAttendance as CasperAttendance),
      appealed: value.appealed === ALL ? null : value.appealed === 'true',
      q: this.query(),
    });
  }

  private toTableRow(row: ScreeningApplicationRow, reasons: ReadonlyMap<string, string>): ScreeningTableRow {
    const application = applicationStatusDisplay(row.applicationStatus);
    const verification = verificationStatusDisplay(row.verificationStatus);
    const portfolio = portfolioStatusDisplay(row.portfolioStatus);
    const announcement = announcementStatusDisplay(row.announcementStatus);
    const weights = row.weights ?? {};

    return {
      applicationId: row.applicationId,
      applicationNumber: row.applicationNumber,
      candidateName: row.candidateName,
      programName: row.programName,
      applicationStatusLabel: application.label,
      applicationStatusPurpose: application.purpose,
      verificationLabel: verification.label,
      verificationPurpose: verification.purpose,
      portfolioLabel: portfolio.label,
      portfolioPurpose: portfolio.purpose,
      announcementStatus: row.announcementStatus,
      announcementLabel: announcement.label,
      announcementPurpose: announcement.purpose,
      casperAttendance: casperLabel(row.casperAttendance),
      appealed: row.appealed ? $localize`:@@portal.admission.screening.yes:Yes` : $localize`:@@portal.admission.screening.no:No`,
      gpaShortlistingScore: row.gpaShortlistingScore ?? null,
      gpaText: weightedScore(row.gpaShortlistingScore, weights.gpa),
      examShortlistingScore: row.examShortlistingScore ?? null,
      examText: weightedScore(row.examShortlistingScore, weights.exam),
      casperShortlistingScore: row.casperShortlistingScore ?? null,
      casperText: row.casperShortlistingScore === null || row.casperShortlistingScore === undefined ? notAvailable() : weightedScore(row.casperShortlistingScore, weights.casper),
      portfolioScore: row.portfolioScore ?? null,
      portfolioText: weightedScore(row.portfolioScore, weights.portfolio),
      shortlistingScore: row.shortlistingScore,
      shortlistingText: weightedScore(row.shortlistingScore),
      reviewCompletedAt: this.date(row.reviewCompletedAt),
      initialAnnouncedAt: this.date(row.initialAnnouncedAt),
      reannouncedAt: this.date(row.reannouncedAt),
      screenOutReason: row.screenOutReasonCode ? (reasons.get(row.screenOutReasonCode) ?? row.screenOutReasonCode) : '',
    };
  }

  private date(value: string | null | undefined): string {
    return value ? formatDahcDateTime(value, this.locale.culture, this.sessions.timeZoneId(), 'date') : '';
  }
}

function casperLabel(attendance: CasperAttendance): string {
  switch (attendance) {
    case 'ATTENDED':
      return $localize`:@@portal.admission.screening.casper.attended:Attended`;
    case 'ABSENT':
      return $localize`:@@portal.admission.screening.casper.absent:Absent`;
    case 'NA':
      return notAvailable();
  }
}

function notAvailable(): string {
  return $localize`:@@portal.admission.screening.notAvailable:N/A`;
}
