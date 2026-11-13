import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, LOCALE_ID, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  DahcAccordionComponent,
  DahcAccordionItemComponent,
  DahcAlertComponent,
  DahcButtonComponent,
  DahcDetailItem,
  DahcDetailListComponent,
  DahcModalComponent,
  DahcNavLink,
  DahcPageHeaderComponent,
  DahcSkeletonComponent,
  DahcToastService,
} from 'dahc-ui';

import { PortfolioQuestion } from '../../../api/scoring.models';
import { DahcHasUnsavedChanges } from '../../../core/auth/unsaved-changes.guard';
import { formatDahcDateTime } from '../../../core/locale/date-time.pipe';
import { SessionService } from '../../../core/auth/session.service';
import { roundLabel } from '../referee-dashboard/referee-labels';
import { ConflictOfInterestDialogComponent } from './conflict-of-interest-dialog.component';
import { PortfolioScoringFacade } from './portfolio-scoring.facade';
import { QuestionScoreCardComponent } from './question-score-card.component';
import { QuestionProblem, questionProblem } from './scoring-rules';
import { SubmitScoringDialogComponent } from './submit-scoring-dialog.component';

interface SummaryItem {
  readonly questionId: string;
  readonly text: string;
}

/**
 * Scores one anonymised portfolio for the referee's assigned round (US-3.3.1 to US-3.3.4):
 * key information, each question with evidence and the Accept / Reject decision, a running total,
 * Save draft (If-Match), Submit (blocked until every question is scored) and Return for conflict
 * of interest (US-3.3.2). Candidate identity is never shown (STP-3.3). Leaving with unsaved
 * changes asks first (unsavedChangesGuard).
 */
@Component({
  selector: 'dahc-portfolio-scoring-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ConflictOfInterestDialogComponent,
    DahcAccordionComponent,
    DahcAccordionItemComponent,
    DahcAlertComponent,
    DahcButtonComponent,
    DahcDetailListComponent,
    DahcModalComponent,
    DahcPageHeaderComponent,
    DahcSkeletonComponent,
    QuestionScoreCardComponent,
    RouterLink,
    SubmitScoringDialogComponent,
  ],
  providers: [PortfolioScoringFacade],
  styleUrl: './portfolio-scoring-page.component.scss',
  templateUrl: './portfolio-scoring-page.component.html',
})
export class PortfolioScoringPageComponent implements DahcHasUnsavedChanges {
  protected readonly facade = inject(PortfolioScoringFacade);
  private readonly router = inject(Router);
  private readonly toasts = inject(DahcToastService);
  private readonly sessions = inject(SessionService);
  private readonly locale = inject(LOCALE_ID);
  private readonly document = inject(DOCUMENT);

  /** Route parameter. */
  readonly portfolioId = input.required<string>();

  protected readonly attempted = signal<boolean>(false);
  protected readonly saving = signal<boolean>(false);
  protected readonly saveMessage = signal<{ readonly variant: 'success' | 'info' | 'error'; readonly text: string } | null>(null);
  protected readonly expanded = signal<ReadonlySet<string>>(new Set());
  protected readonly submitOpen = signal<boolean>(false);
  protected readonly coiOpen = signal<boolean>(false);
  protected readonly leaveOpen = signal<boolean>(false);
  private leaving = false;
  private resolveLeave: ((leave: boolean) => void) | null = null;

  protected readonly heading = computed<string>(() => {
    const number = this.facade.portfolio()?.context?.applicationNumber;

    return number
      ? $localize`:@@portal.scoring.portfolio.heading:Score portfolio ${number}:number:`
      : $localize`:@@portal.scoring.portfolio.headingPlain:Score portfolio`;
  });
  protected readonly breadcrumbs = computed<readonly DahcNavLink[]>(() => [
    { label: $localize`:@@portal.nav.refereeDashboard:My portfolios`, route: '/scoring/referee' },
    { label: this.heading(), current: true },
  ]);
  protected readonly keyInfo = computed<readonly DahcDetailItem[]>(() => {
    const portfolio = this.facade.portfolio();

    if (!portfolio) {
      return [];
    }

    const context = portfolio.context;
    const date = (value: string | null | undefined, style: 'date' | 'dateTime' = 'date'): string =>
      formatDahcDateTime(value, this.locale, this.sessions.timeZoneId(), style) || '–';
    const items: DahcDetailItem[] = [
      { label: $localize`:@@portal.scoring.portfolio.infoApplication:Application ID`, value: context?.applicationNumber ?? '–' },
      { label: $localize`:@@portal.scoring.portfolio.infoRound:Round`, value: roundLabel(portfolio.round) },
      { label: $localize`:@@portal.scoring.portfolio.infoSubmitted:Submitted`, value: date(context?.submittedAt) },
      { label: $localize`:@@portal.scoring.portfolio.infoProgram:Program`, value: context?.programName ?? '–' },
    ];

    for (const fact of context?.keyFacts ?? []) {
      items.push({ label: fact.label, value: fact.value });
    }

    items.push({ label: $localize`:@@portal.scoring.portfolio.infoDue:Due`, value: date(context?.dueAt, 'dateTime') });

    return items;
  });
  protected readonly isSecondEvaluation = computed<boolean>(() => this.facade.portfolio()?.round === 'SECOND_EVALUATION');
  protected readonly summary = computed<readonly SummaryItem[]>(() => {
    if (!this.attempted()) {
      return [];
    }

    return this.facade.questions().flatMap((question, index) => {
      const problem = questionProblem(question, this.facade.decision(question.questionId));

      return problem === null ? [] : [{ questionId: question.questionId, text: problemText(index + 1, problem) }];
    });
  });

