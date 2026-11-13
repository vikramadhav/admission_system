import { ChangeDetectionStrategy, Component, computed, effect, inject, model, output, signal } from '@angular/core';
import { DahcAlertComponent, DahcButtonComponent, DahcModalComponent } from 'dahc-ui';

import { PortfolioScoringResult } from '../../../api/scoring.models';
import { portfolioStatusDisplay } from '../../../shared/workflow/workflow-status';
import { roundLabel } from '../referee-dashboard/referee-labels';
import { PortfolioScoringFacade, problemText } from './portfolio-scoring.facade';

/**
 * Submits the referee's round (US-3.3.4). Unsaved changes are saved first; then the service
 * completes the round and decides what follows: waiting for the other round, a discrepancy sent
 * to the third referee, or a final score. The outcome is shown before returning to the dashboard.
 * The idempotency key is created once per opening and reused on retry.
 */
@Component({
  selector: 'dahc-submit-scoring-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcAlertComponent, DahcButtonComponent, DahcModalComponent],
  styles: `
    .dialog-body { display: grid; gap: var(--dahc-space-4); }
    .dialog-text { margin: 0; }
    .dialog-buttons { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: var(--dahc-space-3); }
  `,
  template: `
    <dahc-modal [(open)]="open" [closable]="result() === null" [closeOnBackdrop]="false" [heading]="heading()">
      <div class="dialog-body">
        @if (result(); as outcome) {
          <dahc-alert [variant]="outcome.discrepancy ? 'warning' : 'success'" [announce]="true">{{ outcomeText() }}</dahc-alert>
          @if (outcome.finalPortfolioPoints !== null && outcome.finalPortfolioPoints !== undefined) {
            <p class="dialog-text" i18n="@@portal.scoring.portfolio.finalPoints">Final portfolio points: {{ outcome.finalPortfolioPoints }}. Weighted portfolio score: {{ outcome.weightedPortfolioScore ?? '–' }}.</p>
          }
        } @else {
          <p class="dialog-text" i18n="@@portal.scoring.portfolio.submitText">
            Submit your {{ round() }} scores? Total: {{ facade.total().points }} of {{ facade.totalPossible() }}. You cannot change your scores after you submit.
          </p>
          @if (facade.dirty()) {
            <p class="dialog-text" i18n="@@portal.scoring.portfolio.submitSaves">Your unsaved changes are saved first.</p>
          }
          @if (error() !== '') {
            <dahc-alert variant="error" [announce]="true">{{ error() }}</dahc-alert>
          }
        }
      </div>
      <div dahcDialogFooter class="dialog-buttons">
        @if (result() !== null) {
          <button dahc-button type="button" (click)="finish()" i18n="@@portal.scoring.portfolio.backToPortfolios">Back to my portfolios</button>
        } @else {
          <button dahc-button type="button" variant="secondary" (click)="open.set(false)" i18n="@@portal.action.cancel">Cancel</button>
          <button dahc-button type="button" [loading]="busy()" (click)="submit()" i18n="@@portal.scoring.portfolio.submitConfirm">Submit scores</button>
        }
      </div>
    </dahc-modal>
  `,
})
export class SubmitScoringDialogComponent {
  protected readonly facade = inject(PortfolioScoringFacade);

  readonly open = model<boolean>(false);
  readonly finished = output<void>();

  protected readonly busy = signal<boolean>(false);
  protected readonly error = signal<string>('');
  protected readonly result = signal<PortfolioScoringResult | null>(null);
  private key = crypto.randomUUID();

  protected readonly round = computed<string>(() => {
    const portfolio = this.facade.portfolio();

    return portfolio ? roundLabel(portfolio.round) : '';
  });
  protected readonly heading = computed<string>(() =>
    this.result() === null
      ? $localize`:@@portal.scoring.portfolio.submitHeading:Submit scores`
      : $localize`:@@portal.scoring.portfolio.submittedHeading:Scores submitted`,
  );
  protected readonly outcomeText = computed<string>(() => {
    const outcome = this.result();

    if (!outcome) {
      return '';
    }

    if (outcome.discrepancy) {
      return $localize`:@@portal.scoring.portfolio.outcomeDiscrepancy:Your round is complete. The two rounds differ, so the portfolio goes to a third referee.`;
    }

    if (outcome.portfolioStatus === 'COMPLETE') {
      return $localize`:@@portal.scoring.portfolio.outcomeComplete:Your round is complete and the portfolio score is final.`;
    }

    const status = portfolioStatusDisplay(outcome.portfolioStatus).label;

    return $localize`:@@portal.scoring.portfolio.outcomeRoundComplete:Your round is complete. Portfolio status: ${status}:status:.`;
  });

  constructor() {
    effect(() => {
      if (this.open()) {
        this.key = crypto.randomUUID();
        this.error.set('');
        this.result.set(null);
      }
    });
  }

  protected async submit(): Promise<void> {
    this.busy.set(true);
    this.error.set('');

    try {
      if (this.facade.dirty()) {
        const saved = await this.facade.save();

        if (saved.outcome !== 'saved') {
          this.error.set(saved.problem || $localize`:@@portal.problem.unexpected:Something went wrong. Please try again later.`);

          return;
        }
      }

      this.result.set(await this.facade.submit(this.key));
    } catch (error: unknown) {
      this.error.set(problemText(error));
    } finally {
      this.busy.set(false);
    }
  }

  protected finish(): void {
    this.open.set(false);
    this.finished.emit();
  }
}
