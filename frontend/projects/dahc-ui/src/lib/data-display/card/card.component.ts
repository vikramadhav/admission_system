import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { dahcUniqueId } from '../../core/a11y/unique-id';

/** default: GME panel; subtle: highlighted surface; actionable: DH Actionable card with hover lift. */
export type DahcCardVariant = 'default' | 'subtle' | 'actionable';
export type DahcCardHeadingLevel = 2 | 3;

/**
 * Surface for one item or topic. When a heading is given the card is a labelled region
 * (an article named by its heading). Content marked card-aside sits beside the heading,
 * content marked card-footer sits below a divider. With elevated the card floats on DH Shadow 3
 * instead of a border (dubai-health-ui dh-card elevated).
 */
@Component({
  selector: 'dahc-card',
  templateUrl: './card.component.html',
  styleUrl: './card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': "'dahc-card dahc-card--' + variant()",
    '[class.dahc-card--elevated]': 'elevated()',
  },
})
export class DahcCardComponent {
  readonly variant = input<DahcCardVariant>('default');
  /** Small label above the heading, for example the name of the identifier shown as heading. */
  readonly eyebrow = input<string>('');
  readonly heading = input<string>('');
  readonly headingLevel = input<DahcCardHeadingLevel>(2);
  readonly subheading = input<string>('');
  /** dh-card elevated: DH Shadow 3 instead of the border, on any variant. */
  readonly elevated = input<boolean>(false);

  protected readonly headingId = dahcUniqueId('dahc-card-heading');
}
