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

import { ScoringApiService } from '../../../api/scoring-api.service';
import { RefereeDashboard, RefereeInboxItem, RefereePool } from '../../../api/scoring.models';
import { isApiProblemError } from '../../../core/api/api-problem-error';
import { callerHandlesProblems } from '../../../core/api/api-request';
import { SessionService } from '../../../core/auth/session.service';
import { CursorList } from '../../../shared/cursor-list/cursor-list';
import { LoadMoreComponent } from '../../../shared/cursor-list/load-more.component';
import { RefereeInboxRow, poolKindLabel, refereeColumns, refereeRow, refereeSort, refereeTiles } from './referee-labels';

/**
 * Referee dashboard (US-3.1.2) for the referee, third referee and 2nd evaluation referee: queue
 * insights, the referee's pools with Retrieve (US-3.2.1) and the inbox of retrieved portfolios,
 * oldest due date first. Candidate identity is never shown on referee screens (STP-3.1): rows
 * carry the application ID only.
 */
@Component({
  selector: 'dahc-referee-dashboard-page',
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
  styleUrl: './scoring-pages.scss',
  templateUrl: './referee-dashboard-page.component.html',
})
export class RefereeDashboardPageComponent {
  private readonly api = inject(ScoringApiService);
  private readonly sessions = inject(SessionService);
  private readonly toasts = inject(DahcToastService);
  private readonly locale = inject(LOCALE_ID);

  protected readonly columns = refereeColumns();
  protected readonly search = new FormControl<string>('', { nonNullable: true });
  protected readonly sort = signal<DahcTableSort | null>(null);
  protected readonly dashboard = signal<RefereeDashboard | null>(null);
  protected readonly retrieving = signal<string | null>(null);
  protected readonly retrieveMessage = signal<{ readonly variant: 'info' | 'error'; readonly text: string } | null>(null);

  private readonly query = toSignal(this.search.valueChanges.pipe(debounceTime(300), map(value => value.trim()), distinctUntilChanged()), {
    initialValue: '',
  });

  protected readonly inbox = new CursorList<RefereeInboxItem>(cursor =>
    this.api.getRefereeDashboard({ cursor, sort: refereeSort(this.sort()), q: this.query() }).pipe(
      map(result => {
        this.dashboard.set(result.data);

        return { items: result.data.items, nextCursor: result.data.page.nextCursor };
      }),
    ),
  );

  protected readonly rows = computed<readonly RefereeInboxRow[]>(() => this.inbox.items().map(item => refereeRow(item, this.locale, this.sessions.timeZoneId())));
  protected readonly tiles = computed(() => {
    const dashboard = this.dashboard();

    return dashboard ? refereeTiles(dashboard.queueInsights) : [];
  });
  /** PROPOSAL (PQ-03): the contract does not tell a referee which pools they have. */
  protected readonly pools = computed<readonly RefereePool[] | null>(() => this.dashboard()?.pools ?? null);

  constructor() {
    effect(() => {
      this.sort();
      this.query();
      untracked(() => this.inbox.reload());
    });
  }

  protected poolKind(pool: RefereePool): string {
    return poolKindLabel(pool.kind);
  }

  protected asRow(row: DahcTableRow): RefereeInboxRow {
    return row as RefereeInboxRow;
  }

  protected async retrieve(pool: RefereePool): Promise<void> {
    this.retrieving.set(pool.poolId);
    this.retrieveMessage.set(null);

    try {
      const result = await firstValueFrom(this.api.retrievePortfolios(pool.poolId, crypto.randomUUID(), callerHandlesProblems()));
      const count = result.data.length;

      if (count === 0) {
        this.retrieveMessage.set({
          variant: 'info',
          text: result.message ?? $localize`:@@portal.scoring.referee.poolEmpty:There are no portfolios waiting for you in this pool.`,
        });
      } else {
        this.toasts.show({ variant: 'success', heading: $localize`:@@portal.scoring.referee.retrieved:${count}:count: portfolios added to your inbox` });
      }

      this.inbox.reload();
    } catch (error: unknown) {
      this.retrieveMessage.set({
        variant: 'error',
        text: isApiProblemError(error) ? (error.problem.detail ?? error.problem.title) : $localize`:@@portal.problem.unexpected:Something went wrong. Please try again later.`,
      });
    } finally {
      this.retrieving.set(null);
    }
  }
}
