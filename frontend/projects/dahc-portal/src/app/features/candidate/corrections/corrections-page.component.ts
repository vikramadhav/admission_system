import { ChangeDetectionStrategy, Component, ElementRef, Injector, LOCALE_ID, afterNextRender, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DahcAlertComponent, DahcButtonComponent, DahcEmptyStateComponent, DahcModalComponent, DahcPageHeaderComponent, DahcToastService } from 'dahc-ui';
import { firstValueFrom } from 'rxjs';

import { CorrectionFlag } from '../../../api/admission.models';
import { ApplicationsApiService } from '../../../api/applications-api.service';
import { ApplicationSectionKey } from '../../../api/candidate-lifecycle.models';
import { isApiProblemError } from '../../../core/api/api-problem-error';
import { callerHandlesProblems } from '../../../core/api/api-request';
import { SessionService } from '../../../core/auth/session.service';
import { DahcHasUnsavedChanges } from '../../../core/auth/unsaved-changes.guard';
import { formatDahcDateTime } from '../../../core/locale/date-time.pipe';
import { WizardStepId, stepLabel } from '../../../shared/program-rules';
import { actionProblemText } from '../actions/action-support';
import { AcademicStepComponent } from '../application-wizard/steps/academic/academic-step.component';
import { ApplicationInformationStepComponent } from '../application-wizard/steps/application-information/application-information-step.component';
import { BoardLicenseStepComponent } from '../application-wizard/steps/board-license/board-license-step.component';
import { EnglishStepComponent } from '../application-wizard/steps/english/english-step.component';
import { EntranceExamStepComponent } from '../application-wizard/steps/entrance-exam/entrance-exam-step.component';
import { InternshipStepComponent } from '../application-wizard/steps/internship/internship-step.component';
import { ContactStepComponent } from '../application-wizard/steps/personal/contact-step.component';
import { IdentityStepComponent } from '../application-wizard/steps/personal/identity-step.component';
import { NextOfKinStepComponent } from '../application-wizard/steps/personal/next-of-kin-step.component';
import { PersonalAttachmentsStepComponent } from '../application-wizard/steps/personal/personal-attachments-step.component';
import { ResidencyStepComponent } from '../application-wizard/steps/residency/residency-step.component';
import { WizardStateService } from '../application-wizard/wizard-state.service';
import { correctionFieldLabel } from './correction-field-labels';

/** A flag as the candidate reads it: what is flagged and the officer's note. */
interface CorrectionNote {
  readonly id: string;
  readonly label: string;
  readonly note: string;
}

/** One wizard page with flagged items, shown with its notes above the page's form. */
interface CorrectionBlock {
  readonly step: WizardStepId;
  readonly section: ApplicationSectionKey;
  readonly heading: string;
  readonly notes: readonly CorrectionNote[];
}

const PERSONAL_STEP_BY_GROUP: Readonly<Record<string, WizardStepId>> = {
  identity: 'personal-identity',
  contact: 'personal-contact',
  nextOfKin: 'personal-next-of-kin',
};

/**
 * Corrections after an officer returned the application (US-2.3.4). The wizard's own step pages
 * are reused in correction mode: only the flagged fields and documents can be changed, everything
 * else stays as submitted, and the officer's note is shown above each flagged page. Re-submitting
 * runs the submission validation on the flagged pages, then sends the flagged sections to the same
 * officer. The flags come from GET .../correction-flags, a PROPOSAL until the contract has a
 * candidate read (PQ-04).
 */
@Component({
  selector: 'dahc-corrections-page',
  templateUrl: './corrections-page.component.html',
  styleUrl: './corrections-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [WizardStateService],
  imports: [
    AcademicStepComponent,
    ApplicationInformationStepComponent,
    BoardLicenseStepComponent,
    ContactStepComponent,
    DahcAlertComponent,
    DahcButtonComponent,
    DahcEmptyStateComponent,
    DahcModalComponent,
    DahcPageHeaderComponent,
    EnglishStepComponent,
    EntranceExamStepComponent,
    IdentityStepComponent,
    InternshipStepComponent,
    NextOfKinStepComponent,
    PersonalAttachmentsStepComponent,
    ResidencyStepComponent,
    RouterLink,
  ],
})
export class CorrectionsPageComponent implements DahcHasUnsavedChanges {
  private readonly applicationsApi = inject(ApplicationsApiService);
  private readonly router = inject(Router);
  private readonly toasts = inject(DahcToastService);
  private readonly sessions = inject(SessionService);
  private readonly locale = inject(LOCALE_ID);
  private readonly injector = inject(Injector);
  private readonly summary = viewChild<ElementRef<HTMLElement>>('summary');
  /** One key per re-submit attempt, reused when the same attempt is retried. */
  private idempotencyKey = crypto.randomUUID();

