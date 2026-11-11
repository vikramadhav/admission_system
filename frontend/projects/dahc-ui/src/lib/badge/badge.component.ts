import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type DahcBadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

/** Short status label. The text carries the meaning; the tone only reinforces it. */
@Component({
  selector: 'dahc-badge',
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': "'dahc-badge dahc-badge--' + tone()",
  },
})
export class DahcBadgeComponent {
  readonly tone = input<DahcBadgeTone>('neutral');
}
