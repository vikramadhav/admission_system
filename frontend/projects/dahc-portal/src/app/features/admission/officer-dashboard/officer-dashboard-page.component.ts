import { ChangeDetectionStrategy, Component, LOCALE_ID, computed, effect, inject, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  DahcAlertComponent,
  DahcButtonComponent,
  DahcCardComponent,
  DahcEmptyStateComponent,
  DahcPageHeaderComponent,
  DahcSearchComponent,
  DahcStatTileComponent,
  DahcTableCellDirective,
  DahcTableComponent,
  DahcTableRow,
  DahcTableSort,
  DahcTagComponent,
  DahcToastService,
} from 'dahc-ui';
import { debounceTime, distinctUntilChanged, firstValueFrom, map } from 'rxjs';

import { AdmissionApiService } from '../../../api/admission-api.service';
import { AssignedPool, OfficerDashboard, OfficerInsight, VerificationInboxItem } from '../../../api/admission.models';
import { isApiProblemError } from '../../../core/api/api-problem-error';
import { callerHandlesProblems } from '../../../core/api/api-request';
import { SessionService } from '../../../core/auth/session.service';
import { CursorList } from '../../../shared/cursor-list/cursor-list';
import { LoadMoreComponent } from '../../../shared/cursor-list/load-more.component';
import { InboxRow, inboxColumns, inboxRow, inboxSort, poolTiles, queueTiles } from './verification-inbox';

/**
 * Admission officer dashboard (US-2.1.2): pool insights, personal queue insights that filter the
 * inbox, the officer's pools with Retrieve (US-2.2.1) and the inbox of retrieved applications,
 * oldest due date first, with server sort, search and "Load more" (cursor pagination).
 * Training sites are never shown to officers (STP-2.1).
 */
@Component({
  selector: 'dahc-officer-dashboard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcAlertComponent,
    DahcButtonComponent,
    DahcCardComponent,
    DahcEmptyStateComponent,
    DahcPageHeaderComponent,
    DahcSearchComponent,
    DahcStatTileComponent,
    DahcTableCellDirective,
    DahcTableComponent,
    DahcTagComponent,
    LoadMoreComponent,
    ReactiveFormsModule,
    RouterLink,
  ],
  styleUrl: './admission-pages.scss',
  templateUrl: './officer-dashboard-page.component.html',
})
export class OfficerDashboardPageComponent {
  private readonly api = inject(AdmissionApiService);
  private readonly sessions = inject(SessionService);
  private readonly toasts = inject(DahcToastService);
  private readonly locale = inject(LOCALE_ID);

  protected readonly columns = inboxColumns();
  protected readonly search = new FormControl<string>('', { nonNullable: true });
  protected readonly insight = signal<OfficerInsight | null>(null);
  protected readonly sort = signal<DahcTableSort | null>(null);
  protected readonly dashboard = signal<OfficerDashboard | null>(null);
  protected readonly retrieving = signal<string | null>(null);
  protected readonly retrieveMessage = signal<{ readonly variant: 'info' | 'error'; readonly text: string } | null>(null);

  private readonly query = toSignal(this.search.valueChanges.pipe(debounceTime(300), map(value => value.trim()), distinctUntilChanged()), {
    initialValue: '',
  });

  protected readonly inbox = new CursorList<VerificationInboxItem>(cursor =>
    this.api
      .getOfficerDashboard({ cursor, sort: inboxSort(this.sort()), insight: this.insight(), q: this.query() })
      .pipe(
        map(result => {
          this.dashboard.set(result.data);

          return { items: result.data.items, nextCursor: result.data.page.nextCursor };
        }),
      ),
  );

  protected readonly rows = computed<readonly InboxRow[]>(() =>
    this.inbox.items().map(item => inboxRow(item, this.locale, this.sessions.timeZoneId())),
  );
  protected readonly poolTiles = computed(() => {
    const dashboard = this.dashboard();

    return dashboard ? poolTiles(dashboard.poolInsights) : [];
  });
  protected readonly queueTiles = computed(() => {
    const dashboard = this.dashboard();

    return dashboard ? queueTiles(dashboard.queueInsights) : [];
  });
  /** PROPOSAL (PQ-03): the contract does not tell an officer which pools they have. */
  protected readonly pools = computed<readonly AssignedPool[] | null>(() => this.dashboard()?.pools ?? null);
  protected readonly caption = computed<string>(() => {
    const tile = this.queueTiles().find(item => item.insight === this.insight());

    return tile
      ? $localize`:@@portal.admission.officer.inboxFiltered:Your inbox: ${tile.label}:category:`
      : $localize`:@@portal.admission.officer.inboxCaption:Your inbox`;
  });

  constructor() {
    effect(() => {
      this.insight();
      this.sort();
      this.query();
      untracked(() => this.inbox.reload());
    });
  }

  protected toggleInsight(insight: OfficerInsight): void {
    this.insight.set(this.insight() === insight ? null : insight);
  }

  protected asRow(row: DahcTableRow): InboxRow {
    return row as InboxRow;
  }

  protected async retrieve(pool: AssignedPool): Promise<void> {
    this.retrieving.set(pool.poolId);
    this.retrieveMessage.set(null);

    try {
      const result = await firstValueFrom(this.api.retrieveApplications(pool.poolId, crypto.randomUUID(), callerHandlesProblems()));
      const count = result.data.length;

      if (count === 0) {
        this.retrieveMessage.set({
          variant: 'info',
          text: result.message ?? $localize`:@@portal.admission.officer.poolEmpty:There are no applications waiting in this pool.`,
        });
      } else {
        this.toasts.show({
          variant: 'success',
          heading: $localize`:@@portal.admission.officer.retrieved:${count}:count: applications added to your inbox`,
        });
      }

      this.inbox.reload();
    } catch (error: unknown) {
      this.retrieveMessage.set({
        variant: 'error',
        text: isApiProblemError(error)
          ? (error.problem.detail ?? error.problem.title)
          : $localize`:@@portal.problem.unexpected:Something went wrong. Please try again later.`,
      });
    } finally {
      this.retrieving.set(null);
    }
  }
}