  /** Route parameter (withComponentInputBinding). */
  readonly applicationId = input.required<string>();

  protected readonly state = inject(WizardStateService);
  protected readonly loading = signal<boolean>(true);
  /** Nothing to correct: the application is not returned for correction (409) or not found. */
  protected readonly blocked = signal<boolean>(false);
  protected readonly loadError = signal<string>('');
  protected readonly flags = signal<readonly CorrectionFlag[]>([]);
  protected readonly deadline = signal<string>('');
  protected readonly confirming = signal<boolean>(false);
  protected readonly submitting = signal<boolean>(false);
  protected readonly submitError = signal<string>('');
  /** The "leave without sending?" question asked by unsavedChangesGuard (PQ-35). */
  protected readonly leaveOpen = signal<boolean>(false);
  private leaveAnswer: ((leave: boolean) => void) | null = null;
  private sent = false;
  /** Pages that still fail validation after a re-submit attempt. */
  protected readonly invalidSteps = signal<readonly WizardStepId[]>([]);

  protected readonly applicationLine = computed<string>(() => {
    const number = this.state.application()?.applicationNumber ?? '';

    return number === '' ? '' : $localize`:@@portal.corrections.applicationLine:Application ${number}:number:`;
  });

  protected readonly deadlineText = computed<string>(() =>
    formatDahcDateTime(this.deadline(), this.locale, this.sessions.timeZoneId(), 'dateTime'),
  );

  protected readonly blocks = computed<readonly CorrectionBlock[]>(() => {
    const slots = this.state.slots();
    const byStep = new Map<WizardStepId, { section: ApplicationSectionKey; notes: CorrectionNote[] }>();

    this.flags().forEach((flag, index) => {
      const target = this.target(flag, slots.find(slot => `/attachments/${slot.slotId}` === flag.fieldPointer)?.label);

      if (!target) {
        return;
      }

      const entry = byStep.get(target.step) ?? { section: target.section, notes: [] };
      entry.notes.push({ id: `correction-note-${index}`, label: target.label, note: flag.candidateNote ?? '' });
      byStep.set(target.step, entry);
    });

    const order = this.state.steps();

    return [...byStep.entries()]
      .sort(([first], [second]) => order.indexOf(first) - order.indexOf(second))
      .map(([step, entry]) => ({ step, section: entry.section, heading: this.heading(step), notes: entry.notes }));
  });

  protected readonly invalidStepLabels = computed<readonly string[]>(() => this.invalidSteps().map(step => this.heading(step)));

  constructor() {
    effect(() => {
      void this.load(this.applicationId());
    });
  }

  /** Validates the flagged pages as at submission; when they pass, asks for confirmation. */
  /** Changed but unsent corrections; nothing is auto-saved in correction mode. */
  hasUnsavedChanges(): boolean {
    return !this.sent && Object.values(this.state.forms).some(form => form.dirty);
  }

  confirmDiscard(): Promise<boolean> {
    this.leaveOpen.set(true);

    return new Promise<boolean>(resolve => {
      this.leaveAnswer = resolve;
    });
  }

  /** Closing the question with Escape or the close button means stay. */
  protected leaveOpenChange(open: boolean): void {
    if (!open) {
      this.answerLeave(false);
    }
  }

  protected answerLeave(leave: boolean): void {
    this.leaveOpen.set(false);
    this.leaveAnswer?.(leave);
    this.leaveAnswer = null;
  }

  protected requestSubmit(): void {
    const steps = this.blocks().map(block => block.step);
    steps.forEach(step => this.state.check(step));
    const invalid = steps.filter(step => !this.isCorrected(step));
    this.invalidSteps.set(invalid);
    this.submitError.set('');

    if (invalid.length > 0) {
      // Let the summary render before it takes focus.
      afterNextRender(() => this.summary()?.nativeElement.focus(), { injector: this.injector });

      return;
    }

    this.confirming.set(true);
  }

