import { ChangeDetectionStrategy, Component, computed, effect, inject, model, output, signal, untracked } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  DahcAlertComponent,
  DahcButtonComponent,
  DahcDetailItemComponent,
  DahcDetailListComponent,
  DahcDrawerComponent,
  DahcFileUploadComponent,
  DahcFileUploadValue,
  DahcTableColumn,
  DahcTableComponent,
  DahcTableRow,
  DahcToastService,
} from 'dahc-ui';
import { firstValueFrom } from 'rxjs';

import { ScreeningApiService } from '../../../api/screening-api.service';
import { CasperImportResult } from '../../../api/screening.models';
import { isApiProblemError } from '../../../core/api/api-problem-error';
import { callerHandlesProblems } from '../../../core/api/api-request';
import { DAHC_PORTAL_CONFIG } from '../../../core/config/portal-config';

/** CASPER results are an Excel workbook in the agreed template (US-4.2.1). */
const EXCEL_TYPES = '.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel';

/**
 * Upload and process CASPER results (US-4.2.1). The server validates the workbook structure
 * (rejected entirely when invalid), applies valid rows, marks applications missing from the file
 * as Absent and reports row exceptions; this drawer shows that summary and exception list. The
 * import needs a cycle id, which the contract cannot supply yet (PQ-12): it comes from the portal
 * configuration, and without it the upload is unavailable.
 */
@Component({
  selector: 'dahc-casper-import-drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcAlertComponent,
    DahcButtonComponent,
    DahcDetailItemComponent,
    DahcDetailListComponent,
    DahcDrawerComponent,
    DahcFileUploadComponent,
    DahcTableComponent,
    ReactiveFormsModule,
  ],
  styleUrl: './screening.scss',
  template: `
    <dahc-drawer [(open)]="open" i18n-heading="@@portal.admission.screening.casper.heading" heading="Upload CASPER results">
      <div class="screening-form">
        @if (cycleId === null) {
          <dahc-alert variant="warning" i18n-heading="@@portal.admission.screening.casper.noCycleHeading" heading="Upload unavailable">
            <p class="screening-text" i18n="@@portal.admission.screening.casper.noCycleText">
              The admission cycle for CASPER results is not configured yet, so results cannot be uploaded.
            </p>
          </dahc-alert>
        } @else {
          <p class="screening-muted" i18n="@@portal.admission.screening.casper.intro">
            Upload the CASPER results workbook. Valid rows are applied; applications that are not in the file are marked absent. A file with
            the wrong structure is rejected as a whole.
          </p>
          <dahc-file-upload
            [formControl]="file"
            i18n-label="@@portal.admission.screening.casper.file"
            label="CASPER results file"
            i18n-hint="@@portal.admission.screening.casper.fileHint"
            hint="Excel workbook (.xlsx) in the CASPER template: application ID, percentile, red flag scenarios, red flag comments, test date."
            [accept]="excelTypes"
            [required]="true"
            (fileSelected)="choose($event)"
            (fileRemoved)="choose(null)" />

          @if (error() !== '') {
            <dahc-alert variant="error" [announce]="true">{{ error() }}</dahc-alert>
          }

          @if (result(); as done) {
            <dahc-alert
              [variant]="done.exceptionRows === 0 ? 'success' : 'warning'"
              [announce]="true"
              i18n-heading="@@portal.admission.screening.casper.processedHeading"
              heading="File processed">
              <p class="screening-text" i18n="@@portal.admission.screening.casper.processedText">
                {{ done.appliedRows }} rows applied, {{ done.exceptionRows }} exceptions.
              </p>
            </dahc-alert>
            <dahc-detail-list [columns]="2">
              <div dahc-detail-item i18n-label="@@portal.admission.screening.casper.version" label="Upload version">{{ done.uploadVersion }}</div>
              <div dahc-detail-item i18n-label="@@portal.admission.screening.casper.total" label="Total rows">{{ done.totalRows }}</div>
              <div dahc-detail-item i18n-label="@@portal.admission.screening.casper.matched" label="Matched rows">{{ done.matchedRows ?? '–' }}</div>
              <div dahc-detail-item i18n-label="@@portal.admission.screening.casper.applied" label="Applied rows">{{ done.appliedRows }}</div>
              <div dahc-detail-item i18n-label="@@portal.admission.screening.casper.exceptions" label="Exception rows">{{ done.exceptionRows }}</div>
            </dahc-detail-list>
            @if (exceptionRows().length > 0) {
              <dahc-table
                i18n-caption="@@portal.admission.screening.casper.exceptionsCaption"
                caption="Rows not applied"
                [columns]="exceptionColumns"
                [rows]="exceptionRows()"
                rowKey="rowNumber" />
              <p class="screening-muted" i18n="@@portal.admission.screening.casper.correctNote">
                Correct these rows in the workbook and upload it again; the latest valid upload replaces the previous one.
              </p>
            }
          }
        }
      </div>
      <div dahcDialogFooter class="screening-buttons">
        <button dahc-button type="button" variant="secondary" (click)="open.set(false)" i18n="@@portal.admission.screening.done">Done</button>
        @if (cycleId !== null) {
          <button dahc-button type="button" [disabled]="chosen() === null" [loading]="busy()" (click)="upload()" i18n="@@portal.admission.screening.casper.upload">
            Upload and process
          </button>
        }
      </div>
    </dahc-drawer>
  `,
})
export class CasperImportDrawerComponent {
  private readonly api = inject(ScreeningApiService);
  private readonly toasts = inject(DahcToastService);

