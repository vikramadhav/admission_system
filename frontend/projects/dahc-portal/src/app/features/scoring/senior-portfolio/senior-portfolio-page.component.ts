import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, LOCALE_ID, computed, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import {
  DahcAlertComponent,
  DahcButtonComponent,
  DahcCardComponent,
  DahcDetailItem,
  DahcDetailListComponent,
  DahcNavLink,
  DahcPageHeaderComponent,
  DahcSkeletonComponent,
  DahcTableCellDirective,
  DahcTableColumn,
  DahcTableComponent,
  DahcTableRow,
  DahcTagComponent,
  DahcTagPurpose,
  DahcToastService,
} from 'dahc-ui';
import { map } from 'rxjs';

import { ScoringApiService } from '../../../api/scoring-api.service';
import { PortfolioQuestion, ScoringRound, SeniorPortfolioReview } from '../../../api/scoring.models';
import { callerHandlesProblems } from '../../../core/api/api-request';
import { openBlobInNewTab } from '../../../core/api/file-download';
import { SessionService } from '../../../core/auth/session.service';
import { formatDahcDateTime } from '../../../core/locale/date-time.pipe';
import { portfolioStatusDisplay } from '../../../shared/workflow/workflow-status';
import { pointsOutOf, problemText, roundLabel, roundStatusDisplay, seniorBreadcrumbRoot } from '../senior-dashboard/senior-labels';
import { OversightDone, ReassignOverrideDialogComponent } from './reassign-override-dialog.component';
import { EvidenceTarget, ReplaceEvidenceDialogComponent } from './replace-evidence-dialog.component';

interface RoundRow extends DahcTableRow {
  readonly id: string;
  readonly round: string;
  readonly status: string;
  readonly statusPurpose: DahcTagPurpose;
  readonly referee: string;
  readonly totalPoints: string;
  readonly submittedAt: string;
}

interface DiscrepancyRow extends DahcTableRow {
  readonly id: string;
  readonly question: string;
  readonly round1: string;
  readonly round2: string;
}

interface QuestionView {
  readonly question: PortfolioQuestion;
  readonly number: number;
  readonly label: string;
  readonly details: readonly DahcDetailItem[];
}

/**
 * Portfolio oversight for the senior referee (US-3.1.3, US-3.2.2, US-3.2.3): key information
 * (never the candidate's identity), the portfolio's status and final score, every round with its
 * referee and total, discrepancy details, and the questions with their evidence. From here the
 * senior referee reassigns a portfolio in a referee's inbox, overrides a completed round's score
 * with a justification, or replaces an evidence file. Senior referees never score (STP-3.2).
 */
