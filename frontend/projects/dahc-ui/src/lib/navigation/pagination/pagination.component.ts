import { ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, computed, inject, input, model } from '@angular/core';

import { DahcIconComponent } from '../../core/icon/icon.component';

type PageItem = number | 'gap-start' | 'gap-end';

/** Page numbers with ellipses: first, last and current ±1, at most 7 slots (Figma "1 2 3 … 8 9 10"). */
export function dahcPageItems(current: number, total: number): readonly PageItem[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, 'gap-end', total];
  }

  if (current >= total - 3) {
    return [1, 'gap-start', total - 4, total - 3, total - 2, total - 1, total];
  }

  return [1, 'gap-start', current - 1, current, current + 1, 'gap-end', total];
}

/**
 * Moves between pages of a long list: <dahc-pagination [total]="120" [(current)]="page" />.
 * Figma Page indicators › Pagination (50:8033): 44px pill page items with a 16px gap, current page
 * navy with white Bold 16, others Regular 16; Previous / Next Bold 18/20 with 24px arrows; optional
 * navy-200 divider above with 24px padding. Previous / Next are disabled at the ends (DH: 50%;
 * DAHC: disabled tokens). Ported from dubai-health-ui (packages/components/src/pagination).
 */
@Component({
  selector: 'dahc-pagination',
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcIconComponent],
  host: {
    '[class.dahc-pagination--divider]': 'divider()',
  },
})
export class DahcPaginationComponent {
  /** Total number of items. */
  readonly total = input.required<number>();
  readonly pageSize = input<number>(10);
  /** Current page, 1-based: [(current)]. */
  readonly current = model<number>(1);
  /** Accessible name of the navigation landmark. */
  readonly label = input<string>($localize`:@@dahcUi.pagination.label:Pagination`);
  readonly previousLabel = input<string>($localize`:@@dahcUi.pagination.previous:Previous`);
  readonly nextLabel = input<string>($localize`:@@dahcUi.pagination.next:Next`);
  /** Accessible name prefix of page buttons: "Page 3". */
  readonly pageLabel = input<string>($localize`:@@dahcUi.pagination.page:Page`);
  /** Shows the Figma divider above. */
  readonly divider = input<boolean>(false);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  protected readonly pageCount = computed<number>(() => Math.max(1, Math.ceil(this.total() / Math.max(1, this.pageSize()))));
  protected readonly page = computed<number>(() => Math.min(Math.max(1, this.current()), this.pageCount()));
  protected readonly items = computed(() => dahcPageItems(this.page(), this.pageCount()));

  protected go(page: number): void {
    const target = Math.min(this.pageCount(), Math.max(1, page));

    if (target === this.page()) {
      return;
    }

    this.current.set(target);
    afterNextRender(() => this.host.nativeElement.querySelector<HTMLElement>('[aria-current="page"]')?.focus(), {
      injector: this.injector,
    });
  }

  protected isPage(item: PageItem): item is number {
    return typeof item === 'number';
  }
}
