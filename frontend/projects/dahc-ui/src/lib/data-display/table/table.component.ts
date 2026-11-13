import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  TemplateRef,
  afterNextRender,
  computed,
  contentChildren,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

import { DahcPaginationComponent } from '../../navigation/pagination/pagination.component';

export type DahcTableRow = Readonly<Record<string, unknown>>;

export interface DahcTableColumn {
  /** Row property shown in this column; also the key of a custom cell template. */
  readonly key: string;
  readonly title: string;
  readonly sortable?: boolean;
  readonly align?: 'start' | 'center' | 'end';
  /** Column width as a CSS length, for example '160px'. Required on fixed columns. */
  readonly width?: string;
  /** Keeps the column visible at the inline start or end edge while the table scrolls horizontally. */
  readonly fixed?: 'start' | 'end';
  /** Truncates long content to one line with an ellipsis (set a width). */
  readonly ellipsis?: boolean;
}

/** Layout of one column: its sticky offset and whether it carries the scroll shadow. */
interface DahcTableColumnLayout {
  readonly column: DahcTableColumn;
  readonly start: string | null;
  readonly end: string | null;
  readonly lastStart: boolean;
  readonly firstEnd: boolean;
}

/** Width of the selection column; also the first part of the start offsets when it is sticky. */
const SELECT_WIDTH = 'var(--dahc-size-touch-target)';

export type DahcSortOrder = 'ascending' | 'descending';

export interface DahcTableSort {
  readonly key: string;
  readonly order: DahcSortOrder;
}

/** Context of a custom cell template: let-row (implicit) and let-value="value". */
export interface DahcTableCellContext {
  readonly $implicit: DahcTableRow;
  readonly value: unknown;
}

/**
 * Custom cell content for one column:
 * <ng-template dahcTableCell="status" let-row><dahc-tag …>{{ row['status'] }}</dahc-tag></ng-template>
 */
@Directive({ selector: 'ng-template[dahcTableCell]' })
export class DahcTableCellDirective {
  readonly column = input.required<string>({ alias: 'dahcTableCell' });
  readonly template = inject<TemplateRef<DahcTableCellContext>>(TemplateRef);

  /** Types let-row and let-value in the template; Angular only uses it for type checking. */
  static ngTemplateContextGuard(directive: DahcTableCellDirective, context: unknown): context is DahcTableCellContext {
    return directive instanceof DahcTableCellDirective && typeof context === 'object' && context !== null;
  }
}

/**
 * Data table with sorting, row selection and pagination. Columns and rows are data; columns can
 * have custom cell templates (dahcTableCell). Sorting cycles ascending, descending, none; the
 * column header button reports aria-sort. The scrolling wrapper is a focusable, labelled region
 * so keyboard users can scroll wide tables.
 * Fixed columns and scrolling follow NG-ZORRO's table (nzScroll, nzLeft / nzRight): scrollX sets
 * the table's minimum width so it scrolls horizontally, scrollY limits the height and keeps the
 * header row visible, and columns with `fixed` stay at the start or end edge (with a shadow while
 * content scrolls under them). Fixed columns need a `width`; the selection column becomes sticky
 * when any column is fixed at the start.
 * DERIVED design (DH has no table) following dubai-health-ui dh-table: navy header row with
 * white Bold 14, 12/16 cell padding, navy-100 row dividers, hover blue-100, radius 12.
 * Ported from dubai-health-ui (packages/components/src/table/dh-table.ts).
 */
@Component({
  selector: 'dahc-table',
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcPaginationComponent, NgTemplateOutlet],
  host: {
    '[class.dahc-table--striped]': 'striped()',
    '[class.dahc-table--scroll-y]': "scrollY() !== ''",
    '[class.dahc-table--shadow-start]': 'shadowStart()',
    '[class.dahc-table--shadow-end]': 'shadowEnd()',
  },
})
export class DahcTableComponent {
  /** Visible caption and accessible name of the table. */
  readonly caption = input.required<string>();
  readonly columns = input.required<readonly DahcTableColumn[]>();
  readonly rows = input.required<readonly DahcTableRow[]>();
  /** Row property that identifies a row (selection and tracking). */
  readonly rowKey = input<string>('id');
  readonly selectable = input<boolean>(false);
  /** Keys of the selected rows: [(selectedKeys)]. */
  readonly selectedKeys = model<readonly string[]>([]);
  /** Current sort: [(sort)]; null keeps the given row order. */
  readonly sort = model<DahcTableSort | null>(null);
  /** Rows per page; 0 shows all rows without pagination. */
  readonly pageSize = input<number>(0);
  /** Current page, 1-based: [(page)]. */
  readonly page = model<number>(1);
  readonly loading = input<boolean>(false);
  readonly striped = input<boolean>(false);
  readonly emptyText = input<string>($localize`:@@dahcUi.table.empty:No data`);
  readonly loadingText = input<string>($localize`:@@dahcUi.table.loading:Loading…`);
  readonly selectAllLabel = input<string>($localize`:@@dahcUi.table.selectAll:Select all rows on this page`);
  readonly selectRowLabel = input<string>($localize`:@@dahcUi.table.selectRow:Select row`);
  /** Minimum inline size of the table, for example '1300px'; wider than the space makes it scroll horizontally. */
  readonly scrollX = input<string>('');
  /** Maximum block size of the scroll area, for example '320px'; the header row then stays visible. */
  readonly scrollY = input<string>('');

  private readonly destroyRef = inject(DestroyRef);
  private readonly scroller = viewChild.required<ElementRef<HTMLElement>>('scroller');
  /** Content is hidden under the start-fixed columns (scrolled away from the start). */
  protected readonly shadowStart = signal<boolean>(false);
  /** More content waits beyond the end-fixed columns. */
  protected readonly shadowEnd = signal<boolean>(false);

