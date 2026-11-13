import { Injectable, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import { AdmissionApiService } from '../../../api/admission-api.service';
import { ScreeningApiService } from '../../../api/screening-api.service';
import { ScreeningApplicationRow, ScreeningFilters, ScreeningSort } from '../../../api/screening.models';
import { CursorList } from '../../../shared/cursor-list/cursor-list';

export type ScreeningSortValue = ScreeningSort | `-${ScreeningSort}`;

/** BRD US-4.1.1: highest shortlisting score first, no formal rank. */
export const DEFAULT_SCREENING_SORT: ScreeningSortValue = '-shortlistingScore';

/**
 * State of the screening dashboard (EPIC-04): filters, server sort, the cursor-paged list, the
 * row selection and the screen-out reasons. Provided by the page, so it lives as long as the page.
 */
@Injectable()
export class ScreeningFacade {
  private readonly api = inject(ScreeningApiService);
  private readonly admissionApi = inject(AdmissionApiService);

  readonly filters = signal<ScreeningFilters>({});
  readonly sort = signal<ScreeningSortValue>(DEFAULT_SCREENING_SORT);
  readonly selectedIds = signal<readonly string[]>([]);

  readonly list = new CursorList<ScreeningApplicationRow>(cursor =>
    this.api
      .getDashboard({ cursor, sort: this.sort(), ...this.filters() })
      .pipe(map(result => ({ items: result.data.items, nextCursor: result.data.page.nextCursor }))),
  );

  /** Lookup SCREEN_OUT_REASON, used for the bulk screen-out reason and the reason column. */
  readonly screenOutReasons = rxResource({
    stream: () => this.admissionApi.listLookup('SCREEN_OUT_REASON').pipe(map(result => result.data.filter(item => item.active))),
  });

  readonly reasonLabels = computed<ReadonlyMap<string, string>>(
    () => new Map((this.screenOutReasons.value() ?? []).map(item => [item.code, item.label])),
  );

  /** The selected rows among those loaded, in list order. */
  readonly selectedRows = computed<readonly ScreeningApplicationRow[]>(() => {
    const selected = new Set(this.selectedIds());

    return this.list.items().filter(row => selected.has(row.applicationId));
  });

  load(): void {
    this.list.reload();
  }

  /** A cursor is bound to its filters, so changing them starts again and clears the selection. */
  setFilters(filters: ScreeningFilters): void {
    this.filters.set(filters);
    this.selectedIds.set([]);
    this.list.reload();
  }

  setSort(sort: ScreeningSortValue): void {
    if (sort === this.sort()) {
      return;
    }

    this.sort.set(sort);
    this.list.reload();
  }

  /** After a bulk action or import: fresh data, nothing selected. */
  refresh(): void {
    this.selectedIds.set([]);
    this.list.reload();
  }
}
