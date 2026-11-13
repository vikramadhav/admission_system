import { ChangeDetectionStrategy, Component, DOCUMENT, LOCALE_ID, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  DahcAlertComponent,
  DahcButtonComponent,
  DahcDatePickerComponent,
  DahcEmptyStateComponent,
  DahcFormFieldComponent,
  DahcInputDirective,
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
import { catchError, map, of } from 'rxjs';

import { CatalogApiService } from '../../../api/catalog-api.service';
import { FinanceApiService } from '../../../api/finance-api.service';
import { BillStatus, PaymentFilters, PaymentRecord } from '../../../api/finance.models';
import { isApiProblemError } from '../../../core/api/api-problem-error';
import { callerHandlesProblems } from '../../../core/api/api-request';
import { saveBlob } from '../../../core/api/file-download';
import { SessionService } from '../../../core/auth/session.service';
import { DAHC_PORTAL_CONFIG } from '../../../core/config/portal-config';
import { formatDahcDateTime } from '../../../core/locale/date-time.pipe';
import { CursorList } from '../../../shared/cursor-list/cursor-list';
import { LoadMoreComponent } from '../../../shared/cursor-list/load-more.component';

interface PaymentRow extends DahcTableRow {
  readonly id: string;
  readonly applicationNumber: string;
  readonly name: string;
  readonly email: string;
  readonly program: string;
  readonly feeType: string;
  readonly billStatus: string;
  readonly billPurpose: DahcTagPurpose;
  readonly amount: string;
  readonly paymentDate: string;
}

const ALL = '';

/**
 * Finance payments (US-1.3.13): the finance officer's only screen. It searches application
 * payment records by admission cycle, program, application ID and payment date range, lists them
 * read-only (newest payment first; the contract has no sort allow-list, PQ-14) and exports the
 * current filters to Excel. The server builds the .xlsx file, so the portal needs no Excel npm
 * package (D-08); the browser only saves the returned blob.
 *
 * The contract has no operation that lists admission cycles (PQ-12), so the cycle filter offers
 * the configured current cycle and "All cycles". Programs come from the catalog (GET /programs,
 * open to any active user).
 */
@Component({
  selector: 'dahc-payments-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcAlertComponent,
    DahcButtonComponent,
    DahcDatePickerComponent,
    DahcEmptyStateComponent,
    DahcFormFieldComponent,
    DahcInputDirective,
    DahcPageHeaderComponent,
    DahcSelectComponent,
    DahcTableCellDirective,
    DahcTableComponent,
    DahcTagComponent,
    LoadMoreComponent,
    ReactiveFormsModule,
  ],
  styleUrl: './payments-page.component.scss',
  templateUrl: './payments-page.component.html',
})
export class PaymentsPageComponent {
  private readonly api = inject(FinanceApiService);
  private readonly sessions = inject(SessionService);
  private readonly locale = inject(LOCALE_ID);
  private readonly document = inject(DOCUMENT);
  private readonly currentCycleId = inject(DAHC_PORTAL_CONFIG).admissionCycleId ?? null;

  protected readonly cycleOptions: readonly DahcSelectOption[] = [
    ...(this.currentCycleId ? [{ value: this.currentCycleId, label: $localize`:@@portal.finance.cycleCurrent:Current cycle` }] : []),
    { value: ALL, label: $localize`:@@portal.finance.cycleAll:All cycles` },
  ];

  private readonly programs = toSignal(
    inject(CatalogApiService)
      .listPrograms()
      .pipe(
        map(result => result.data),
        catchError(() => of([])),
      ),
    { initialValue: [] },
  );

  protected readonly programOptions = computed<readonly DahcSelectOption[]>(() => [
    { value: ALL, label: $localize`:@@portal.finance.programAll:All programs` },
    ...this.programs().map(program => ({ value: program.id, label: program.name })),
  ]);

  protected readonly form = new FormGroup({
    cycleId: new FormControl<string>(this.currentCycleId ?? ALL, { nonNullable: true }),
    programId: new FormControl<string>(ALL, { nonNullable: true }),
    applicationNumber: new FormControl<string>('', { nonNullable: true }),
    from: new FormControl<string>('', { nonNullable: true }),
    to: new FormControl<string>('', { nonNullable: true }),
  });