  readonly open = model<boolean>(false);
  /** Emitted after a successful import, so the dashboard reloads the scores. */
  readonly imported = output<void>();

  protected readonly cycleId = inject(DAHC_PORTAL_CONFIG).admissionCycleId ?? null;
  protected readonly excelTypes = EXCEL_TYPES;
  protected readonly file = new FormControl<DahcFileUploadValue>(null);
  protected readonly chosen = signal<File | null>(null);
  protected readonly busy = signal<boolean>(false);
  protected readonly error = signal<string>('');
  protected readonly result = signal<CasperImportResult | null>(null);

  protected readonly exceptionColumns: readonly DahcTableColumn[] = [
    { key: 'rowNumber', title: $localize`:@@portal.admission.screening.casper.col.row:Row`, align: 'end', width: '80px' },
    { key: 'applicationNumber', title: $localize`:@@portal.admission.screening.casper.col.applicationId:Application ID received` },
    { key: 'code', title: $localize`:@@portal.admission.screening.casper.col.code:Code` },
    { key: 'detail', title: $localize`:@@portal.admission.screening.casper.col.detail:Detail` },
  ];

  protected readonly exceptionRows = computed<readonly DahcTableRow[]>(() =>
    (this.result()?.exceptions ?? []).map(item => ({
      rowNumber: item.rowNumber,
      applicationNumber: item.applicationNumberReceived ?? '–',
      code: item.code,
      detail: item.detail ?? '',
    })),
  );

  /** One key per chosen file, reused if the same upload is retried. */
  private idempotencyKey = crypto.randomUUID();

  constructor() {
    effect(() => {
      if (this.open()) {
        untracked(() => {
          this.file.reset(null);
          this.chosen.set(null);
          this.result.set(null);
          this.error.set('');
        });
      }
    });
  }

  protected choose(file: File | null): void {
    this.chosen.set(file);
    this.error.set('');
    this.idempotencyKey = crypto.randomUUID();
  }

  protected async upload(): Promise<void> {
    const file = this.chosen();

    if (file === null || this.cycleId === null || this.busy()) {
      return;
    }

    this.busy.set(true);
    this.error.set('');
    this.result.set(null);

    try {
      const response = await firstValueFrom(this.api.importCasper(this.cycleId, file, this.idempotencyKey, callerHandlesProblems()));
      this.result.set(response.data);
      this.imported.emit();
      this.toasts.show({
        variant: 'success',
        heading: $localize`:@@portal.admission.screening.casper.done:CASPER results processed (upload ${response.data.uploadVersion}:version:)`,
      });
    } catch (error: unknown) {
      this.error.set(
        isApiProblemError(error)
          ? (error.problem.detail ?? error.problem.title)
          : $localize`:@@portal.problem.unexpected:Something went wrong. Please try again later.`,
      );
    } finally {
      this.busy.set(false);
    }
  }
}
