import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** alert: the GME notification badge (red); primary: navy, for neutral counts. */
export type DahcBadgeTone = 'alert' | 'primary';

/**
 * Small count or dot that marks something new, for example unread notifications on a header icon
 * button. For a status label ("Draft", "Submitted") use dahc-tag instead.
 * The visible number is hidden from screen readers; the label says what it counts:
 * <dahc-badge [count]="3" label="3 unread notifications" />
 * GME header notification badge (GME 1:2189): 16px red pill with Bold 10 dark text; red and navy
 * text pass AA (Informational tag Error hue). Dot and primary tone are DERIVED.
 */
@Component({
  selector: 'dahc-badge',
  template: `
    @if (!dot()) {
      <span aria-hidden="true">{{ text() }}</span>
    }
    <span class="dahc-visually-hidden">{{ label() }}</span>
  `,
  styleUrl: './badge.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'dahc-badge',
    '[class.dahc-badge--primary]': "tone() === 'primary'",
    '[class.dahc-badge--dot]': 'dot()',
    '[hidden]': '!dot() && count() <= 0',
  },
})
export class DahcBadgeComponent {
  /** The number shown; the badge is hidden at 0 unless it is a dot. */
  readonly count = input<number>(0);
  /** Larger counts show as "99+". */
  readonly max = input<number>(99);
  /** Shows a dot without a number. */
  readonly dot = input<boolean>(false);
  /** What the badge means, for screen readers: "3 unread notifications". */
  readonly label = input.required<string>();
  readonly tone = input<DahcBadgeTone>('alert');

  protected readonly text = computed<string>(() => (this.count() > this.max() ? `${this.max()}+` : String(this.count())));
}
