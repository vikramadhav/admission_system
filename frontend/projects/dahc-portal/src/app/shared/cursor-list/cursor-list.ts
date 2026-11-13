import { DestroyRef, Signal, computed, inject, signal } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import { isApiProblemError } from '../../core/api/api-problem-error';
import { ApiProblemDetails } from '../../core/api/api.models';

export interface CursorPage<T> {
  readonly items: readonly T[];
  readonly nextCursor: string | null;
}

/**
 * Signal state for a cursor-paged list (contract: limit / cursor, no totals). `reload()` starts
 * again from the first page, for example after a filter or sort change, because a cursor is bound
 * to its filters and sort; `loadMore()` appends the next page. Create it in an injection context.
 */
export class CursorList<T> {
  private readonly itemsState = signal<readonly T[]>([]);
  private readonly cursorState = signal<string | null>(null);
  private readonly loadingState = signal<boolean>(false);
  private readonly loadedState = signal<boolean>(false);
  private readonly problemState = signal<ApiProblemDetails | null>(null);
  private subscription: Subscription | null = null;

  readonly items: Signal<readonly T[]> = this.itemsState.asReadonly();
  readonly loading: Signal<boolean> = this.loadingState.asReadonly();
  /** True once the first page has arrived. */
  readonly loaded: Signal<boolean> = this.loadedState.asReadonly();
  readonly problem: Signal<ApiProblemDetails | null> = this.problemState.asReadonly();
  readonly hasMore = computed<boolean>(() => this.cursorState() !== null);

  constructor(private readonly fetch: (cursor: string | null) => Observable<CursorPage<T>>) {
    inject(DestroyRef).onDestroy(() => this.subscription?.unsubscribe());
  }

  reload(): void {
    this.load(null, false);
  }

  loadMore(): void {
    const cursor = this.cursorState();

    if (cursor !== null && !this.loadingState()) {
      this.load(cursor, true);
    }
  }

  private load(cursor: string | null, append: boolean): void {
    this.subscription?.unsubscribe();
    this.loadingState.set(true);
    this.problemState.set(null);
    this.subscription = this.fetch(cursor).subscribe({
      next: page => {
        this.itemsState.set(append ? [...this.itemsState(), ...page.items] : page.items);
        this.cursorState.set(page.nextCursor);
        this.loadedState.set(true);
        this.loadingState.set(false);
      },
      error: (error: unknown) => {
        this.problemState.set(isApiProblemError(error) ? error.problem : null);
        this.loadedState.set(true);
        this.loadingState.set(false);
      },
    });
  }
}
