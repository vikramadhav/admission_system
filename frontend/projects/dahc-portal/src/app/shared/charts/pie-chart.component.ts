import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { ChartTableComponent } from './chart-table.component';
import { ChartDatum, ChartSeries, chartSeries } from './chart.models';

interface PieSlice {
  readonly datum: ChartDatum;
  readonly fill: string;
  readonly path: string;
  readonly label: string;
  /** A full circle is drawn as a circle, not an arc. */
  readonly full: boolean;
}

const RADIUS = 48;
const CENTRE = 50;

/**
 * Donut chart in SVG (GAP-03). Each slice is a focusable button (Enter or Space) named
 * "<slice>: <value> <unit>" that reports the datum for drill-down; a legend lists the slices with
 * their values, and a table alternative carries the same data. Used by the central monitoring
 * dashboard (US-2.1.4).
 */
@Component({
  selector: 'dahc-pie-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ChartTableComponent],
  styleUrl: './charts.scss',
  template: `
    <figure class="chart">
      <figcaption class="chart-caption">{{ caption() }}</figcaption>
      @if (slices().length === 0) {
        <p class="chart-empty">{{ emptyText() }}</p>
      } @else {
        <div class="pie">
          <svg class="pie-svg" viewBox="0 0 100 100" role="group" [attr.aria-label]="caption()">
            @for (slice of slices(); track slice.datum.seriesId) {
              @if (slice.full) {
                <circle
                  class="pie-slice"
                  stroke-width="0.6"
                  [attr.cx]="centre"
                  [attr.cy]="centre"
                  [attr.r]="radius"
                  [attr.fill]="slice.fill"
                  role="button"
                  tabindex="0"
                  [attr.aria-label]="slice.label"
                  (click)="segmentSelected.emit(slice.datum)"
                  (keydown.enter)="segmentSelected.emit(slice.datum)"
                  (keydown.space)="choose($event, slice.datum)" />
              } @else {
                <path
                  class="pie-slice"
                  stroke-width="0.6"
                  [attr.d]="slice.path"
                  [attr.fill]="slice.fill"
                  role="button"
                  tabindex="0"
                  [attr.aria-label]="slice.label"
                  (click)="segmentSelected.emit(slice.datum)"
                  (keydown.enter)="segmentSelected.emit(slice.datum)"
                  (keydown.space)="choose($event, slice.datum)" />
              }
            }
            <circle class="pie-hole" [attr.cx]="centre" [attr.cy]="centre" r="24" stroke-width="0.6" aria-hidden="true" />
            <text class="pie-total" [attr.x]="centre" [attr.y]="centre" text-anchor="middle" dominant-baseline="central" font-size="12" aria-hidden="true">{{ total() }}</text>
          </svg>
          <ul class="legend legend--stacked" [attr.aria-label]="legendLabel()">
            @for (series of series(); track series.id) {
              <li class="legend-item">
                <span class="legend-swatch" [style.background-color]="series.fill" aria-hidden="true"></span>
                @if (datumOf(series.id); as datum) {
                  <!-- PQ-43: a full-size target for every slice, however thin it is in the donut. -->
                  <button type="button" class="legend-button" (click)="segmentSelected.emit(datum)">{{ series.label }}: {{ valueOf(series.id) }}</button>
                } @else {
                  {{ series.label }}: {{ valueOf(series.id) }}
                }
              </li>
            }
          </ul>
        </div>
      }
      <dahc-chart-table [caption]="caption()" [categoryTitle]="categoryTitle()" [seriesTitle]="seriesTitle()" [valueTitle]="valueTitle()" [data]="data()" />
    </figure>
  `,
})
export class PieChartComponent {
  readonly caption = input.required<string>();
  readonly data = input.required<readonly ChartDatum[]>();
  readonly categoryTitle = input.required<string>();
  readonly seriesTitle = input.required<string>();
  readonly valueTitle = input.required<string>();
  readonly unit = input.required<string>();
  readonly emptyText = input<string>($localize`:@@portal.charts.empty:No data for the selected filters.`);
  readonly segmentSelected = output<ChartDatum>();

  protected readonly centre = CENTRE;
  protected readonly radius = RADIUS;
  protected readonly series = computed<readonly ChartSeries[]>(() => chartSeries(this.data().filter(datum => datum.value > 0)));
  protected readonly total = computed<number>(() => this.data().reduce((sum, datum) => sum + datum.value, 0));
  protected readonly legendLabel = computed<string>(() => $localize`:@@portal.charts.legend:Legend: ${this.seriesTitle()}:series:`);

  protected readonly slices = computed<readonly PieSlice[]>(() => {
    const items = this.data().filter(datum => datum.value > 0);
    const total = items.reduce((sum, datum) => sum + datum.value, 0);
    const fills = new Map(this.series().map(series => [series.id, series.fill]));
    let start = 0;

    return items.map(datum => {
      const angle = (datum.value / total) * Math.PI * 2;
      const slice: PieSlice = {
        datum,
        fill: fills.get(datum.seriesId) ?? '',
        path: arc(start, start + angle),
        label: `${datum.seriesLabel}: ${datum.value} ${this.unit()}`,
        full: items.length === 1,
      };
      start += angle;

      return slice;
    });
  });

  /** The drill-down datum of a series, when it has applications. */
  protected datumOf(seriesId: string): ChartDatum | null {
    return this.slices().find(slice => slice.datum.seriesId === seriesId)?.datum ?? null;
  }

  protected valueOf(seriesId: string): number {
    return this.data()
      .filter(datum => datum.seriesId === seriesId)
      .reduce((sum, datum) => sum + datum.value, 0);
  }

  protected choose(event: Event, datum: ChartDatum): void {
    event.preventDefault();
    this.segmentSelected.emit(datum);
  }
}

/** An SVG path for the slice between two angles (radians, clockwise from 12 o'clock). */
function arc(from: number, to: number): string {
  const point = (angle: number): string => `${(CENTRE + RADIUS * Math.sin(angle)).toFixed(3)} ${(CENTRE - RADIUS * Math.cos(angle)).toFixed(3)}`;
  const large = to - from > Math.PI ? 1 : 0;

  return `M ${CENTRE} ${CENTRE} L ${point(from)} A ${RADIUS} ${RADIUS} 0 ${large} 1 ${point(to)} Z`;
}
