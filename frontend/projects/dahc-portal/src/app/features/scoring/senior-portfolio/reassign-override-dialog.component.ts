import { ChangeDetectionStrategy, Component, computed, effect, inject, input, model, output, signal, untracked } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  DahcAlertComponent,
  DahcButtonComponent,
  DahcFormFieldComponent,
  DahcInputDirective,
  DahcModalComponent,
  DahcRadioGroupComponent,
  DahcRadioOption,
  DahcSelectComponent,
  DahcSelectOption,
} from 'dahc-ui';
import { firstValueFrom, map } from 'rxjs';

import { ScoringApiService } from '../../../api/scoring-api.service';
import { ScoringRound } from '../../../api/scoring.models';
import { callerHandlesProblems } from '../../../core/api/api-request';
import { pointsOutOf, problemText, roundLabel } from '../senior-dashboard/senior-labels';

const JUSTIFICATION_MAX = 200;

export type OversightAction = 'REASSIGN' | 'OVERRIDE';

/** Raised when a reassignment or override succeeded, with the message for the toast. */
export interface OversightDone {
  readonly message: string;
}

/**
 * Reassign or override (US-3.2.2). Reassign moves a portfolio in a referee's inbox to an eligible
 * referee of the same pool (the API excludes referees who already scored it or returned it for
 * conflict of interest) and resets its dates. Override replaces a completed round's total in an
 * exceptional case ("X out of Y"); the final and weighted scores are recomputed. Both need a
 * justification of up to 200 characters. The override sends one idempotency key per opening.
 */
@Component({
  selector: 'dahc-reassign-override-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcAlertComponent,
    DahcButtonComponent,
    DahcFormFieldComponent,
    DahcInputDirective,
    DahcModalComponent,
    DahcRadioGroupComponent,
    DahcSelectComponent,
    ReactiveFormsModule,
  ],
  styleUrl: '../senior-dashboard/senior-pages.scss',
  template: `
    <dahc-modal [(open)]="open" i18n-heading="@@portal.scoring.seniorPortfolio.dialogHeading" heading="Reassign or override">
      <form class="dialog-form" (ngSubmit)="submit()" novalidate>
        <p class="dialog-text" i18n="@@portal.scoring.seniorPortfolio.dialogText">Application {{ applicationNumber() }}</p>
        @if (actionOptions().length > 1) {
          <dahc-radio-group
            [formControl]="action"
            i18n-label="@@portal.scoring.seniorPortfolio.action"
            label="Action"
            [required]="true"
            [options]="actionOptions()" />
        }

        @if (currentAction() === 'REASSIGN') {
          <dahc-select
            [formControl]="target"
            i18n-label="@@portal.scoring.seniorPortfolio.targetReferee"
            label="Reassign to"
            i18n-hint="@@portal.scoring.seniorPortfolio.targetHint"
            hint="Referees of the same pool who have not scored this portfolio or returned it for conflict of interest."
            [required]="true"
            [options]="refereeOptions()"
            [invalid]="targetError() !== ''"
            [errorMessage]="targetError()" />
          @if (referees.hasValue() && refereeOptions().length === 0) {
            <dahc-alert variant="warning" i18n="@@portal.scoring.seniorPortfolio.noEligible">No other referee can take this portfolio.</dahc-alert>
          }
        } @else {
          <dahc-select
            [formControl]="round"
            i18n-label="@@portal.scoring.seniorPortfolio.targetRound"
            label="Round to override"
            [required]="true"
            [options]="roundOptions()"
            [invalid]="roundError() !== ''"
            [errorMessage]="roundError()" />
          <dahc-form-field
            i18n-label="@@portal.scoring.seniorPortfolio.newScore"
            label="New score"
            [hint]="scoreHint()"
            [required]="true"
            [invalid]="scoreError() !== ''"
            [error]="scoreError()">
            <input dahcInput type="number" inputmode="decimal" min="0" [attr.max]="totalPossible()" step="1" [formControl]="score" />
          </dahc-form-field>
        }

        <dahc-form-field
          i18n-label="@@portal.scoring.seniorPortfolio.justification"
          label="Justification"
          i18n-hint="@@portal.scoring.seniorPortfolio.justificationHint"
          hint="Up to 200 characters. It is kept in the audit history."
          [required]="true"
          [showCount]="true"
          [invalid]="justificationError() !== ''"
          [error]="justificationError()">
          <textarea dahcInput [formControl]="justification" [attr.maxlength]="justificationMax"></textarea>
        </dahc-form-field>

        @if (error() !== '') {
          <dahc-alert variant="error" [announce]="true">{{ error() }}</dahc-alert>
        }
      </form>
      <div dahcDialogFooter class="dialog-buttons">
        <button dahc-button type="button" variant="secondary" (click)="open.set(false)" i18n="@@portal.action.cancel">Cancel</button>
        <button dahc-button type="button" [loading]="busy()" (click)="submit()">{{ confirmLabel() }}</button>
      </div>
    </dahc-modal>
  `,
})
export class ReassignOverrideDialogComponent {
  private readonly api = inject(ScoringApiService);

