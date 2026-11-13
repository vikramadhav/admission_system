import { ChangeDetectionStrategy, Component, LOCALE_ID, computed, effect, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  DahcAlertComponent,
  DahcButtonComponent,
  DahcCardComponent,
  DahcCheckboxComponent,
  DahcDetailItem,
  DahcDetailListComponent,
  DahcEmptyStateComponent,
  DahcFormFieldComponent,
  DahcInputDirective,
  DahcModalComponent,
  DahcNavLink,
  DahcPageHeaderComponent,
  DahcTagComponent,
  DahcToastService,
} from 'dahc-ui';
import { firstValueFrom, map } from 'rxjs';

import { CandidateActionsApiService } from '../../../api/candidate-actions-api.service';
import { CandidatePortfolioResult, PortfolioResultQuestion } from '../../../api/candidate-lifecycle.models';
import { SessionService } from '../../../core/auth/session.service';
import { formatDahcDateTime } from '../../../core/locale/date-time.pipe';
import { actionProblemCode, actionProblemText } from '../actions/action-support';
import { callerHandlesProblems } from '../../../core/api/api-request';

const MAX_RESPONSE = 200;
const NOT_ANNOUNCED = 'portfolio.scores_not_announced';

type AppealGroup = FormGroup<{ selected: FormControl<boolean>; response: FormControl<string> }>;

/**
 * Announced portfolio result and the one-time appeal (US-1.2.7, US-4.3.2): awarded points and
 * referee comments per question; inside the window the candidate flags questions and explains why
 * (at most 200 characters each), confirms, and submits. No new attachments.
 */
@Component({
  selector: 'dahc-portfolio-result-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcAlertComponent,
    DahcButtonComponent,
    DahcCardComponent,
    DahcCheckboxComponent,
    DahcDetailListComponent,
    DahcEmptyStateComponent,
    DahcFormFieldComponent,
    DahcInputDirective,
    DahcModalComponent,
    DahcPageHeaderComponent,
    DahcTagComponent,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './portfolio-result-page.component.html',
  styleUrl: './portfolio-result-page.component.scss',
})
export class PortfolioResultPageComponent {
  private readonly actionsApi = inject(CandidateActionsApiService);
  private readonly toasts = inject(DahcToastService);
  private readonly sessions = inject(SessionService);
  private readonly locale = inject(LOCALE_ID);

  readonly applicationId = input.required<string>();

  protected readonly maxResponse = MAX_RESPONSE;
  protected readonly breadcrumbs: readonly DahcNavLink[] = [
    { label: $localize`:@@portal.nav.home:Home`, route: '/candidate/dashboard' },
    { label: $localize`:@@portal.nav.applications:My applications`, route: '/candidate/applications' },
    { label: $localize`:@@portal.result.breadcrumb:Portfolio result` },
  ];

  protected readonly result = rxResource({
    params: () => this.applicationId(),
    stream: ({ params }) => this.actionsApi.getPortfolioResult(params, callerHandlesProblems()).pipe(map(response => response.data)),
  });

  protected readonly data = computed<CandidatePortfolioResult | null>(() => (this.result.hasValue() ? this.result.value() : null));
  protected readonly notAnnounced = computed<boolean>(() => actionProblemCode(this.result.error()) === NOT_ANNOUNCED);
  protected readonly appealOpen = computed<boolean>(() => this.data()?.appeal.status === 'OPEN');

  protected readonly groups = computed<ReadonlyMap<string, AppealGroup>>(() => {
    const groups = new Map<string, AppealGroup>();

    for (const question of this.data()?.questions ?? []) {
      if (question.appealable) {
        groups.set(
          question.questionId,
          new FormGroup({
            selected: new FormControl<boolean>(false, { nonNullable: true }),
            response: new FormControl<string>('', { nonNullable: true, validators: [Validators.maxLength(MAX_RESPONSE)] }),
          }),
        );
      }
    }

    return groups;
  });

  /** Bumped on every change of an appeal choice, so the computed choices re-read the forms. */
  private readonly formTick = signal<number>(0);

  private readonly appealValues = computed<readonly AppealChoice[]>(() => {
    this.formTick();

    return [...this.groups().entries()].map(([questionId, group]) => ({
      questionId,
      selected: group.controls.selected.value,
      response: group.controls.response.value,
    }));
  });

