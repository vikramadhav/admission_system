import { ChangeDetectionStrategy, Component, input, numberAttribute } from '@angular/core';

type ColValue = number | null;

const toColumns = (value: unknown): ColValue => (value === null || value === undefined || value === '' ? null : numberAttribute(value));

/**
 * A column in a dahc-row. `span` is out of 24 (0 hides the column). The responsive spans
 * xs to xxl apply from that breakpoint up (sm 576, md 768, lg 1024, xl 1280, xxl 1440), as do
 * `offset` and xsOffset to xxlOffset.
 * Ported from dubai-health-ui dh-col (layout/dh-layout.ts). DERIVED: 24-column grid.
 */
@Component({
  selector: 'dahc-col',
  template: '<ng-content />',
  styleUrl: './col.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'dahc-col',
    '[class.dahc-col--hidden]': 'span() === 0',
    '[style.--_s0]': 'span()',
    '[style.--_sxs]': 'xs()',
    '[style.--_ssm]': 'sm()',
    '[style.--_smd]': 'md()',
    '[style.--_slg]': 'lg()',
    '[style.--_sxl]': 'xl()',
    '[style.--_sxxl]': 'xxl()',
    '[style.--_o0]': 'offset()',
    '[style.--_oxs]': 'xsOffset()',
    '[style.--_osm]': 'smOffset()',
    '[style.--_omd]': 'mdOffset()',
    '[style.--_olg]': 'lgOffset()',
    '[style.--_oxl]': 'xlOffset()',
    '[style.--_oxxl]': 'xxlOffset()',
  },
})
export class DahcColComponent {
  /** Columns out of 24 at every width (24 when not set). */
  readonly span = input<ColValue, unknown>(null, { transform: toColumns });
  readonly offset = input<ColValue, unknown>(null, { transform: toColumns });
  readonly xs = input<ColValue, unknown>(null, { transform: toColumns });
  readonly sm = input<ColValue, unknown>(null, { transform: toColumns });
  readonly md = input<ColValue, unknown>(null, { transform: toColumns });
  readonly lg = input<ColValue, unknown>(null, { transform: toColumns });
  readonly xl = input<ColValue, unknown>(null, { transform: toColumns });
  readonly xxl = input<ColValue, unknown>(null, { transform: toColumns });
  readonly xsOffset = input<ColValue, unknown>(null, { transform: toColumns });
  readonly smOffset = input<ColValue, unknown>(null, { transform: toColumns });
  readonly mdOffset = input<ColValue, unknown>(null, { transform: toColumns });
  readonly lgOffset = input<ColValue, unknown>(null, { transform: toColumns });
  readonly xlOffset = input<ColValue, unknown>(null, { transform: toColumns });
  readonly xxlOffset = input<ColValue, unknown>(null, { transform: toColumns });
}