  readonly portfolioId = input.required<string>();
  readonly applicationNumber = input<string>('');
  readonly canReassign = input<boolean>(false);
  /** Completed rounds that may be overridden, with their current totals. */
  readonly completedRounds = input<readonly { readonly round: ScoringRound; readonly totalPoints: number | null }[]>([]);
  readonly totalPossible = input<number>(0);
  readonly open = model<boolean>(false);
  readonly completed = output<OversightDone>();

  protected readonly justificationMax = JUSTIFICATION_MAX;
  protected readonly action = new FormControl<string>('REASSIGN', { nonNullable: true });
  protected readonly target = new FormControl<string>('', { nonNullable: true });
  protected readonly round = new FormControl<string>('', { nonNullable: true });
  protected readonly score = new FormControl<number | null>(null);
  protected readonly justification = new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(JUSTIFICATION_MAX)] });
  protected readonly busy = signal<boolean>(false);
  protected readonly error = signal<string>('');
  protected readonly attempted = signal<boolean>(false);

  private readonly actionValue = toSignal(this.action.valueChanges, { initialValue: 'REASSIGN' });
  private readonly targetValue = toSignal(this.target.valueChanges, { initialValue: '' });
  private readonly roundValue = toSignal(this.round.valueChanges, { initialValue: '' });
  private readonly scoreValue = toSignal(this.score.valueChanges, { initialValue: null });
  private readonly justificationValue = toSignal(this.justification.valueChanges, { initialValue: '' });
  private idempotencyKey = crypto.randomUUID();

  protected readonly actionOptions = computed<readonly DahcRadioOption[]>(() => [
    ...(this.canReassign() ? [{ value: 'REASSIGN', label: $localize`:@@portal.scoring.seniorPortfolio.actionReassign:Reassign` }] : []),
    ...(this.completedRounds().length > 0 ? [{ value: 'OVERRIDE', label: $localize`:@@portal.scoring.seniorPortfolio.actionOverride:Override score` }] : []),
  ]);

  protected readonly currentAction = computed<OversightAction>(() => {
    const options = this.actionOptions();

    if (options.length === 1) {
      return options[0]?.value === 'OVERRIDE' ? 'OVERRIDE' : 'REASSIGN';
    }

    return this.actionValue() === 'OVERRIDE' ? 'OVERRIDE' : 'REASSIGN';
  });

  protected readonly referees = rxResource({
    params: () => (this.open() && this.canReassign() ? this.portfolioId() : undefined),
    stream: ({ params }) => this.api.listEligibleReferees(params).pipe(map(result => result.data)),
  });

  protected readonly refereeOptions = computed<readonly DahcSelectOption[]>(() =>
    (this.referees.hasValue() ? this.referees.value() : []).map(referee => ({
      value: referee.userId,
      label:
        referee.activeAssignments === undefined
          ? referee.displayName
          : $localize`:@@portal.scoring.seniorPortfolio.refereeOption:${referee.displayName}:name: (${referee.activeAssignments}:count: in progress)`,
    })),
  );

  protected readonly roundOptions = computed<readonly DahcSelectOption[]>(() =>
    this.completedRounds().map(entry => ({
      value: entry.round,
      label: $localize`:@@portal.scoring.seniorPortfolio.roundOption:${roundLabel(entry.round)}:round: (now ${pointsOutOf(entry.totalPoints, this.totalPossible())}:points:)`,
    })),
  );

  protected readonly scoreHint = computed<string>(
    () => $localize`:@@portal.scoring.seniorPortfolio.scoreHint:A whole number from 0 to ${this.totalPossible()}:total:, shown as "X out of ${this.totalPossible()}:total:".`,
  );

  protected readonly confirmLabel = computed<string>(() =>
    this.currentAction() === 'REASSIGN'
      ? $localize`:@@portal.scoring.seniorPortfolio.confirmReassign:Reassign`
      : $localize`:@@portal.scoring.seniorPortfolio.confirmOverride:Override score`,
  );

  protected readonly targetError = computed<string>(() => {
    this.targetValue();

    return this.attempted() && this.target.value === '' ? $localize`:@@portal.scoring.seniorPortfolio.targetRequired:Choose the referee to reassign to.` : '';
  });

  protected readonly roundError = computed<string>(() => {
    this.roundValue();

    return this.attempted() && this.round.value === '' ? $localize`:@@portal.scoring.seniorPortfolio.roundRequired:Choose the round to override.` : '';
  });

  protected readonly scoreError = computed<string>(() => {
    const value = this.scoreValue();

    if (!this.attempted()) {
      return '';
    }

    if (value === null || Number.isNaN(value)) {
      return $localize`:@@portal.scoring.seniorPortfolio.scoreRequired:Enter the new score.`;
    }

    return value < 0 || value > this.totalPossible() || !Number.isInteger(value)
      ? $localize`:@@portal.scoring.seniorPortfolio.scoreRange:Enter a whole number from 0 to ${this.totalPossible()}:total:.`
      : '';
  });

  protected readonly justificationError = computed<string>(() => {
    this.justificationValue();

    if (!this.attempted()) {
      return '';
    }

    return this.justification.value.trim() === '' ? $localize`:@@portal.error.required:This field is required.` : '';
  });

  constructor() {
    effect(() => {
      if (this.open()) {
        untracked(() => {
          this.idempotencyKey = crypto.randomUUID();
          this.action.reset(this.canReassign() ? 'REASSIGN' : 'OVERRIDE');
          this.target.reset('');
          this.round.reset(this.completedRounds().length === 1 ? (this.completedRounds()[0]?.round ?? '') : '');
          this.score.reset(null);
          this.justification.reset('');
          this.attempted.set(false);
          this.error.set('');
        });
      }
    });
  }

  protected async submit(): Promise<void> {
    this.attempted.set(true);
    const reassign = this.currentAction() === 'REASSIGN';
    const justification = this.justification.value.trim();
    const invalid = reassign ? this.targetError() !== '' : this.roundError() !== '' || this.scoreError() !== '';

    if (invalid || this.justificationError() !== '' || justification.length > JUSTIFICATION_MAX) {
      return;
    }

    this.busy.set(true);
    this.error.set('');

    try {
      if (reassign) {
        await firstValueFrom(this.api.reassignPortfolio(this.portfolioId(), this.target.value, justification, callerHandlesProblems()));
        const name = this.refereeOptions().find(option => option.value === this.target.value)?.label ?? '';
        this.completed.emit({ message: $localize`:@@portal.scoring.seniorPortfolio.reassigned:Portfolio reassigned to ${name}:name:.` });
      } else {
        const result = await firstValueFrom(
          this.api.overrideRoundScore(
            this.portfolioId(),
            { round: this.round.value as ScoringRound, newTotalPoints: this.score.value ?? 0, justification, confirmed: true },
            this.idempotencyKey,
            callerHandlesProblems(),
          ),
        );
        const final = pointsOutOf(result.data.finalPortfolioPoints, this.totalPossible());
        const weighted = result.data.weightedPortfolioScore === null || result.data.weightedPortfolioScore === undefined ? '–' : result.data.weightedPortfolioScore.toFixed(2);
        this.completed.emit({
          message: $localize`:@@portal.scoring.seniorPortfolio.overridden:Score overridden. Final portfolio points: ${final}:final:; weighted score: ${weighted}:weighted:.`,
        });
      }

      this.open.set(false);
    } catch (error: unknown) {
      this.error.set(problemText(error));
    } finally {
      this.busy.set(false);
    }
  }
}
