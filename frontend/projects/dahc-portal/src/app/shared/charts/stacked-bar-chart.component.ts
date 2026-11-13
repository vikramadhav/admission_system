import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { ChartTableComponent } from './chart-table.component';
import { ChartDatum, ChartSeries, chartSeries } from './chart.models';

interface BarSegment {
  readonly datum: ChartDatum;
  readonly fill: string;
  /** Share of the tallest column, in percent. */
  readonly size: number;
  readonly label: string;
}

interface BarColumn {
  readonly id: string;
  readonly label: string;
  readonly total: number;
  readonly segments: readonly BarSegment[];
}

/**
 * Stacked column chart (GAP-03). Columns are laid out with flexbox, so they follow the reading
 * direction in RTL; each segment is a button named "<category>, <series>: <value> <unit>" that
 * reports the datum for drill-down. A legend and a table alternative carry the same data. Used by
 * the central monitoring dashboard (US-2.1.4).
 */
@Component({
  selector: 'dahc-stacked-bar-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ChartTableComponent],
  styleUrl: './charts.scss',
  template: `
    <figure class="chart">
      <figcaption class="chart-caption">{{ caption() }}</figcaption>
      @if (columns().length === 0) {
        <p class="chart-empty" i18n="@@portal.charts.empty">No data for the selected filters.</p>
      } @else {
        <div class="bars" role="group" [attr.aria-label]="caption()">
          @for (column of columns(); track column.id) {
            <div class="bar-column">
              <span class="bar-total">{{ column.total }}</span>
              <div class="bar-track">
                @for (segment of column.segments; track segment.datum.seriesId) {
                  <button
                    type="button"
                    class="bar-segment"
                    [style.block-size.%]="segment.size"
                    [style.background-color]="segment.fill"
                    [attr.aria-label]="segment.label"
                    [title]="segment.label"
                    (click)="segmentSelected.emit(segment.datum)"></button>
                }
              </div>
              <span class="bar-label">{{ column.label }}</span>
            </div>
          }
        </div>
        <ul class="legend" [attr.aria-label]="legendLabel()">
          @for (series of series(); track series.id) {
            <li class="legend-item"><span class="legend-swatch" [style.background-color]="series.fill" aria-hidden="true"></span>{{ series.label }}</li>
          }
        </ul>
      }
      <dahc-chart-table [caption]="caption()" [categoryTitle]="categoryTitle()" [seriesTitle]="seriesTitle()" [valueTitle]="valueTitle()" [data]="data()" />
    </figure>
  `,
})
export class StackedBarChartComponent {
  readonly caption = input.required<string>();
  readonly data = input.required<readonly ChartDatum[]>();
  /** Column headers of the table alternative and the unit of the segment names. */
  readonly categoryTitle = input.required<string>();
  readonly seriesTitle = input.required<string>();
  readonly valueTitle = input.required<string>();
  readonly unit = input.required<string>();
  readonly segmentSelected = output<ChartDatum>();

  protected readonly series = computed<readonly ChartSeries[]>(() => chartSeries(this.data()));
  protected readonly legendLabel = computed<string>(() => $localize`:@@portal.charts.legend:Legend: ${this.seriesTitle()}:series:`);

  protected readonly columns = computed<readonly BarColumn[]>(() => {
    const fills = new Map(this.series().map(series => [series.id, series.fill]));
    const byCategory = new Map<string, ChartDatum[]>();

    for (const datum of this.data()) {
      if (datum.value > 0) {
        byCategory.set(datum.categoryId, [...(byCategory.get(datum.categoryId) ?? []), datum]);
      }
    }

    const totals = [...byCategory.values()].map(items => items.reduce((sum, item) => sum + item.value, 0));
    const max = Math.max(1, ...totals);

    return [...byCategory.entries()].map(([id, items]) => ({
      id,
      label: items[0]?.categoryLabel ?? id,
      total: items.reduce((sum, item) => sum + item.value, 0),
      segments: items.map(datum => ({
        datum,
        fill: fills.get(datum.seriesId) ?? '',
        size: (datum.value / max) * 100,
        label: `${datum.categoryLabel}, ${datum.seriesLabel}: ${datum.value} ${this.unit()}`,
      })),
    }));
  });
}
