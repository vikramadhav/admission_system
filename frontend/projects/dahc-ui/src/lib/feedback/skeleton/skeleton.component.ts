import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Placeholder shapes while content loads. The shapes are hidden from assistive technology; a
 * visually hidden role="status" text says what is loading. The shimmer stops under reduced motion.
 * DERIVED design (UDD-019): navy-100 blocks with a subtle shimmer; the last line is 60% wide.
 * Ported from dubai-health-ui dh-skeleton (feedback/dh-feedback.ts).
 */
@Component({
  selector: 'dahc-skeleton',
  template: `
    <div class="dahc-skeleton" aria-hidden="true">
      @if (avatar()) {
        <span class="dahc-skeleton__block dahc-skeleton__avatar"></span>
      }
      <div class="dahc-skeleton__lines">
        @if (heading()) {
          <span class="dahc-skeleton__block dahc-skeleton__line dahc-skeleton__heading"></span>
        }
        @for (row of rowList(); track row) {
          <span class="dahc-skeleton__block dahc-skeleton__line" [class.dahc-skeleton__line--last]="$last"></span>
        }
      </div>
    </div>
    <span class="dahc-visually-hidden" role="status">{{ label() }}</span>
  `,
  styleUrl: './skeleton.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'aria-busy': 'true',
  },
})
export class DahcSkeletonComponent {
  /** Number of text lines under the heading. */
  readonly rows = input<number>(3);
  /** Shows a round avatar placeholder. */
  readonly avatar = input<boolean>(false);
  /** Shows a heading bar. */
  readonly heading = input<boolean>(true);
  /** Announced while the placeholder is shown. */
  readonly label = input<string>($localize`:@@dahcUi.skeleton.label:Loading content`);

  protected readonly rowList = computed<readonly number[]>(() =>
    Array.from({ length: Math.max(0, Math.floor(this.rows())) }, (_, index) => index),
  );
}