@Component({
  selector: 'dahc-senior-portfolio-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcAlertComponent,
    DahcButtonComponent,
    DahcCardComponent,
    DahcDetailListComponent,
    DahcPageHeaderComponent,
    DahcSkeletonComponent,
    DahcTableCellDirective,
    DahcTableComponent,
    DahcTagComponent,
    ReassignOverrideDialogComponent,
    ReplaceEvidenceDialogComponent,
    RouterLink,
  ],
  styleUrl: '../senior-dashboard/senior-pages.scss',
  template: `
    <dahc-page-header [heading]="heading()" [description]="description()" [breadcrumbs]="breadcrumbs()" [focusOnLoad]="true" />

    <div class="dahc-portal-page">
      @if (portfolio.error()) {
        <dahc-alert variant="error" [announce]="true">
          {{ errorText() }}
          <button dahc-button type="button" variant="link" (click)="portfolio.reload()" i18n="@@portal.action.tryAgain">Try again</button>
        </dahc-alert>
        <div class="actions">
          <a dahc-button variant="secondary" routerLink="/scoring/senior" i18n="@@portal.scoring.seniorPortfolio.backToOversight">Back to scoring oversight</a>
        </div>
      } @else if (review(); as review) {
        <section class="section" aria-labelledby="senior-portfolio-summary">
          <h2 id="senior-portfolio-summary" class="section-heading" i18n="@@portal.scoring.seniorPortfolio.summary">Summary</h2>
          <dahc-detail-list [items]="summaryItems()" [columns]="3" />
          @if (canReassign() || completedRounds().length > 0) {
            <div class="actions">
              <button dahc-button type="button" (click)="dialogOpen.set(true)" i18n="@@portal.scoring.seniorPortfolio.openDialog">Reassign or override</button>
            </div>
          }
        </section>

        <section class="section" aria-labelledby="senior-portfolio-rounds">
          <h2 id="senior-portfolio-rounds" class="section-heading" i18n="@@portal.scoring.seniorPortfolio.rounds">Scoring rounds</h2>
          <dahc-table
            i18n-caption="@@portal.scoring.seniorPortfolio.roundsCaption"
            caption="Rounds, referees and totals"
            [columns]="roundColumns"
            [rows]="roundRows()"
            scrollX="640px">
            <ng-template dahcTableCell="status" let-row>
              <dahc-tag [purpose]="roundRow(row).statusPurpose">{{ roundRow(row).status }}</dahc-tag>
            </ng-template>
          </dahc-table>
        </section>

        @if (discrepancyRows().length > 0) {
          <section class="section" aria-labelledby="senior-portfolio-discrepancy">
            <h2 id="senior-portfolio-discrepancy" class="section-heading" i18n="@@portal.scoring.seniorPortfolio.discrepancy">Discrepancy between Round 1 and Round 2</h2>
            <dahc-table
              i18n-caption="@@portal.scoring.seniorPortfolio.discrepancyCaption"
              caption="Questions with different decisions"
              [columns]="discrepancyColumns"
              [rows]="discrepancyRows()"
              scrollX="560px" />
          </section>
        }

        <section class="section" aria-labelledby="senior-portfolio-questions">
          <h2 id="senior-portfolio-questions" class="section-heading" i18n="@@portal.scoring.seniorPortfolio.questions">Questions and evidence</h2>
          <ol class="questions">
            @for (view of questions(); track view.question.questionId) {
              <li>
                <dahc-card class="question" [headingLevel]="3" [heading]="view.label">
                  <p class="dialog-text">{{ view.question.prompt }}</p>
                  <dahc-detail-list [items]="view.details" [columns]="2" />
                  @if (view.question.evidence.length > 0) {
                    <ul class="evidence-list" [attr.aria-label]="evidenceLabel(view.number)">
                      @for (evidence of view.question.evidence; track evidence.attachmentId) {
                        <li class="evidence">
                          <span class="evidence-name">{{ evidence.fileName }}</span>
                          <button dahc-button type="button" variant="secondary" size="sm" (click)="viewEvidence(evidence.attachmentId)" [attr.aria-label]="viewLabel(evidence.fileName)" i18n="@@portal.scoring.seniorPortfolio.view">View</button>
                          <button
                            dahc-button
                            type="button"
                            variant="secondary"
                            size="sm"
                            (click)="replace(evidence.attachmentId, evidence.fileName, view.label)"
                            [attr.aria-label]="replaceLabel(evidence.fileName)"
                            i18n="@@portal.scoring.seniorPortfolio.replace">Replace evidence</button>
                        </li>
                      }
                    </ul>
                  } @else {
                    <p class="section-text" i18n="@@portal.scoring.seniorPortfolio.noEvidence">No evidence for this question.</p>
                  }
                </dahc-card>
              </li>
            }
          </ol>
        </section>

        <dahc-reassign-override-dialog
          [(open)]="dialogOpen"
          [portfolioId]="review.portfolioId"
          [applicationNumber]="review.context?.applicationNumber ?? ''"
          [canReassign]="canReassign()"
          [completedRounds]="completedRounds()"
          [totalPossible]="totalPossible()"
          (completed)="done($event)" />
        <dahc-replace-evidence-dialog
          [(open)]="replaceOpen"
          [portfolioId]="review.portfolioId"
          [target]="replaceTarget()"
          (completed)="evidenceReplaced($event)" />
      } @else {
        <dahc-skeleton [rows]="6" />
      }
    </div>
  `,
})
export class SeniorPortfolioPageComponent {
  private readonly api = inject(ScoringApiService);
  private readonly sessions = inject(SessionService);
  private readonly toasts = inject(DahcToastService);
  private readonly locale = inject(LOCALE_ID);
  private readonly document = inject(DOCUMENT);

  /** Route parameter. */
  readonly portfolioId = input.required<string>();

  protected readonly dialogOpen = signal<boolean>(false);
  protected readonly replaceOpen = signal<boolean>(false);
  protected readonly replaceTarget = signal<EvidenceTarget | null>(null);

