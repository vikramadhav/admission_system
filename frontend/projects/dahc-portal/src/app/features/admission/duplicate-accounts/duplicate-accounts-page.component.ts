import { ChangeDetectionStrategy, Component, LOCALE_ID, computed, inject } from '@angular/core';
import {
  DahcAlertComponent,
  DahcButtonComponent,
  DahcEmptyStateComponent,
  DahcNavLink,
  DahcPageHeaderComponent,
  DahcTableCellDirective,
  DahcTableColumn,
  DahcTableComponent,
  DahcTableRow,
  DahcTagComponent,
} from 'dahc-ui';
import { map } from 'rxjs';

import { AdmissionApiService } from '../../../api/admission-api.service';
import { DuplicateAccountPair, DuplicateAccountParty } from '../../../api/admission.models';
import { SessionService } from '../../../core/auth/session.service';
import { formatDahcDateTime } from '../../../core/locale/date-time.pipe';
import { CursorList } from '../../../shared/cursor-list/cursor-list';
import { LoadMoreComponent } from '../../../shared/cursor-list/load-more.component';

interface DuplicateRow extends DahcTableRow {
  readonly id: string;
  readonly detectedAt: string;
  readonly matchedOn: readonly string[];
  readonly original: string;
  readonly duplicate: string;
}

/**
 * Duplicate candidate accounts detected at sign-in (US-1.1.1: the pair is recorded for the
 * supervisor). Read-only: the contract has no action to resolve a pair (PQ-20), and matched values
 * are never returned, only which attributes matched.
 */
@Component({
  selector: 'dahc-duplicate-accounts-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcAlertComponent,
    DahcButtonComponent,
    DahcEmptyStateComponent,
    DahcPageHeaderComponent,
    DahcTableCellDirective,
    DahcTableComponent,
    DahcTagComponent,
    LoadMoreComponent,
  ],
  styleUrl: '../officer-dashboard/admission-pages.scss',
  template: `
    <dahc-page-header
      i18n-heading="@@portal.admission.duplicates.heading"
      heading="Duplicate accounts"
      i18n-description="@@portal.admission.duplicates.description"
      description="Candidate accounts that matched an existing account by mobile number, Emirates ID or passport when they signed in."
      [breadcrumbs]="breadcrumbs"
      [focusOnLoad]="true" />
    <div class="dahc-portal-page">
      <dahc-alert variant="info" i18n="@@portal.admission.duplicates.readOnly">
        This report is read-only. Resolving a duplicate is not available in the portal yet (open question PQ-20); the duplicate account stays
        inactive.
      </dahc-alert>
      @if (list.problem(); as problem) {
        <dahc-alert variant="error" [announce]="true">
          {{ problem.detail ?? problem.title }}
          <button dahc-button type="button" variant="link" (click)="list.reload()" i18n="@@portal.action.tryAgain">Try again</button>
        </dahc-alert>
      }
      @if (list.loaded() && rows().length === 0 && !list.loading()) {
        <dahc-empty-state
          [headingLevel]="2"
          i18n-heading="@@portal.admission.duplicates.emptyHeading"
          heading="No duplicate accounts"
          i18n-description="@@portal.admission.duplicates.emptyText"
          description="No duplicate candidate accounts have been detected." />
      } @else {
        <dahc-table
          i18n-caption="@@portal.admission.duplicates.caption"
          caption="Duplicate accounts, newest first"
          [columns]="columns"
          [rows]="rows()"
          [loading]="list.loading()"
          scrollX="760px">
          <ng-template dahcTableCell="matchedOn" let-row>
            @for (match of asRow(row).matchedOn; track match) {
              <dahc-tag purpose="warning">{{ match }}</dahc-tag>
            }
          </ng-template>
        </dahc-table>
        <dahc-load-more [shown]="rows().length" [hasMore]="list.hasMore()" [loading]="list.loading()" (loadMore)="list.loadMore()" />
      }
    </div>
  `,
})
export class DuplicateAccountsPageComponent {
  private readonly api = inject(AdmissionApiService);
  private readonly sessions = inject(SessionService);
  private readonly locale = inject(LOCALE_ID);

  protected readonly breadcrumbs: readonly DahcNavLink[] = [
    { label: $localize`:@@portal.nav.supervisorDashboard:Supervision`, route: '/admission/supervisor' },
    { label: $localize`:@@portal.admission.duplicates.heading:Duplicate accounts` },
  ];
  protected readonly columns: readonly DahcTableColumn[] = [
    { key: 'detectedAt', title: $localize`:@@portal.admission.duplicates.colDetected:Detected` },
    { key: 'matchedOn', title: $localize`:@@portal.admission.duplicates.colMatched:Matched on` },
    { key: 'original', title: $localize`:@@portal.admission.duplicates.colOriginal:Original account` },
    { key: 'duplicate', title: $localize`:@@portal.admission.duplicates.colDuplicate:Duplicate account` },
  ];

  protected readonly list = new CursorList<DuplicateAccountPair>(cursor =>
    this.api.listDuplicateAccounts({ cursor, sort: '-detectedAt' }).pipe(map(result => ({ items: result.data, nextCursor: result.pagination?.nextCursor ?? null }))),
  );

  protected readonly rows = computed<readonly DuplicateRow[]>(() =>
    this.list.items().map(pair => ({
      id: pair.pairId,
      detectedAt: this.date(pair.detectedAt),
      matchedOn: pair.matchedOn.map(match => matchLabel(match)),
      original: this.party(pair.original),
      duplicate: this.party(pair.duplicate),
    })),
  );

  constructor() {
    this.list.reload();
  }

  protected asRow(row: DahcTableRow): DuplicateRow {
    return row as DuplicateRow;
  }

  private party(party: DuplicateAccountParty): string {
    return $localize`:@@portal.admission.duplicates.party:${party.displayName}:name: (candidate ${party.candidateNumber}:number:, created ${this.date(party.createdAt)}:date:)`;
  }

  private date(value: string): string {
    return formatDahcDateTime(value, this.locale, this.sessions.timeZoneId(), 'date');
  }
}

function matchLabel(match: DuplicateAccountPair['matchedOn'][number]): string {
  switch (match) {
    case 'MOBILE':
      return $localize`:@@portal.admission.duplicates.mobile:Mobile number`;
    case 'EMIRATES_ID':
      return $localize`:@@portal.admission.duplicates.emiratesId:Emirates ID`;
    case 'PASSPORT':
      return $localize`:@@portal.admission.duplicates.passport:Passport`;
  }
}
