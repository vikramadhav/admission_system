import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { dahcUniqueId } from '../a11y/unique-id';

export type DahcCardVariant = 'default' | 'subtle';
export type DahcCardHeadingLevel = 2 | 3;

/**
 * Surface for one item or topic. When a heading is given the card is a labelled region
 * (an article named by its heading). Content marked card-aside sits beside the heading,
 * content marked card-footer sits below a divider.
 */
@Component({
  selector: 'dahc-card',
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': "'dahc-card dahc-card--' + variant()",
  },
})
export class DahcCardComponent {
  readonly variant = input<DahcCardVariant>('default');
  /** Small label above the heading, for example the name of the identifier shown as heading. */
  readonly eyebrow = input<string>('');
  readonly heading = input<string>('');
  readonly headingLevel = input<DahcCardHeadingLevel>(2);
  readonly subheading = input<string>('');

  protected readonly headingId = dahcUniqueId('dahc-card-heading');
}