  protected readonly roundColumns: readonly DahcTableColumn[] = [
    { key: 'round', title: $localize`:@@portal.scoring.seniorPortfolio.colRound:Round` },
    { key: 'status', title: $localize`:@@portal.scoring.seniorPortfolio.colStatus:Status` },
    { key: 'referee', title: $localize`:@@portal.scoring.seniorPortfolio.colReferee:Referee` },
    { key: 'totalPoints', title: $localize`:@@portal.scoring.seniorPortfolio.colTotal:Total points` },
    { key: 'submittedAt', title: $localize`:@@portal.scoring.seniorPortfolio.colSubmitted:Submitted` },
  ];

  protected readonly discrepancyColumns: readonly DahcTableColumn[] = [
    { key: 'question', title: $localize`:@@portal.scoring.seniorPortfolio.colQuestion:Question` },
    { key: 'round1', title: $localize`:@@portal.scoring.seniorPortfolio.colRound1:Round 1` },
    { key: 'round2', title: $localize`:@@portal.scoring.seniorPortfolio.colRound2:Round 2` },
  ];

  protected readonly portfolio = rxResource({
    params: () => this.portfolioId(),
    stream: ({ params }) => this.api.getSeniorPortfolio(params, callerHandlesProblems()).pipe(map(result => result.data)),
  });

  protected readonly review = computed<SeniorPortfolioReview | null>(() => (this.portfolio.hasValue() ? this.portfolio.value() : null));
  protected readonly errorText = computed<string>(() => problemText(this.portfolio.error()));
  protected readonly totalPossible = computed<number>(() => this.review()?.context?.totalPossiblePoints ?? 0);

  protected readonly heading = computed<string>(() => {
    const number = this.review()?.context?.applicationNumber;

    return number
      ? $localize`:@@portal.scoring.seniorPortfolio.heading:Portfolio ${number}:number:`
      : $localize`:@@portal.scoring.seniorPortfolio.headingFallback:Portfolio oversight`;
  });

  protected readonly description = computed<string>(() => this.review()?.context?.programName ?? '');

  protected readonly breadcrumbs = computed<readonly DahcNavLink[]>(() => [seniorBreadcrumbRoot(), { label: this.heading() }]);

  /** PQ-18: Reassign while a referee holds the portfolio; Override once a round is complete. */
  protected readonly canReassign = computed<boolean>(() => Boolean(this.review()?.oversight?.currentRefereeId));

  protected readonly completedRounds = computed<readonly { readonly round: ScoringRound; readonly totalPoints: number | null }[]>(() =>
    (this.review()?.roundSummaries ?? []).filter(entry => entry.status === 'COMPLETE').map(entry => ({ round: entry.round, totalPoints: entry.totalPoints ?? null })),
  );

  protected readonly summaryItems = computed<readonly DahcDetailItem[]>(() => {
    const review = this.review();

    if (!review) {
      return [];
    }

    const oversight = review.oversight;
    const context = review.context;
    const items: DahcDetailItem[] = [
      { label: $localize`:@@portal.scoring.seniorPortfolio.applicationId:Application ID`, value: context?.applicationNumber ?? '' },
      { label: $localize`:@@portal.scoring.seniorPortfolio.submitted:Submission date`, value: context ? this.date(context.submittedAt, 'date') : '' },
      ...(context?.keyFacts ?? []).map(fact => ({ label: fact.label, value: fact.value })),
    ];

    if (oversight) {
      items.push(
        { label: $localize`:@@portal.scoring.seniorPortfolio.status:Portfolio status`, value: portfolioStatusDisplay(oversight.portfolioStatus).label },
        { label: $localize`:@@portal.scoring.seniorPortfolio.finalPoints:Final portfolio points`, value: pointsOutOf(oversight.finalPortfolioPoints, this.totalPossible()) },
        {
          label: $localize`:@@portal.scoring.seniorPortfolio.weighted:Weighted portfolio score`,
          value: oversight.weightedPortfolioScore === null || oversight.weightedPortfolioScore === undefined ? '–' : oversight.weightedPortfolioScore.toFixed(2),
        },
        { label: $localize`:@@portal.scoring.seniorPortfolio.currentRound:Current round`, value: oversight.currentRound ? roundLabel(oversight.currentRound) : '–' },
      );
    }

    return items;
  });

