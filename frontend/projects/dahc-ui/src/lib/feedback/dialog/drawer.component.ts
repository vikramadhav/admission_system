import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { DahcIconComponent } from '../../core/icon/icon.component';
import { DahcDialogBase } from './dialog-base';

/** The edge the drawer opens from, in the reading direction. */
export type DahcDrawerPlacement = 'start' | 'end';

/** sm 365px (DH Hamburger Menu overlay), md 480px. */
export type DahcDrawerSize = 'sm' | 'md';

/**
 * Panel that slides in from the edge of the screen, for filters, details or a short form.
 * DERIVED design: DH has no drawer; styled from the Hamburger Menu overlay (50:10087) and the
 * Modal (50:17179). Pending UX sign-off. Ported from dubai-health-ui (drawer/dh-drawer.ts).
 */
@Component({
  selector: 'dahc-drawer',
  templateUrl: './drawer.component.html',
  styleUrl: './drawer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcIconComponent],
  host: {
    '[class.dahc-drawer--start]': "placement() === 'start'",
    '[class.dahc-drawer--sm]': "size() === 'sm'",
  },
})
export class DahcDrawerComponent extends DahcDialogBase {
  readonly placement = input<DahcDrawerPlacement>('end');
  readonly size = input<DahcDrawerSize>('md');
}