  protected readonly chosen = computed<readonly AppealChoice[]>(() => this.appealValues().filter(choice => choice.selected));

  protected readonly summary = computed<readonly DahcDetailItem[]>(() => {
    const data = this.data();

    if (!data) {
      return [];
    }

    const format = new Intl.NumberFormat(this.locale, { maximumFractionDigits: 2 });

    return [
      { label: $localize`:@@portal.result.applicationNumber:Application number`, value: data.applicationNumber },
      { label: $localize`:@@portal.result.announcedAt:Announced on`, value: this.dateTime(data.announcedAt) },
      { label: $localize`:@@portal.result.finalPoints:Final portfolio points`, value: format.format(data.finalPortfolioPoints) },
      { label: $localize`:@@portal.result.portfolioScore:Portfolio score`, value: format.format(data.portfolioScore) },
    ];
  });

  protected readonly appealDeadline = computed<string>(() => this.dateTime(this.data()?.appeal.deadline));
  protected readonly appealSubmittedAt = computed<string>(() => this.dateTime(this.data()?.appeal.submittedAt));

  protected readonly attempted = signal<boolean>(false);
  protected readonly confirming = signal<boolean>(false);
  protected readonly busy = signal<boolean>(false);
  protected readonly error = signal<string>('');

  constructor() {
    effect(onCleanup => {
      const subscriptions = [...this.groups().values()].map(group =>
        group.valueChanges.subscribe(() => this.formTick.update(value => value + 1)),
      );
      onCleanup(() => subscriptions.forEach(subscription => subscription.unsubscribe()));
    });
  }

  protected group(questionId: string): AppealGroup | null {
    return this.groups().get(questionId) ?? null;
  }

  protected responseError(questionId: string): string {
    const choice = this.appealValues().find(item => item.questionId === questionId);

    if (!choice?.selected) {
      return '';
    }

    if (choice.response.trim() === '' && this.attempted()) {
      return $localize`:@@portal.result.responseRequired:Explain why you are appealing this question.`;
    }

    return choice.response.length > MAX_RESPONSE
      ? $localize`:@@portal.error.maxlength:Enter no more than ${MAX_RESPONSE}:length: characters.`
      : '';
  }

  protected selectionError(): string {
    return this.attempted() && this.chosen().length === 0
      ? $localize`:@@portal.result.selectQuestion:Select at least one question to appeal.`
      : '';
  }

  protected answerLabel(question: PortfolioResultQuestion): string {
    return question.candidateAnswer === 'YES'
      ? $localize`:@@portal.option.yes:Yes`
      : $localize`:@@portal.option.no:No`;
  }

  protected questionNumber(index: number): string {
    return $localize`:@@portal.result.questionNumber:Question ${index + 1}:number:`;
  }

  protected review(): void {
    this.attempted.set(true);
    const choices = this.chosen();

    if (choices.length === 0 || choices.some(choice => this.responseError(choice.questionId) !== '' || choice.response.trim() === '')) {
      return;
    }

    this.error.set('');
    this.confirming.set(true);
  }

  protected prompt(questionId: string): string {
    return this.data()?.questions.find(question => question.questionId === questionId)?.prompt ?? questionId;
  }

  protected async submit(): Promise<void> {
    this.busy.set(true);
    this.error.set('');

    try {
      await firstValueFrom(
        this.actionsApi.submitAppeal(this.applicationId(), {
          responses: this.chosen().map(choice => ({ questionId: choice.questionId, response: choice.response.trim() })),
          confirmed: true,
        }, callerHandlesProblems()),
      );
      this.confirming.set(false);
      this.attempted.set(false);
      this.toasts.show({
        variant: 'success',
        heading: $localize`:@@portal.result.appealSent:Your appeal was submitted.`,
        message: $localize`:@@portal.result.appealSentText:The appealed questions will be evaluated again. You will be notified of the result.`,
      });
      this.result.reload();
    } catch (error: unknown) {
      this.error.set(actionProblemText(error));
    } finally {
      this.busy.set(false);
    }
  }

  private dateTime(value: string | null | undefined): string {
    return formatDahcDateTime(value, this.locale, this.sessions.timeZoneId(), 'dateTime');
  }
}

interface AppealChoice {
  readonly questionId: string;
  readonly selected: boolean;
  readonly response: string;
}
