import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { DahcIconComponent } from '../../core/icon/icon.component';

export type DahcStepStatus = 'wait' | 'process' | 'finish' | 'error';

export interface DahcStep {
  readonly heading: string;
  readonly description?: string;
  /** Overrides the status derived from current, for example 'error' for a step with problems. */
  readonly status?: DahcStepStatus;
}

interface StepView extends DahcStep {
  readonly status: DahcStepStatus;
  readonly number: number;
  readonly statusText: string;
}

/**
 * Progress through a sequence of steps; steps before current are finished.
 * <dahc-steps label="Application progress" [steps]="steps" [current]="2" direction="vertical" />
 * DERIVED design: DH has no stepper ("Service steps" content pattern only); the vertical form
 * follows the GME application progress list. 32px numbered circles, 2px connectors; current step
 * navy filled, finished navy ring with a tick, error red ring. Pending UX sign-off.
 * Nested GME sub-steps and clickable steps are not covered yet.
 * Ported from dubai-health-ui (packages/components/src/steps/dh-steps.ts).
 */
@Component({
  selector: 'dahc-steps',
  templateUrl: './steps.component.html',
  styleUrl: './steps.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcIconComponent],
  host: {
    '[class.dahc-steps--vertical]': "direction() === 'vertical'",
  },
})
export class DahcStepsComponent {
  /** Accessible name of the list. */
  readonly label = input.required<string>();
  readonly steps = input.required<readonly DahcStep[]>();
  /** Index of the current step, 0-based. */
  readonly current = input<number>(0);
  readonly direction = input<'horizontal' | 'vertical'>('horizontal');
  readonly statusLabels = input<Readonly<Record<DahcStepStatus, string>>>({
    wait: $localize`:@@dahcUi.steps.wait:Not started`,
    process: $localize`:@@dahcUi.steps.process:Current step`,
    finish: $localize`:@@dahcUi.steps.finish:Completed`,
    error: $localize`:@@dahcUi.steps.error:Needs attention`,
  });

  protected readonly views = computed<readonly StepView[]>(() =>
    this.steps().map((step, index) => {
      const derived: DahcStepStatus = index < this.current() ? 'finish' : index === this.current() ? 'process' : 'wait';
      const status = step.status ?? derived;

      return { ...step, status, number: index + 1, statusText: this.statusLabels()[status] };
    }),
  );
}