  protected readonly roundRows = computed<readonly RoundRow[]>(() =>
    (this.review()?.roundSummaries ?? []).map(entry => {
      const status = roundStatusDisplay(entry.status);

      return {
        id: entry.round,
        round: roundLabel(entry.round),
        status: status.label,
        statusPurpose: status.purpose,
        referee: entry.refereeName ?? (entry.refereeId ? entry.refereeId : '–'),
        totalPoints: pointsOutOf(entry.totalPoints, this.totalPossible()),
        submittedAt: entry.submittedAt ? this.date(entry.submittedAt, 'dateTime') : '–',
      };
    }),
  );

  protected readonly questions = computed<readonly QuestionView[]>(() =>
    (this.review()?.questions ?? []).map((question, index) => ({
      question,
      number: index + 1,
      label: $localize`:@@portal.scoring.seniorPortfolio.questionLabel:Question ${index + 1}:number:`,
      details: [
        { label: $localize`:@@portal.scoring.seniorPortfolio.answer:Candidate answer`, value: answerLabel(question.candidateAnswer) },
        ...(question.maxPoints === undefined ? [] : [{ label: $localize`:@@portal.scoring.seniorPortfolio.maxPoints:Maximum points`, value: String(question.maxPoints) }]),
        ...Object.entries(question.details ?? {}).map(([key, value]) => ({ label: humanise(key), value: String(value ?? '') })),
      ],
    })),
  );

  protected readonly discrepancyRows = computed<readonly DiscrepancyRow[]>(() => {
    const review = this.review();
    const numbers = new Map((review?.questions ?? []).map((question, index) => [question.questionId, index + 1]));

    return (review?.discrepancies ?? []).map(entry => ({
      id: entry.questionId,
      question: $localize`:@@portal.scoring.seniorPortfolio.questionLabel:Question ${numbers.get(entry.questionId) ?? '?'}:number:`,
      round1: decisionLabel(entry.round1Result),
      round2: decisionLabel(entry.round2Result),
    }));
  });

  protected roundRow(row: DahcTableRow): RoundRow {
    return row as RoundRow;
  }

  protected evidenceLabel(number: number): string {
    return $localize`:@@portal.scoring.seniorPortfolio.evidenceLabel:Evidence for question ${number}:number:`;
  }

  protected viewLabel(fileName: string): string {
    return $localize`:@@portal.scoring.seniorPortfolio.viewLabel:View ${fileName}:file:`;
  }

  protected replaceLabel(fileName: string): string {
    return $localize`:@@portal.scoring.seniorPortfolio.replaceLabel:Replace ${fileName}:file:`;
  }

  protected viewEvidence(evidenceId: string): void {
    void openBlobInNewTab(this.document.defaultView, this.api.downloadSeniorEvidence(this.portfolioId(), evidenceId));
  }

  protected replace(evidenceId: string, fileName: string, questionLabel: string): void {
    this.replaceTarget.set({ evidenceId, fileName, questionLabel });
    this.replaceOpen.set(true);
  }

  protected done(result: OversightDone): void {
    this.toasts.show({ variant: 'success', heading: result.message });
    this.portfolio.reload();
  }

  protected evidenceReplaced(message: string): void {
    this.toasts.show({ variant: 'success', heading: message });
    this.portfolio.reload();
  }

  private date(value: string, style: 'date' | 'dateTime'): string {
    return formatDahcDateTime(value, this.locale, this.sessions.timeZoneId(), style);
  }
}

function answerLabel(answer: string): string {
  switch (answer) {
    case 'YES':
      return $localize`:@@portal.scoring.seniorPortfolio.answerYes:Yes`;
    case 'NO':
      return $localize`:@@portal.scoring.seniorPortfolio.answerNo:No`;
    default:
      return answer;
  }
}

function decisionLabel(result: string | undefined): string {
  switch (result) {
    case 'ACCEPT':
      return $localize`:@@portal.scoring.seniorPortfolio.accept:Accept`;
    case 'REJECT':
      return $localize`:@@portal.scoring.seniorPortfolio.reject:Reject`;
    default:
      return result ?? '–';
  }
}

/** "publicationDate" -> "Publication date" for answer details without a schema label (PQ-26). */
function humanise(code: string): string {
  const words = code.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').trim().toLowerCase();

  return words.charAt(0).toUpperCase() + words.slice(1);
}
