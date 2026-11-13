import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  DahcAlertComponent,
  DahcButtonComponent,
  DahcDetailItem,
  DahcDetailListComponent,
  DahcMultiSelectComponent,
  DahcRadioGroupComponent,
  DahcRadioOption,
  DahcSelectComponent,
  DahcSelectOption,
  DahcTagComponent,
} from 'dahc-ui';
import { merge } from 'rxjs';

import { ScoringApiService } from '../../../api/scoring-api.service';
import { PortfolioQuestion } from '../../../api/scoring.models';
import { openBlobInNewTab } from '../../../core/api/file-download';
import { PortfolioScoringFacade } from './portfolio-scoring.facade';
import { QuestionDecision, QuestionProblem, questionProblem } from './scoring-rules';

/**
 * One portfolio question in scoring mode (US-3.3.1, US-3.3.3): the question, the candidate's
 * answer, details and evidence (view with the browser's viewer), and the referee's decision:
 * Accept or Reject; points-system questions need a classification on Accept, rejections need one
 * or more reasons, whose predefined candidate-facing comments are shown read-only. The question
 * score is the service's value after a save, otherwise an estimate.
 */
@Component({
  selector: 'dahc-question-score-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcAlertComponent,
    DahcButtonComponent,
    DahcDetailListComponent,
    DahcMultiSelectComponent,
    DahcRadioGroupComponent,
    DahcSelectComponent,
    DahcTagComponent,
    ReactiveFormsModule,
  ],
  styleUrl: './question-score-card.component.scss',
  template: `
    <div class="question">
      <p class="prompt">{{ question().prompt }}</p>
      <p class="meta">
        <span i18n="@@portal.scoring.portfolio.answer">Candidate's answer: <strong>{{ answerLabel() }}</strong></span>
        <dahc-tag purpose="informative-blue">{{ scoringTypeLabel() }}</dahc-tag>
      </p>

      @if (question().appealResponse; as response) {
        <dahc-alert variant="info" i18n-heading="@@portal.scoring.portfolio.appealHeading" heading="Candidate's appeal response">{{ response }}</dahc-alert>
      }

      @if (details().length > 0) {
        <dahc-detail-list [items]="details()" [columns]="2" i18n-heading="@@portal.scoring.portfolio.detailsHeading" heading="Details" [headingLevel]="4" />
      }

      <div class="evidence">
        <h4 class="subheading" i18n="@@portal.scoring.portfolio.evidenceHeading">Evidence</h4>
        @if (question().evidence.length === 0) {
          <p class="muted" i18n="@@portal.scoring.portfolio.noEvidence">No evidence was provided for this question.</p>
        } @else {
          <ul class="evidence-list">
            @for (file of question().evidence; track file.attachmentId) {
              <li>
                <button dahc-button type="button" variant="link" (click)="view(file.attachmentId)" i18n="@@portal.scoring.portfolio.viewEvidence">
                  View {{ file.fileName }}
                </button>
              </li>
            }
          </ul>
        }
      </div>

      <div class="decision">
        <dahc-radio-group
          [formControl]="decision"
          [options]="decisionOptions"
          [label]="decisionLabel()"
          [required]="true"
          [invalid]="problem() === 'NO_DECISION'"
          [errorMessage]="problem() === 'NO_DECISION' ? noDecisionText : ''" />

        @if (decision.value === 'ACCEPT' && question().scoringType === 'POINTS') {
          <dahc-select
            [formControl]="classification"
            [options]="classificationOptions()"
            i18n-label="@@portal.scoring.portfolio.classification"
            label="Classification"
            [required]="true"
            [invalid]="problem() === 'NO_CLASSIFICATION'"
            [errorMessage]="problem() === 'NO_CLASSIFICATION' ? noClassificationText : ''" />
        }

        @if (decision.value === 'REJECT') {
          <dahc-multi-select
            [formControl]="reasons"
            [options]="reasonOptions()"
            i18n-label="@@portal.scoring.portfolio.reasons"
            label="Rejection reasons"
            [required]="true"
            [invalid]="problem() === 'NO_REASON'"
            [errorMessage]="problem() === 'NO_REASON' ? noReasonText : ''" />
          @if (comments().length > 0) {
            <div class="comments">
              <h4 class="subheading" i18n="@@portal.scoring.portfolio.commentsHeading">Comment the candidate will see</h4>
              <ul class="comment-list">
                @for (comment of comments(); track comment) {
                  <li>{{ comment }}</li>
                }
              </ul>
            </div>
          }
        }
      </div>

      <p class="score" aria-live="polite">
        @if (score().points === null) {
          <span i18n="@@portal.scoring.portfolio.scoreNone">Question score: not scored yet (maximum {{ question().maxPoints ?? '–' }})</span>
        } @else if (score().estimate) {
          <span i18n="@@portal.scoring.portfolio.scoreEstimate">Question score: {{ score().points }} of {{ question().maxPoints ?? '–' }} (estimate until saved)</span>
        } @else {
          <span i18n="@@portal.scoring.portfolio.scoreSaved">Question score: {{ score().points }} of {{ question().maxPoints ?? '–' }}</span>
        }
      </p>
    </div>
  `,
})
export class QuestionScoreCardComponent {
  private readonly facade = inject(PortfolioScoringFacade);
  private readonly api = inject(ScoringApiService);
  private readonly document = inject(DOCUMENT);