  constructor() {
    effect(() => {
      const id = this.portfolioId();
      untracked(() => {
        void this.facade.load(id).then(() => this.expanded.set(new Set(this.facade.questions().map(question => question.questionId))));
      });
    });
  }

  hasUnsavedChanges(): boolean {
    return !this.leaving && this.facade.dirty();
  }

  confirmDiscard(): Promise<boolean> {
    this.leaveOpen.set(true);

    return new Promise<boolean>(resolve => {
      this.resolveLeave = resolve;
    });
  }

  protected answerLeave(leave: boolean): void {
    this.leaveOpen.set(false);
    this.resolveLeave?.(leave);
    this.resolveLeave = null;
  }

  protected leaveDialogChanged(open: boolean): void {
    // Closing the dialog with Escape or the close button means "stay".
    if (!open && this.resolveLeave) {
      this.answerLeave(false);
    }
  }

  protected itemHeading(question: PortfolioQuestion, index: number): string {
    const value = this.facade.decision(question.questionId);
    const number = index + 1;

    if (this.attempted() && questionProblem(question, value) !== null) {
      return $localize`:@@portal.scoring.portfolio.itemAttention:Question ${number}:number: – needs your decision`;
    }

    switch (value.decision) {
      case 'ACCEPT':
        return $localize`:@@portal.scoring.portfolio.itemAccepted:Question ${number}:number: – accepted`;
      case 'REJECT':
        return $localize`:@@portal.scoring.portfolio.itemRejected:Question ${number}:number: – rejected`;
      default:
        return $localize`:@@portal.scoring.portfolio.itemNotScored:Question ${number}:number: – not scored yet`;
    }
  }

  protected isExpanded(questionId: string): boolean {
    return this.expanded().has(questionId);
  }

  protected setExpanded(questionId: string, open: boolean): void {
    const next = new Set(this.expanded());

    if (open) {
      next.add(questionId);
    } else {
      next.delete(questionId);
    }

    this.expanded.set(next);
  }

  /** Opens the question from the error summary and moves focus to it. */
  protected jumpTo(questionId: string): void {
    this.setExpanded(questionId, true);
    this.document.defaultView?.setTimeout(() => this.document.getElementById(`question-${questionId}`)?.focus(), 0);
  }

  protected async save(): Promise<void> {
    this.saving.set(true);
    this.saveMessage.set(null);
    const result = await this.facade.save();
    this.saving.set(false);

    if (result.outcome === 'saved') {
      this.saveMessage.set(
        result.skipped > 0
          ? { variant: 'info', text: $localize`:@@portal.scoring.portfolio.savedPartly:Draft saved. ${result.skipped}:count: question(s) are not complete yet and were not saved.` }
          : { variant: 'success', text: $localize`:@@portal.scoring.portfolio.saved:Draft saved.` },
      );
    } else if (result.outcome === 'failed') {
      this.saveMessage.set({ variant: 'error', text: result.problem });
    }
  }

  protected reload(): void {
    this.saveMessage.set(null);
    this.attempted.set(false);
    void this.facade.load(this.portfolioId());
  }

  /** Opens the confirmation, or shows what is missing and focuses the summary (US-3.3.4). */
  protected requestSubmit(): void {
    this.attempted.set(true);

    if (this.facade.incompleteQuestionIds().length > 0) {
      for (const id of this.facade.incompleteQuestionIds()) {
        this.setExpanded(id, true);
      }

      this.document.defaultView?.setTimeout(() => this.document.getElementById('scoring-summary')?.focus(), 0);

      return;
    }

    this.submitOpen.set(true);
  }

  protected submitted(): void {
    this.leaving = true;
    this.toasts.show({ variant: 'success', heading: $localize`:@@portal.scoring.portfolio.submittedToast:Your scores were submitted.` });
    void this.router.navigateByUrl('/scoring/referee');
  }

  protected returned(): void {
    this.leaving = true;
    this.toasts.show({ variant: 'success', heading: $localize`:@@portal.scoring.portfolio.returnedToast:The portfolio was returned for conflict of interest.` });
    void this.router.navigateByUrl('/scoring/referee');
  }
}

function problemText(number: number, problem: QuestionProblem): string {
  switch (problem) {
    case 'NO_DECISION':
      return $localize`:@@portal.scoring.portfolio.summaryDecision:Question ${number}:number:: choose Accept or Reject.`;
    case 'NO_CLASSIFICATION':
      return $localize`:@@portal.scoring.portfolio.summaryClassification:Question ${number}:number:: choose a classification.`;
    case 'NO_REASON':
      return $localize`:@@portal.scoring.portfolio.summaryReason:Question ${number}:number:: choose at least one rejection reason.`;
  }
}
