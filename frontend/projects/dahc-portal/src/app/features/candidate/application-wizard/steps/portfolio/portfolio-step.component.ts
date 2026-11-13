import { HttpContext } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, LOCALE_ID, computed, effect, inject, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DahcAlertComponent, DahcButtonComponent, DahcModalComponent, DahcToastService } from 'dahc-ui';
import { firstValueFrom } from 'rxjs';

import { CandidateActionsApiService } from '../../../../../api/candidate-actions-api.service';
import { isApiProblemError } from '../../../../../core/api/api-problem-error';
import { DAHC_CALLER_HANDLES_PROBLEMS } from '../../../../../core/api/api-request';
import { ApiProblemDetails } from '../../../../../core/api/api.models';
import { SessionService } from '../../../../../core/auth/session.service';
import { formatDahcDateTime } from '../../../../../core/locale/date-time.pipe';
import { PortfolioQuestion, portfolioQuestions } from '../../../../../shared/portfolio-questions';
import { WizardStateService } from '../../wizard-state.service';
import { PortfolioQuestionCardComponent } from './portfolio-question-card.component';
import {
  PortfolioForm,
  createPortfolioForm,
  evidenceIds,
  missingEvidence,
  patchPortfolioForm,
  portfolioAnswers,
  syncPortfolioForm,
} from './portfolio.form';

interface ConfirmationRow {
  readonly number: number;
  readonly answer: string;
  readonly attachments: string;
}

/**
 * Portfolio (Figma 1:4900, US-1.3.10): the program's question set with indicative points, details
 * and evidence for every Yes, and a one-time submission after a confirmation that lists each answer
 * (BRD note 6). The contract has no portfolio draft (OQ-C5), so answers live in this session until
 * they are submitted.
 */
@Component({
  selector: 'dahc-portfolio-step',
  templateUrl: './portfolio-step.component.html',
  styleUrls: ['../step.scss', './portfolio-step.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcAlertComponent, DahcButtonComponent, DahcModalComponent, PortfolioQuestionCardComponent],
})
export class PortfolioStepComponent {
  private readonly api = inject(CandidateActionsApiService);
  private readonly toasts = inject(DahcToastService);
  private readonly locale = inject(LOCALE_ID);
  private readonly timeZoneId = inject(SessionService).timeZoneId;

  protected readonly state = inject(WizardStateService);
  protected readonly questions = computed<readonly PortfolioQuestion[]>(() => {
    const rules = this.state.rules();

    return rules ? portfolioQuestions(rules.portfolioSet) : [];
  });
  protected readonly form: PortfolioForm = this.state.retain('portfolio-form', () => createPortfolioForm(this.questions()));

  protected readonly confirmOpen = signal<boolean>(false);
  protected readonly submitting = signal<boolean>(false);
  protected readonly problem = signal<ApiProblemDetails | null>(null);

  protected readonly submittedAt = computed<string | null>(() => this.state.portfolio()?.submittedAt ?? null);
  protected readonly readOnly = computed<boolean>(() => this.submittedAt() !== null || !this.state.editable());
  protected readonly submittedOn = computed<string>(() =>
    formatDahcDateTime(this.submittedAt(), this.locale, this.timeZoneId(), 'dateTime'),
  );

  protected readonly confirmationRows = computed<readonly ConfirmationRow[]>(() => {
    this.state.revision();
    const slots = this.state.slots();

    return this.questions().map(question => {
      const yes = this.form.controls[question.id]?.controls.answer.value === 'YES';
      const files = yes ? evidenceIds(question, slots).length : 0;

      return {
        number: question.number,
        answer: yes ? $localize`:@@portal.option.yes:Yes` : $localize`:@@portal.option.no:No`,
        attachments:
          files > 0
            ? $localize`:@@portal.portfolio.attachmentsProvided:${files}:count: attached`
            : $localize`:@@portal.portfolio.noAttachments:None`,
      };
    });
  });

  constructor() {
    const destroyRef = inject(DestroyRef);

    // Submitted answers are shown read-only; unsubmitted answers stay as the candidate left them.
    const submission = this.state.portfolio();

    if (submission?.submittedAt) {
      patchPortfolioForm(this.form, submission);
    }

    syncPortfolioForm(this.form, this.questions());
    this.applyReadOnly();

    this.form.valueChanges.pipe(takeUntilDestroyed(destroyRef)).subscribe(() => {
      syncPortfolioForm(this.form, this.questions());
      this.state.revision.update(value => value + 1);
    });

    effect(() => {
      const submitting = this.submitting();
      const readOnly = this.readOnly();

      untracked(() => {
        this.state.primaryAction.set(
          readOnly
            ? null
            : {
                label: $localize`:@@portal.portfolio.submit:Submit portfolio`,
                loading: submitting,
                disabled: false,
                run: () => this.requestSubmit(),
              },
        );
      });
    });

    effect(() => {
      this.readOnly();
      untracked(() => this.applyReadOnly());
    });

    destroyRef.onDestroy(() => this.state.primaryAction.set(null));
  }

  protected showAll(): boolean {
    this.state.revision();

    return this.state.showsAllErrors('portfolio');
  }

  /** True when every question is answered and every Yes has its details and evidence. */
  private isValid(): boolean {
    const slots = this.state.slots();

    return (
      this.form.valid &&
      this.questions().every(
        question => this.form.controls[question.id]?.controls.answer.value !== 'YES' || missingEvidence(question, slots).length === 0,
      )
    );
  }

  protected requestSubmit(): void {
    this.problem.set(null);
    this.state.check('portfolio');
    this.form.markAllAsTouched();
    this.state.revision.update(value => value + 1);

    if (this.isValid()) {
      this.confirmOpen.set(true);
    }
  }

  protected async submit(): Promise<void> {
    const application = this.state.application();

    if (!application) {
      return;
    }

    this.submitting.set(true);

    try {
      const context = new HttpContext().set(DAHC_CALLER_HANDLES_PROBLEMS, true);
      const result = await firstValueFrom(
        this.api.submitPortfolio(
          application.id,
          { answers: portfolioAnswers(this.form, this.questions(), this.state.slots()), confirmed: true },
          context,
        ),
      );
      this.state.setPortfolio(result.data);
      this.confirmOpen.set(false);
      this.toasts.show({
        variant: 'success',
        heading: $localize`:@@portal.portfolio.submittedHeading:Portfolio submitted`,
        message: $localize`:@@portal.portfolio.submittedMessage:Continue to Pay & Submit to complete your application.`,
      });
    } catch (error: unknown) {
      this.confirmOpen.set(false);

      if (!isApiProblemError(error)) {
        throw error;
      }

      this.problem.set(error.problem);
    } finally {
      this.submitting.set(false);
    }
  }

  private applyReadOnly(): void {
    if (this.readOnly()) {
      this.form.disable({ emitEvent: false });
    } else if (this.form.disabled) {
      this.form.enable({ emitEvent: false });
      syncPortfolioForm(this.form, this.questions());
    }
  }
}
