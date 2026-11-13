import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { DahcButtonComponent, DahcTableColumn, DahcTableComponent, DahcTableRow } from 'dahc-ui';

import { ChartDatum } from './chart.models';

/**
 * The data-table alternative of a chart, shown with a toggle (WCAG 1.1.1: the same information
 * without relying on shapes or colour).
 */
@Component({
  selector: 'dahc-chart-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcButtonComponent, DahcTableComponent],
  styles: `
    :host { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--dahc-space-2); justify-items: start; }
    dahc-table { justify-self: stretch; }
  `,
  template: `
    <button dahc-button type="button" variant="link" size="sm" [attr.aria-expanded]="open()" (click)="open.set(!open())">
      @if (open()) {
        <ng-container i18n="@@portal.charts.hideTable">Hide table</ng-container>
      } @else {
        <ng-container i18n="@@portal.charts.showTable">Show as table</ng-container>
      }
    </button>
    @if (open()) {
      <dahc-table [caption]="caption()" [columns]="columns()" [rows]="rows()" scrollX="360px" />
    }
  `,
})
export class ChartTableComponent {
  readonly caption = input.required<string>();
  readonly categoryTitle = input.required<string>();
  readonly seriesTitle = input.required<string>();
  readonly valueTitle = input.required<string>();
  readonly data = input.required<readonly ChartDatum[]>();

  protected readonly open = signal<boolean>(false);

  protected readonly columns = computed<readonly DahcTableColumn[]>(() => [
    { key: 'category', title: this.categoryTitle() },
    { key: 'series', title: this.seriesTitle() },
    { key: 'value', title: this.valueTitle(), align: 'end' },
  ]);

  protected readonly rows = computed<readonly DahcTableRow[]>(() =>
    this.data().map(datum => ({ id: `${datum.categoryId}|${datum.seriesId}`, category: datum.categoryLabel, series: datum.seriesLabel, value: datum.value })),
  );
}