  protected readonly columns: readonly DahcTableColumn[] = [
    { key: 'applicationNumber', title: $localize`:@@portal.finance.colApplication:Application ID`, width: '150px', fixed: 'start' },
    { key: 'name', title: $localize`:@@portal.finance.colName:English full name` },
    { key: 'email', title: $localize`:@@portal.finance.colEmail:Email` },
    { key: 'program', title: $localize`:@@portal.finance.colProgram:Program` },
    { key: 'feeType', title: $localize`:@@portal.finance.colFeeType:Fee type` },
    { key: 'billStatus', title: $localize`:@@portal.finance.colBillStatus:Bill status` },
    { key: 'amount', title: $localize`:@@portal.finance.colAmount:Bill amount`, align: 'end' },
    { key: 'paymentDate', title: $localize`:@@portal.finance.colPaymentDate:Payment date` },
  ];

  /** Filters applied by the last search; the list and the export both use them. */
  private readonly applied = signal<PaymentFilters>(this.filtersFromForm());

  protected readonly rangeError = signal<string>('');
  protected readonly exporting = signal<boolean>(false);
  protected readonly exportError = signal<string>('');

  protected readonly list = new CursorList<PaymentRecord>(cursor =>
    this.api
      .listPayments({ ...this.applied(), cursor }, callerHandlesProblems())
      .pipe(map(result => ({ items: result.data, nextCursor: result.pagination?.nextCursor ?? null }))),
  );

  private readonly amountFormat = new Intl.NumberFormat(this.locale, { style: 'currency', currency: 'AED' });

  protected readonly rows = computed<readonly PaymentRow[]>(() =>
    this.list.items().map(item => {
      const status = billStatusDisplay(item.billStatus);

      return {
        id: `${item.applicationId}-${item.paymentDate ?? ''}`,
        applicationNumber: item.applicationNumber,
        name: item.candidateDisplayName ?? '',
        email: item.email ?? '',
        program: item.program,
        feeType: item.feeType,
        billStatus: status.label,
        billPurpose: status.purpose,
        amount: this.amountFormat.format(item.billAmount),
        paymentDate: item.paymentDate ? formatDahcDateTime(item.paymentDate, this.locale, this.sessions.timeZoneId(), 'dateTime') : '–',
      };
    }),
  );

  constructor() {
    this.list.reload();
  }

  protected search(): void {
    const filters = this.filtersFromForm();

    if (filters.from && filters.to && filters.to < filters.from) {
      this.rangeError.set($localize`:@@portal.finance.rangeError:The "to" date must be on or after the "from" date.`);

      return;
    }

    this.rangeError.set('');
    this.exportError.set('');
    this.applied.set(filters);
    this.list.reload();
  }

  protected clear(): void {
    this.form.reset();
    this.search();
  }

  protected async export(): Promise<void> {
    if (this.exporting()) {
      return;
    }

    this.exporting.set(true);
    this.exportError.set('');

    try {
      const today = new Date().toISOString().slice(0, 10);
      await saveBlob(this.document, this.api.exportPayments(this.applied(), callerHandlesProblems()), `gme-payments-${today}.xlsx`);
    } catch (error: unknown) {
      this.exportError.set(
        isApiProblemError(error)
          ? (error.problem.detail ?? error.problem.title)
          : $localize`:@@portal.finance.exportFailed:The export could not be created. Please try again.`,
      );
    } finally {
      this.exporting.set(false);
    }
  }

  protected asRow(row: DahcTableRow): PaymentRow {
    return row as PaymentRow;
  }

  private filtersFromForm(): PaymentFilters {
    const value = this.form.getRawValue();

    return {
      cycleId: value.cycleId || null,
      programId: value.programId || null,
      applicationNumber: value.applicationNumber.trim() || null,
      from: value.from || null,
      to: value.to || null,
    };
  }
}

function billStatusDisplay(status: BillStatus): { label: string; purpose: DahcTagPurpose } {
  switch (status) {
    case 'PAID':
      return { label: $localize`:@@portal.finance.bill.paid:Paid`, purpose: 'success' };
    case 'PENDING':
      return { label: $localize`:@@portal.finance.bill.pending:Pending`, purpose: 'in-progress' };
    case 'FAILED':
      return { label: $localize`:@@portal.finance.bill.failed:Failed`, purpose: 'error' };
    case 'NA':
      return { label: $localize`:@@portal.finance.bill.na:Not applicable`, purpose: 'informative-blue' };
  }
}
