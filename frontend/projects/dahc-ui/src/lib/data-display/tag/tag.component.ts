import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { DahcIconComponent } from '../../core/icon/icon.component';
import { DahcIconName } from '../../core/icon/icon-names';

/** Figma "Purpose" of Informational tags 50:7426. */
export type DahcTagPurpose =
  | 'information'
  | 'in-progress'
  | 'warning'
  | 'error'
  | 'success'
  | 'news'
  | 'informative-blue'
  | 'informative-purple';

/** Figma "Style": solid fill, or a light fill with a 2px border (designed for Large). */
export type DahcTagAppearance = 'solid' | 'outline';

/** Figma "Size": lg Large 36px, md Medium 30px. */
export type DahcTagSize = 'lg' | 'md';

/**
 * Informational tag: a non-interactive label for a status or category ("Draft", "Submitted").
 * The text must state the status; colour only reinforces it.
 * Figma Chips and Tags › Informational tags 50:7426: padding 6/12, gap 8, radius 8, 20px icons,
 * text navy. Large Bold 18/22 uppercase (Informative Blue / Purple: Regular 16/20); Medium Regular
 * 14/18. Outline: hue at 24-36% with a 2px hue border. News uses pink at 24%.
 * Ported from dubai-health-ui (packages/components/src/tag/dh-tag.ts).
 */
@Component({
  selector: 'dahc-tag',
  templateUrl: './tag.component.html',
  styleUrl: './tag.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcIconComponent],
  host: {
    '[class]': 'hostClass()',
  },
})
export class DahcTagComponent {
  readonly purpose = input<DahcTagPurpose>('information');
  readonly appearance = input<DahcTagAppearance>('solid');
  readonly size = input<DahcTagSize>('md');
  readonly iconStart = input<DahcIconName | null>(null);
  readonly iconEnd = input<DahcIconName | null>(null);

  protected readonly hostClass = computed<string>(
    () => `dahc-tag dahc-tag--${this.purpose()} dahc-tag--${this.appearance()} dahc-tag--${this.size()}`,
  );
}
