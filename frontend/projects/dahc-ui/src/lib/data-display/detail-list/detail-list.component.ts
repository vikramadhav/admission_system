import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** One label and value pair; the value is already formatted for display. */
export interface DahcDetailItem {
  readonly label: string;
  readonly value: string;
}

export type DahcDetailListColumns = 1 | 2 | 3;
export type DahcDetailListHeadingLevel = 2 | 3 | 4;

/**
 * Read-only label and value pairs as a description list, in up to three columns on wide screens.
 * Pairs come from `items`, or are projected as `<div dahc-detail-item label="…">value</div>` for
 * rich values. With `bordered` the list is a framed grid with a line under every pair and the DH
 * descriptions look (label 14 hint, value Bold 16); without it the GME key/value grid is kept.
 * Ported from dubai-health-ui dh-descriptions (heading, bordered, projected items).
 */
@Component({
  selector: 'dahc-detail-list',
  templateUrl: './detail-list.component.html',
  styleUrl: './detail-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': "'dahc-detail-list dahc-detail-list--columns-' + columns()",
    '[class.dahc-detail-list--bordered]': 'bordered()',
  },
})
export class DahcDetailListComponent {
  readonly items = input<readonly DahcDetailItem[]>([]);
  readonly columns = input<DahcDetailListColumns>(3);
  /** Shown for an empty value so the row never reads as missing. */
  readonly emptyValue = input<string>($localize`:@@dahcUi.detailList.empty:Not available`);
  /** Optional title above the list (dh-descriptions heading). */
  readonly heading = input<string>('');
  readonly headingLevel = input<DahcDetailListHeadingLevel>(3);
  /** Framed grid with a line under every pair (dh-descriptions bordered). */
  readonly bordered = input<boolean>(false);
}

/**
 * One projected pair of a `dahc-detail-list`: the host is the `div` that groups the `dt` and `dd`
 * (the only wrapper a description list allows); the value is the projected content.
 */
@Component({
  selector: 'div[dahc-detail-item]',
  template: `<dt class="dahc-detail-item__label">{{ label() }}</dt>
    <dd class="dahc-detail-item__value"><ng-content /></dd>`,
  styleUrl: './detail-item.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'dahc-detail-item',
  },
})
export class DahcDetailItemComponent {
  readonly label = input.required<string>();
}
