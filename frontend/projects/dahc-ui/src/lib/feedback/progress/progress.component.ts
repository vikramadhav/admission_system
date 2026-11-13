import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type DahcProgressType = 'line' | 'circle';
export type DahcProgressSize = 'sm' | 'md' | 'lg';
export type DahcProgressStatus = 'normal' | 'success' | 'error';

/** Circle geometry in viewBox units (0 0 36 36): radius 15.5 leaves room for the 3-unit stroke. */
const RADIUS = 15.5;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Progress of a known amount of work: a bar (line) or a ring (circle) with an optional percentage.
 * role="progressbar" with aria-valuemin, aria-valuemax and aria-valuenow; the label is the
 * accessible name. DERIVED design (UDD-019): navy fill on a navy-100 track, 8px bar; status
 * colours for success and error. Ported from dubai-health-ui dh-progress (feedback/dh-feedback.ts);
 * the circle type and status are DAHC additions.
 */
@Component({
  selector: 'dahc-progress',
  templateUrl: './progress.component.html',
  styleUrl: './progress.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.dahc-progress--circle]': "type() === 'circle'",
    '[class.dahc-progress--sm]': "size() === 'sm'",
    '[class.dahc-progress--lg]': "size() === 'lg'",
    '[class.dahc-progress--success]': "status() === 'success'",
    '[class.dahc-progress--error]': "status() === 'error'",
  },
})
export class DahcProgressComponent {
  readonly value = input<number>(0);
  readonly max = input<number>(100);
  /** Accessible name, for example "Application progress". */
  readonly label = input<string>($localize`:@@dahcUi.progress.label:Progress`);
  readonly showValue = input<boolean>(false);
  readonly type = input<DahcProgressType>('line');
  /** Circle diameter: sm 48px, md 80px, lg 120px. */
  readonly size = input<DahcProgressSize>('md');
  readonly status = input<DahcProgressStatus>('normal');

  protected readonly percent = computed<number>(() =>
    Math.max(0, Math.min(100, (this.value() / Math.max(1, this.max())) * 100)),
  );
  protected readonly rounded = computed<number>(() => Math.round(this.percent()));
  protected readonly radius = RADIUS;
  protected readonly circumference = CIRCUMFERENCE;
  protected readonly dashOffset = computed<number>(() => CIRCUMFERENCE * (1 - this.percent() / 100));
}