  protected async submit(): Promise<void> {
    const application = this.state.application();

    if (!application) {
      return;
    }

    const sections = this.flaggedSections();
    this.submitting.set(true);
    this.submitError.set('');

    try {
      await firstValueFrom(
        this.applicationsApi.submitCorrections(
          application.id,
          { sections: this.state.correctionInputs(sections) },
          this.idempotencyKey,
          callerHandlesProblems(),
        ),
      );
      this.idempotencyKey = crypto.randomUUID();
      this.sent = true;
      this.confirming.set(false);
      this.toasts.show({
        variant: 'success',
        heading: $localize`:@@portal.corrections.doneHeading:Your corrections were submitted`,
        message: $localize`:@@portal.corrections.doneMessage:The admissions officer will review them. We will email you about the outcome.`,
      });
      await this.router.navigateByUrl('/candidate/dashboard');
    } catch (error: unknown) {
      this.confirming.set(false);
      this.submitError.set(actionProblemText(error));
    } finally {
      this.submitting.set(false);
    }
  }

  /**
   * The submission rules applied to what the candidate may change: the page's open (flagged) fields
   * are valid and its flagged documents have a file. Unflagged items are not the candidate's to fix.
   */
  private isCorrected(step: WizardStepId): boolean {
    const control = this.state.stepControl(step);
    const flaggedSlots = this.flags().map(flag => flag.fieldPointer);
    const missing = this.state.missingSlots(step).filter(slot => flaggedSlots.includes(`/attachments/${slot.slotId}`));

    return (control === null || control.valid || control.disabled) && missing.length === 0;
  }

  private async load(applicationId: string): Promise<void> {
    this.loading.set(true);
    this.blocked.set(false);
    this.loadError.set('');

    try {
      const corrections = await firstValueFrom(this.applicationsApi.getCorrections(applicationId, callerHandlesProblems()));
      await this.state.load(applicationId);

      if (this.state.loadError() !== null || this.state.application() === null) {
        this.loadError.set(this.state.loadError()?.detail ?? $localize`:@@portal.corrections.loadFailed:We could not open your application. Please try again.`);

        return;
      }

      this.flags.set(corrections.data.flags);
      this.deadline.set(corrections.data.correctionDeadline);
      this.blocked.set(corrections.data.flags.length === 0);
      this.state.startCorrection(corrections.data.flags);
    } catch (error: unknown) {
      if (isApiProblemError(error) && (error.problem.status === 409 || error.problem.status === 404)) {
        this.blocked.set(true);
      } else {
        this.loadError.set(actionProblemText(error));
      }
    } finally {
      this.loading.set(false);
    }
  }

  /** The section keys whose values are re-submitted (fields flagged; documents upload on their own). */
  private flaggedSections(): ApplicationSectionKey[] {
    const keys = this.flags()
      .map(flag => /^\/sections\/([^/]+)/.exec(flag.fieldPointer)?.[1])
      .filter((key): key is string => key !== undefined) as ApplicationSectionKey[];

    return [...new Set(keys)];
  }

  /** Which page a flag belongs to and how to name it. */
  private target(flag: CorrectionFlag, slotLabel: string | undefined): { step: WizardStepId; section: ApplicationSectionKey; label: string } | null {
    const field = /^\/sections\/([^/]+)(?:\/values\/(.+))?$/.exec(flag.fieldPointer);

    if (field) {
      const section = field[1] as ApplicationSectionKey;
      const path = (field[2] ?? '').split('/').filter(part => !/^\d+$/.test(part));
      const step = section === 'personal-information' ? (PERSONAL_STEP_BY_GROUP[path[0] ?? ''] ?? 'personal-identity') : (section as WizardStepId);
      const label = path.length === 0 ? this.heading(step) : (correctionFieldLabel(`${section}/${path.join('/')}`) ?? $localize`:@@portal.corrections.otherItem:Other information`);

      return { step, section, label };
    }

    const attachment = /^\/attachments\/(.+)$/.exec(flag.fieldPointer);

    if (attachment) {
      const section = (decodeURIComponent(attachment[1] ?? '').split(':')[0] ?? '') as ApplicationSectionKey;
      const step: WizardStepId = section === 'personal-information' ? 'personal-attachments' : (section as WizardStepId);
      const label = slotLabel ?? $localize`:@@portal.corrections.document:Document`;

      return { step, section, label };
    }

    return null;
  }

  private heading(step: WizardStepId): string {
    return stepLabel(step);
  }
}
