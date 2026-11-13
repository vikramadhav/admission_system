import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { DahcIconComponent, DahcIconSize } from '../../core/icon/icon.component';
import { DahcIconName } from '../../core/icon/icon-names';

/** navy: Figma "Primary Navy"; blue: Figma "Secondary Blue" with the accessible link colour. */
export type DahcLinkVariant = 'navy' | 'blue';
export type DahcLinkSize = 'lg' | 'md' | 'sm';

const ICON_SIZES: Readonly<Record<DahcLinkSize, DahcIconSize>> = { lg: 'lg', md: 'md', sm: 'sm' };

/**
 * Text link on a real anchor: `<a dahc-link href="…">`. Works with routerLink too. A link that
 * opens a new tab (target="_blank") gets rel="noopener noreferrer" unless rel is set.
 * Figma Buttons › Type=3. Links (50:6786): Large 18/24 Bold (navy Large Medium 18/22), Medium
 * Bold 16/20, Small Regular 14/18; hover underlines (blue) or darkens (navy). Ported from
 * dubai-health-ui dh-link.
 */
@Component({
  selector: 'a[dahc-link]',
  templateUrl: './link.component.html',
  styleUrl: './link.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcIconComponent],
  host: {
    class: 'dahc-link',
    '[class.dahc-link--navy]': "variant() === 'navy'",
    '[class.dahc-link--blue]': "variant() === 'blue'",
    '[class.dahc-link--lg]': "size() === 'lg'",
    '[class.dahc-link--md]': "size() === 'md'",
    '[class.dahc-link--sm]': "size() === 'sm'",
    '[attr.target]': 'target() || null',
    '[attr.rel]': 'computedRel()',
  },
})
export class DahcLinkComponent {
  readonly variant = input<DahcLinkVariant>('blue');
  readonly size = input<DahcLinkSize>('md');
  readonly iconStart = input<DahcIconName | null>(null);
  readonly iconEnd = input<DahcIconName | null>(null);
  /** Browsing context, for example _blank. */
  readonly target = input<string>('');
  /** Link relationship; overrides the automatic noopener noreferrer for _blank. */
  readonly rel = input<string>('');

  protected readonly iconSize = computed<DahcIconSize>(() => ICON_SIZES[this.size()]);
  protected readonly computedRel = computed<string | null>(() => {
    if (this.rel() !== '') {
      return this.rel();
    }

    return this.target() === '_blank' ? 'noopener noreferrer' : null;
  });
}
