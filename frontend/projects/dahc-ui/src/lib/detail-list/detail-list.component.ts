import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** One label and value pair; the value is already formatted for display. */
export interface DahcDetailItem {
  readonly label: string;
  readonly value: string;
}

export type DahcDetailListColumns = 1 | 2 | 3;

/** Read-only label and value pairs as a description list, in up to three columns on wide screens. */
@Component({
  selector: 'dahc-detail-list',
  templateUrl: './detail-list.component.html',
  styleUrl: './detail-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': "'dahc-detail-list dahc-detail-list--columns-' + columns()",
  },
})
export class DahcDetailListComponent {
  readonly items = input<readonly DahcDetailItem[]>([]);
  readonly columns = input<DahcDetailListColumns>(3);
  /** Shown for an empty value so the row never reads as missing. */
  readonly emptyValue = input<string>($localize`:@@dahcUi.detailList.empty:Not available`);
}
