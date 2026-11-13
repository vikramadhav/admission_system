import { ChangeDetectionStrategy, Component, LOCALE_ID, computed, inject, input } from '@angular/core';

export type DahcStatisticSize = 'md' | 'lg';

/**
 * A highlighted number with its label in the DH "Stats" text style (Bold, uppercase; md = mobile
 * 36/36, lg = web 60/80), as in the "Care in Numbers" pattern (Figma frame 50:2249). Numbers are
 * formatted for the locale; prefix and suffix ("AED", "+", "%") frame the value. For coloured
 * score tiles use dahc-stat-tile.
 * Ported from dubai-health-ui dh-statistic.
 */
@Component({
  selector: 'dahc-statistic',
  styleUrl: './statistic.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': "'dahc-statistic dahc-statistic--' + size()",
  },
  template: `
    <p class="dahc-statistic__value">
      {{ prefix() }}{{ display() }}
      @if (suffix() !== '') {
        <span class="dahc-statistic__suffix">{{ suffix() }}</span>
      }
    </p>
    <p class="dahc-statistic__label">{{ label() }}</p>
  `,
})
export class DahcStatisticComponent {
  private readonly locale = inject(LOCALE_ID);

  readonly label = input.required<string>();
  /** A number is formatted for the locale; other text is shown as given. */
  readonly value = input<string | number>('');
  readonly prefix = input<string>('');
  readonly suffix = input<string>('');
  readonly size = input<DahcStatisticSize>('md');

  protected readonly display = computed<string>(() => {
    const value = this.value();
    const number = typeof value === 'number' ? value : Number(value);

    return value !== '' && !Number.isNaN(number) ? new Intl.NumberFormat(this.locale).format(number) : String(value);
  });
}