  /** The selection column is sticky when any column is fixed at the start. */
  protected readonly selectFixed = computed<boolean>(
    () => this.selectable() && this.columns().some(column => column.fixed === 'start'),
  );

  protected readonly layouts = computed<readonly DahcTableColumnLayout[]>(() => {
    const columns = this.columns();
    const starts: (string | null)[] = columns.map(() => null);
    const ends: (string | null)[] = columns.map(() => null);
    const offset = (parts: readonly string[]): string => (parts.length === 0 ? '0px' : `calc(${parts.join(' + ')})`);

    const startParts: string[] = this.selectFixed() ? [SELECT_WIDTH] : [];
    let lastStart = -1;
    columns.forEach((column, index) => {
      if (column.fixed === 'start') {
        starts[index] = offset(startParts);
        startParts.push(column.width ?? '0px');
        lastStart = index;
      }
    });

    const endParts: string[] = [];
    let firstEnd = -1;
    for (let index = columns.length - 1; index >= 0; index--) {
      const column = columns[index];

      if (column?.fixed === 'end') {
        ends[index] = offset(endParts);
        endParts.push(column.width ?? '0px');
        firstEnd = index;
      }
    }

    return columns.map((column, index) => ({
      column,
      start: starts[index] ?? null,
      end: ends[index] ?? null,
      lastStart: index === lastStart,
      firstEnd: index === firstEnd,
    }));
  });

  constructor() {
    // Shadows follow the scroll position and the space available (resize, data changes).
    afterNextRender(() => {
      const element = this.scroller().nativeElement;
      const update = (): void => this.updateShadows(element);
      const observer = new ResizeObserver(update);
      observer.observe(element);
      const table = element.querySelector('table');

      if (table) {
        observer.observe(table);
      }

      element.addEventListener('scroll', update, { passive: true });
      update();
      this.destroyRef.onDestroy(() => {
        observer.disconnect();
        element.removeEventListener('scroll', update);
      });
    });
  }


  /** scrollLeft is negative in right-to-left layouts, so the distance from the start is its absolute value. */
  private updateShadows(element: HTMLElement): void {
    const fromStart = Math.abs(element.scrollLeft);
    const room = element.scrollWidth - element.clientWidth;
    this.shadowStart.set(fromStart > 1);
    this.shadowEnd.set(room - fromStart > 1);
  }

  private readonly cellTemplates = contentChildren(DahcTableCellDirective);

  protected readonly templates = computed(() => new Map(this.cellTemplates().map(cell => [cell.column(), cell.template])));

  protected readonly sortedRows = computed<readonly DahcTableRow[]>(() => {
    const sort = this.sort();

    if (!sort) {
      return this.rows();
    }

    const direction = sort.order === 'ascending' ? 1 : -1;
    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

    return [...this.rows()].sort((first, second) => {
      const a = first[sort.key];
      const b = second[sort.key];

      if (typeof a === 'number' && typeof b === 'number') {
        return (a - b) * direction;
      }

      return collator.compare(String(a ?? ''), String(b ?? '')) * direction;
    });
  });

  protected readonly visibleRows = computed<readonly DahcTableRow[]>(() => {
    const size = this.pageSize();

    if (size <= 0) {
      return this.sortedRows();
    }

    const start = (this.page() - 1) * size;

    return this.sortedRows().slice(start, start + size);
  });

  protected readonly columnCount = computed<number>(() => this.columns().length + (this.selectable() ? 1 : 0));

  private readonly pageKeys = computed<readonly string[]>(() => this.visibleRows().map((row, index) => this.keyOf(row, index)));
  protected readonly allOnPageSelected = computed<boolean>(
    () => this.pageKeys().length > 0 && this.pageKeys().every(key => this.selectedKeys().includes(key)),
  );
  protected readonly someOnPageSelected = computed<boolean>(
    () => !this.allOnPageSelected() && this.pageKeys().some(key => this.selectedKeys().includes(key)),
  );

  keyOf(row: DahcTableRow, index: number): string {
    const value = row[this.rowKey()];

    return value === undefined || value === null ? String(index) : String(value);
  }

  protected ariaSort(column: DahcTableColumn): string | null {
    const sort = this.sort();

    if (sort?.key === column.key) {
      return sort.order;
    }

    return column.sortable ? 'none' : null;
  }

  protected toggleSort(column: DahcTableColumn): void {
    const sort = this.sort();
    let next: DahcTableSort | null;

    if (sort?.key !== column.key) {
      next = { key: column.key, order: 'ascending' };
    } else if (sort.order === 'ascending') {
      next = { key: column.key, order: 'descending' };
    } else {
      next = null;
    }

    this.sort.set(next);
    this.page.set(1);
  }

  protected isSelected(key: string): boolean {
    return this.selectedKeys().includes(key);
  }

  protected toggleRow(key: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const keys = new Set(this.selectedKeys());

    if (checked) {
      keys.add(key);
    } else {
      keys.delete(key);
    }

    this.selectedKeys.set([...keys]);
  }

  protected toggleAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const keys = new Set(this.selectedKeys());

    for (const key of this.pageKeys()) {
      if (checked) {
        keys.add(key);
      } else {
        keys.delete(key);
      }
    }

    this.selectedKeys.set([...keys]);
  }

  protected cellText(row: DahcTableRow, column: DahcTableColumn): string {
    const value = row[column.key];

    return value === undefined || value === null || value === '' ? '—' : String(value);
  }
}
