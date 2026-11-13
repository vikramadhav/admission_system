import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { DahcIconComponent } from '../../core/icon/icon.component';
import { DahcDialogBase } from './dialog-base';

/** sm 388px (Figma compact), md 648px (Figma), lg 880px (DERIVED). */
export type DahcModalSize = 'sm' | 'md' | 'lg';

/**
 * Modal dialog for focused tasks and confirmations:
 *
 *   <dahc-modal heading="Discard draft?" [(open)]="discardOpen">
 *     <p>Your answers will be deleted.</p>
 *     <div dahcDialogFooter>…buttons…</div>
 *   </dahc-modal>
 *
 * Figma Content Components › Modal (50:17179): white, radius 20, 1px navy-100 border, Shadow 1,
 * 40px padding, title Bold 26/32, body navy-900 Regular 16/20, 36px round close button, optional
 * 52px featured icon ([dahcDialogIcon]). Footer layout and the large size are DERIVED.
 * Ported from dubai-health-ui (packages/components/src/modal/dh-modal.ts).
 */
@Component({
  selector: 'dahc-modal',
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcIconComponent],
  host: {
    '[class.dahc-modal--sm]': "size() === 'sm'",
    '[class.dahc-modal--lg]': "size() === 'lg'",
  },
})
export class DahcModalComponent extends DahcDialogBase {
  readonly size = input<DahcModalSize>('md');
}
