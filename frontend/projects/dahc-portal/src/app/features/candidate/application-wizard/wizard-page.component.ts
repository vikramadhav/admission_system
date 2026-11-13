import { ChangeDetectionStrategy, Component, LOCALE_ID, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  DahcAlertComponent,
  DahcButtonComponent,
  DahcCardComponent,
  DahcNavLink,
  DahcPageHeaderComponent,
  DahcPageHeaderMeta,
  DahcStepHeaderComponent,
  DahcTagComponent,
  DahcWizardActionBarComponent,
  DahcWizardStepsComponent,
} from 'dahc-ui';

import { SessionService } from '../../../core/auth/session.service';
import { formatDahcDateTime } from '../../../core/locale/date-time.pipe';
import { ApplicationStatusDisplay, applicationStatusDisplay } from '../../../shared/application-status';
import { WizardStepId, groupLabel, stepGroup, stepLabel } from '../../../shared/program-rules';
import { DiscardDraftDialogComponent } from '../actions/discard-draft-dialog.component';
import { ApplicationInformationStepComponent } from './steps/application-information/application-information-step.component';
import { AcademicStepComponent } from './steps/academic/academic-step.component';
import { BoardLicenseStepComponent } from './steps/board-license/board-license-step.component';
import { EnglishStepComponent } from './steps/english/english-step.component';
import { EntranceExamStepComponent } from './steps/entrance-exam/entrance-exam-step.component';
import { InternshipStepComponent } from './steps/internship/internship-step.component';
import { PayAndSubmitStepComponent } from './steps/pay-and-submit/pay-and-submit-step.component';
import { ContactStepComponent } from './steps/personal/contact-step.component';
import { IdentityStepComponent } from './steps/personal/identity-step.component';
import { NextOfKinStepComponent } from './steps/personal/next-of-kin-step.component';
import { PersonalAttachmentsStepComponent } from './steps/personal/personal-attachments-step.component';
import { PortfolioStepComponent } from './steps/portfolio/portfolio-step.component';
import { ProgramStepComponent } from './steps/program/program-step.component';
import { ResidencyStepComponent } from './steps/residency/residency-step.component';
import { WizardStateService } from './wizard-state.service';

/**
 * The application wizard (Figma 1:2189 to 1:5621): banner with breadcrumb, meta row and status,
 * the stepper card, the current step in the form card, and the sticky action bar. Drafts open in
 * edit mode; any other status opens read-only (view application, US-1.2.2).
 */
@Component({
  selector: 'dahc-wizard-page',
  templateUrl: './wizard-page.component.html',
  styleUrl: './wizard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [WizardStateService],
  imports: [
    AcademicStepComponent,
    ApplicationInformationStepComponent,
    BoardLicenseStepComponent,
    ContactStepComponent,
    DahcAlertComponent,
    DahcButtonComponent,
    DahcCardComponent,
    DahcPageHeaderComponent,
    DahcStepHeaderComponent,
    DahcTagComponent,
    DahcWizardActionBarComponent,
    DahcWizardStepsComponent,
    DiscardDraftDialogComponent,
    EnglishStepComponent,
    EntranceExamStepComponent,
    IdentityStepComponent,
    InternshipStepComponent,
    NextOfKinStepComponent,
    PayAndSubmitStepComponent,
    PersonalAttachmentsStepComponent,
    PortfolioStepComponent,
    ProgramStepComponent,
    ResidencyStepComponent,
    RouterLink,
  ],
})
export class WizardPageComponent {
  private readonly router = inject(Router);
  private readonly locale = inject(LOCALE_ID);
  private readonly timeZoneId = inject(SessionService).timeZoneId;

  protected readonly state = inject(WizardStateService);

  /** Route parameters and data (component input binding). */
  readonly applicationId = input<string>('');
  readonly stepId = input<string>('program');
  readonly create = input<boolean>(false);

  protected readonly discardOpen = signal<boolean>(false);

  protected readonly heading = computed<string>(() => {
    const program = this.state.program();

    return program
      ? $localize`:@@portal.wizard.headingProgram:${program.name}:program: application`
      : $localize`:@@portal.wizard.headingNew:New application`;
  });

  protected readonly breadcrumbs = computed<readonly DahcNavLink[]>(() => [
    { label: $localize`:@@portal.nav.home:Home`, route: '/candidate/dashboard' },
    { label: $localize`:@@portal.nav.applications:My applications`, route: '/candidate/applications' },
    { label: this.state.application()?.applicationNumber ?? $localize`:@@portal.wizard.newApplication:New Application` },
  ]);

  protected readonly meta = computed<readonly DahcPageHeaderMeta[]>(() => {
    const application = this.state.application();

    if (!application) {
      return [];
    }

    const opens = application.program.applicationOpensAt;
    const year = opens ? new Date(opens).getUTCFullYear() : null;
    const items: DahcPageHeaderMeta[] = [
      { label: $localize`:@@portal.wizard.metaId:Application ID`, value: application.applicationNumber },
    ];

    if (year !== null) {
      // The contract has no cycle name (OQ-24); the cycle is shown as the opening year and the next.
      items.push({ label: $localize`:@@portal.wizard.metaCycle:Admission Cycle`, value: `${year}-${year + 1}` });
    }

    items.push({
      label: $localize`:@@portal.wizard.metaCreated:Created On`,
      value: formatDahcDateTime(application.createdAt, this.locale, this.timeZoneId(), 'date'),
    });

    return items;
  });

  protected readonly status = computed<ApplicationStatusDisplay | null>(() => {
    const application = this.state.application();

    return application ? applicationStatusDisplay(application.status) : null;
  });

  protected readonly current = computed<WizardStepId>(() => this.state.currentStep());
  protected readonly stepHeading = computed<string>(() => groupLabel(stepGroup(this.current())));
  protected readonly stepNumber = computed<number>(() => this.state.groupIndex() + 1);
  protected readonly stepTotal = computed<number>(() => this.state.groups().length);

  protected readonly nextLabel = computed<string>(() => {
    const next = this.state.nextStep();

    if (this.state.mode() === 'create') {
      return $localize`:@@portal.wizard.nextApplicationInformation:Next: ${stepLabel('application-information')}:step:`;
    }

    return next ? $localize`:@@portal.wizard.next:Next: ${stepLabel(next)}:step:` : '';
  });

  constructor() {
    effect(() => {
      const create = this.create();
      const applicationId = this.applicationId();
      const stepId = this.stepId();

      untracked(() => void this.open(create, applicationId, stepId));
    });
  }

  private async open(create: boolean, applicationId: string, stepId: string): Promise<void> {
    if (create) {
      this.state.startNew();

      return;
    }

    await this.state.load(applicationId);

    if (!this.state.application()) {
      return;
    }

    const steps = this.state.steps();
    const step = steps.includes(stepId as WizardStepId) ? (stepId as WizardStepId) : steps[0];

    if (step && step !== stepId) {
      await this.router.navigate(['/candidate/applications', applicationId, 'steps', step], { replaceUrl: true });

      return;
    }

    this.state.setCurrentStep(step ?? 'program');
  }

  protected async discarded(): Promise<void> {
    this.discardOpen.set(false);
    await this.router.navigate(['/candidate/dashboard']);
  }
}
