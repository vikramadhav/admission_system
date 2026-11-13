import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { DahcFlexAlign, DahcFlexGap, DahcFlexJustify, dahcFlexClasses } from '../flex/flex.component';

/**
 * A row of the 24-column responsive grid. Columns (dahc-col) wrap onto new lines. `gutter` is
 * the horizontal gap between columns and `verticalGutter` the gap between lines, from the DH
 * space scale (lg = 24px, the DH grid gutter).
 * Ported from dubai-health-ui dh-row (layout/dh-layout.ts). DERIVED: 24 columns, DH spacing.
 */
@Component({
  selector: 'dahc-row',
  template: '<ng-content />',
  styleUrls: ['../flex/flex-alignment.css', './row.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': "'dahc-row dahc-row--gutter-' + gutter() + ' dahc-row--vertical-gutter-' + verticalGutter() + ' ' + classes()",
  },
})
export class DahcRowComponent {
  readonly gutter = input<DahcFlexGap>('lg');
  readonly verticalGutter = input<DahcFlexGap>('none');
  readonly justify = input<DahcFlexJustify>('');
  readonly align = input<DahcFlexAlign>('');
  readonly wrap = input<boolean>(true);

  protected classes(): string {
    return dahcFlexClasses(false, this.wrap(), null, this.justify(), this.align());
  }
}
