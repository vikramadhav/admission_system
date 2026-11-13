import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { DahcFlexAlign, DahcFlexGap, DahcFlexJustify, dahcFlexClasses } from '../flex/flex.component';

/**
 * Consistent spacing between inline items (buttons, tags, links): like dahc-flex, but inline,
 * centred and with the small gap by default. `block` makes it take the full line.
 * Set `--dahc-space-gap` for any other length.
 * Ported from dubai-health-ui dh-space (layout/dh-layout.ts). DERIVED: DH spacing tokens.
 */
@Component({
  selector: 'dahc-space',
  template: '<ng-content />',
  styleUrls: ['../flex/flex-alignment.css', './space.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': "'dahc-space ' + classes()",
    '[class.dahc-space--block]': 'block()',
  },
})
export class DahcSpaceComponent {
  readonly vertical = input<boolean>(false);
  readonly wrap = input<boolean>(false);
  readonly gap = input<DahcFlexGap>('sm');
  readonly justify = input<DahcFlexJustify>('');
  readonly align = input<DahcFlexAlign>('center');
  readonly block = input<boolean>(false);

  protected classes(): string {
    return dahcFlexClasses(this.vertical(), this.wrap(), this.gap(), this.justify(), this.align());
  }
}
