import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  DahcButtonComponent,
  DahcCardComponent,
  DahcStepHeaderComponent,
  DahcWizardActionBarComponent,
  DahcWizardStep,
  DahcWizardStepsComponent,
} from 'dahc-ui';

import { DocExampleComponent, EventLogComponent, InspectorToggleComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

const STEP_IDS = ['program', 'application', 'personal', 'grades', 'english', 'portfolio', 'pay'] as const;
const STEP_LABELS: Readonly<Record<(typeof STEP_IDS)[number], string>> = {
  program: 'Program and preferences',
  application: 'Application information',
  personal: 'Personal information',
  grades: 'University grades',
  english: 'English proficiency',
  portfolio: 'Portfolio',
  pay: 'Pay and submit',
};

@Component({
  selector: 'dahc-wizard-page',
  templateUrl: './wizard-page.component.html',
  styles: '.wizard { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--dahc-space-6); } @media (min-width: 64rem) { .wizard { grid-template-columns: 18.75rem minmax(0, 1fr); } }',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcButtonComponent,
    DahcCardComponent,
    DahcStepHeaderComponent,
    DahcWizardActionBarComponent,
    DahcWizardStepsComponent,
    DocExampleComponent,
    EventLogComponent,
    InspectorToggleComponent,
    PlaygroundPageComponent,
  ],
})
export class WizardPageComponent {
  protected readonly whenToUse = [
    'Long forms split into steps, such as the GME application.',
    'Let users go back to completed steps from the stepper; upcoming steps are not links.',
    'Mark a step with error when it has problems, so users find them before submitting.',
    'Keep the action bar sticky so Save and Next stay in reach.',
  ];

  protected readonly sourceFiles = [
    'navigation/wizard/wizard-steps.component.ts',
    'navigation/wizard/wizard-steps.component.html',
    'navigation/wizard/wizard-steps.component.css',
    'navigation/wizard/step-header.component.ts',
    'navigation/wizard/wizard-action-bar.component.ts',
  ];

  protected readonly current = signal<number>(2);
  protected readonly gradesError = signal<boolean>(false);
  protected readonly events = signal<readonly string[]>([]);
  protected readonly total = STEP_IDS.length;

  protected readonly steps = computed<readonly DahcWizardStep[]>(() =>
    STEP_IDS.map((id, index) => ({
      id,
      label: STEP_LABELS[id],
      status:
        id === 'grades' && this.gradesError() && index !== this.current()
          ? 'error'
          : index < this.current()
            ? 'complete'
            : index === this.current()
              ? 'current'
              : 'upcoming',
      substeps:
        id === 'personal'
          ? [
              { id: 'personal-details', label: 'Personal details', status: 'complete' },
              { id: 'contact', label: 'Contact information', status: 'current' },
              { id: 'next-of-kin', label: 'Next of kin', status: 'upcoming' },
              { id: 'attachments', label: 'Identification attachments', status: 'upcoming' },
            ]
          : [],
    })),
  );

  protected readonly heading = computed<string>(() => STEP_LABELS[STEP_IDS[this.current()] ?? 'program']);

  protected select(id: string): void {
    this.events.update(events => [`stepSelected (${id})`, ...events]);
    const index = STEP_IDS.indexOf(id as (typeof STEP_IDS)[number]);

    if (index >= 0) {
      this.current.set(index);
    }
  }

  protected move(offset: number): void {
    this.current.update(current => Math.min(this.total - 1, Math.max(0, current + offset)));
  }
}
