import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { DahcIconComponent } from '../../core/icon/icon.component';

export type DahcWizardStepStatus = 'complete' | 'current' | 'upcoming' | 'error';

export interface DahcWizardSubstep {
  readonly id: string;
  readonly label: string;
  readonly status: DahcWizardStepStatus;
}

export interface DahcWizardStep {
  readonly id: string;
  readonly label: string;
  readonly status: DahcWizardStepStatus;
  /** Sub-steps shown under the step while it is current (GME Personal information). */
  readonly substeps?: readonly DahcWizardSubstep[];
}

/**
 * Vertical list of the steps of a long form (GME application wizard). Complete, current and
 * error steps are buttons that emit stepSelected so the user can go back; upcoming steps are text.
 * The current step's sub-steps are listed under it.
 * GME wizard stepper (stepper card 300px, GME 1:2189): 32px numbered circles; complete navy filled
 * with a tick, current on a blue-200 row with a navy ring, upcoming navy-400 ring; current
 * sub-step in blue (A11y fix: link blue #037BC5 instead of #32AFFC). The error state is DERIVED
 * (Figma shows none). DH has no equivalent component.
 */
@Component({
  selector: 'dahc-wizard-steps',
  templateUrl: './wizard-steps.component.html',
  styleUrl: './wizard-steps.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcIconComponent],
})
export class DahcWizardStepsComponent {
  readonly steps = input.required<readonly DahcWizardStep[]>();
  readonly label = input<string>($localize`:@@dahcUi.wizard.steps:Application steps`);
  readonly statusLabels = input<Readonly<Record<DahcWizardStepStatus, string>>>({
    complete: $localize`:@@dahcUi.wizard.complete:Completed`,
    current: $localize`:@@dahcUi.wizard.current:Current step`,
    upcoming: $localize`:@@dahcUi.wizard.upcoming:Not started`,
    error: $localize`:@@dahcUi.wizard.error:Needs attention`,
  });
  /** Emits the id of the step or sub-step the user chose. */
  readonly stepSelected = output<string>();

  protected isNavigable(status: DahcWizardStepStatus): boolean {
    return status !== 'upcoming';
  }
}
