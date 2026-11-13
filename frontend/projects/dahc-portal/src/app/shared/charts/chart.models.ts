/**
 * Data in and selection out for the portal charts (GAP-03: DAHC-UI has no charts). A datum is one
 * value of one series within one category; the chart reports the datum chosen for drill-down.
 */
export interface ChartDatum {
  /** Category on the axis (bar chart) or the chart itself (pie). */
  readonly categoryId: string;
  readonly categoryLabel: string;
  /** Series (bar segment colour) or pie slice. */
  readonly seriesId: string;
  readonly seriesLabel: string;
  readonly value: number;
}

/** Semantic tag fills cycled per series; text and edges use the strong border token. */
export const CHART_FILLS: readonly string[] = [
  'var(--dahc-color-tag-information)',
  'var(--dahc-color-tag-success)',
  'var(--dahc-color-tag-warning)',
  'var(--dahc-color-tag-informative-purple)',
  'var(--dahc-color-tag-in-progress)',
  'var(--dahc-color-tag-news)',
  'var(--dahc-color-tag-informative-blue)',
  'var(--dahc-color-tag-error)',
];

export interface ChartSeries {
  readonly id: string;
  readonly label: string;
  readonly fill: string;
}

/** The distinct series in first-seen order, each with its fill. */
export function chartSeries(data: readonly ChartDatum[]): readonly ChartSeries[] {
  const seen = new Map<string, ChartSeries>();

  for (const datum of data) {
    if (!seen.has(datum.seriesId)) {
      seen.set(datum.seriesId, { id: datum.seriesId, label: datum.seriesLabel, fill: CHART_FILLS[seen.size % CHART_FILLS.length] ?? CHART_FILLS[0] ?? '' });
    }
  }

  return [...seen.values()];
}