  readonly question = input.required<PortfolioQuestion>();
  readonly number = input.required<number>();
  /** Shows what is missing (after a submit attempt). */
  readonly showProblems = input<boolean>(false);

  protected readonly decision = new FormControl<string>('', { nonNullable: true });
  protected readonly classification = new FormControl<string>('', { nonNullable: true });
  protected readonly reasons = new FormControl<readonly string[]>([], { nonNullable: true });

  protected readonly decisionOptions: readonly DahcRadioOption[] = [
    { value: 'ACCEPT', label: $localize`:@@portal.scoring.portfolio.accept:Accept` },
    { value: 'REJECT', label: $localize`:@@portal.scoring.portfolio.reject:Reject` },
  ];
  protected readonly noDecisionText = $localize`:@@portal.scoring.portfolio.errorDecision:Choose Accept or Reject.`;
  protected readonly noClassificationText = $localize`:@@portal.scoring.portfolio.errorClassification:Choose a classification.`;
  protected readonly noReasonText = $localize`:@@portal.scoring.portfolio.errorReason:Choose at least one rejection reason.`;

  protected readonly current = computed<QuestionDecision>(() => this.facade.decisions().get(this.question().questionId) ?? { decision: '', classificationCode: '', rejectionReasonCodes: [] });
  protected readonly problem = computed<QuestionProblem | null>(() => (this.showProblems() ? questionProblem(this.question(), this.current()) : null));
  protected readonly score = computed(() => {
    this.facade.decisions();
    this.facade.classifications();

    return this.facade.score(this.question());
  });
  protected readonly decisionLabel = computed<string>(() => $localize`:@@portal.scoring.portfolio.decisionLabel:Decision for question ${this.number()}:number:`);
  protected readonly answerLabel = computed<string>(() =>
    this.question().candidateAnswer === 'YES' ? $localize`:@@portal.scoring.portfolio.yes:Yes` : this.question().candidateAnswer === 'NO' ? $localize`:@@portal.scoring.portfolio.no:No` : this.question().candidateAnswer,
  );
  protected readonly scoringTypeLabel = computed<string>(() => {
    const max = this.question().maxPoints ?? '–';

    return this.question().scoringType === 'POINTS'
      ? $localize`:@@portal.scoring.portfolio.typePoints:Points system, up to ${max}:max: points`
      : $localize`:@@portal.scoring.portfolio.typeAllOrNothing:All or nothing, ${max}:max: points`;
  });
  protected readonly details = computed<readonly DahcDetailItem[]>(() =>
    Object.entries(this.question().details ?? {})
      .filter(([, value]) => value !== null && value !== undefined && value !== '')
      .map(([key, value]) => ({ label: humanise(key), value: String(value) })),
  );
  protected readonly classificationOptions = computed<readonly DahcSelectOption[]>(() =>
    this.facade.classificationsFor(this.question().questionId).map(item => ({
      value: item.code,
      label: item.points === null || item.points === undefined ? item.label : $localize`:@@portal.scoring.portfolio.classificationOption:${item.label}:label: (${item.points}:points: points)`,
    })),
  );
  protected readonly reasonOptions = computed<readonly DahcSelectOption[]>(() =>
    this.facade.reasonsFor(this.question().questionId).map(item => ({ value: item.code, label: item.label })),
  );
  protected readonly comments = computed<readonly string[]>(() => {
    const chosen = this.current().rejectionReasonCodes;

    return this.facade
      .reasonsFor(this.question().questionId)
      .filter(item => chosen.includes(item.code) && item.candidateComment)
      .map(item => item.candidateComment ?? '');
  });

  constructor() {
    // Keep the controls in step with the facade (saved draft, the Q1 -> Q2 default).
    effect(() => {
      const value = this.current();
      this.decision.setValue(value.decision, { emitEvent: false });
      this.classification.setValue(value.classificationCode, { emitEvent: false });
      this.reasons.setValue(value.rejectionReasonCodes, { emitEvent: false });
    });

    const subscription = merge(this.decision.valueChanges, this.classification.valueChanges, this.reasons.valueChanges).subscribe(() => {
      const decision = this.decision.value === 'ACCEPT' || this.decision.value === 'REJECT' ? this.decision.value : '';
      this.facade.setDecision(this.question().questionId, {
        decision,
        classificationCode: decision === 'ACCEPT' ? this.classification.value : '',
        rejectionReasonCodes: decision === 'REJECT' ? this.reasons.value : [],
      });
    });
    inject(DestroyRef).onDestroy(() => subscription.unsubscribe());
  }

  protected view(evidenceId: string): void {
    const portfolio = this.facade.portfolio();

    if (portfolio) {
      void openBlobInNewTab(this.document.defaultView, this.api.downloadEvidence(portfolio.portfolioId, evidenceId));
    }
  }
}

/** "publicationDate" -> "Publication date". */
function humanise(key: string): string {
  const words = key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').toLowerCase();

  return words.charAt(0).toUpperCase() + words.slice(1);
}
