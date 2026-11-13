import { HttpContext } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  LOCALE_ID,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  DahcAlertComponent,
  DahcButtonComponent,
  DahcDetailItem,
  DahcDetailListComponent,
  DahcModalComponent,
  DahcTagComponent,
} from 'dahc-ui';
import { firstValueFrom } from 'rxjs';

import { CandidateActionsApiService } from '../../../../../api/candidate-actions-api.service';
import { isApiProblemError } from '../../../../../core/api/api-problem-error';
import { DAHC_CALLER_HANDLES_PROBLEMS } from '../../../../../core/api/api-request';
import { ApiProblemDetails } from '../../../../../core/api/api.models';
import { SessionService } from '../../../../../core/auth/session.service';
import { formatDahcDateTime } from '../../../../../core/locale/date-time.pipe';
import { applicationStatusDisplay } from '../../../../../shared/application-status';
import { WizardGroupId, WizardStepId, groupLabel, stepGroup } from '../../../../../shared/program-rules';
import { savePendingPayment } from '../../../payment/pending-payment';
import { WizardStateService } from '../../wizard-state.service';

interface ChecklistRow {
  readonly group: WizardGroupId;
  readonly label: string;
  readonly complete: boolean;
  /** The first incomplete page of the group, to go back to it. */
  readonly firstIncomplete: WizardStepId | null;
}

/**
 * Review, Pay & Submit (Figma 1:5351, US-1.3.12): summary, the section checklist, and the hand-off
 * to the payment gateway once every section is complete. The server validates again when the
 * payment session is created (422 lists what is missing).
 */
@Component({
  selector: 'dahc-pay-and-submit-step',
  templateUrl: './pay-and-submit-step.component.html',
  styleUrls: ['../step.scss', './pay-and-submit-step.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcAlertComponent, DahcButtonComponent, DahcDetailListComponent, DahcModalComponent, DahcTagComponent],
})
export class PayAndSubmitStepComponent {
  private readonly api = inject(CandidateActionsApiService);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly locale = inject(LOCALE_ID);
  private readonly timeZoneId = inject(SessionService).timeZoneId;
  /** One key per payment attempt: a retry of the same attempt returns the same session. */
  private idempotencyKey = crypto.randomUUID();
  private readonly incompleteAlert = viewChild<ElementRef<HTMLElement>>('incompleteAlert');

  protected readonly state = inject(WizardStateService);
  protected readonly confirmOpen = signal<boolean>(false);
  protected readonly paying = signal<boolean>(false);
  protected readonly showIncomplete = signal<boolean>(false);
  protected readonly problem = signal<ApiProblemDetails | null>(null);

  protected readonly fee = computed<string>(() => `AED ${this.state.rules()?.feeAed ?? '—'}`);
  protected readonly submitted = computed<boolean>(() => (this.state.application()?.status ?? 'DRAFT') !== 'DRAFT');

  protected readonly summary = computed<readonly DahcDetailItem[]>(() => {
    const application = this.state.application();

    if (!application) {
      return [];
    }

    const date = (value: string | null | undefined): string => formatDahcDateTime(value, this.locale, this.timeZoneId(), 'date');

    return [
      { label: $localize`:@@portal.pay.applicationNumber:Application number`, value: application.applicationNumber },
      { label: $localize`:@@portal.pay.created:Created`, value: date(application.createdAt) },
      { label: $localize`:@@portal.pay.status:Status`, value: applicationStatusDisplay(application.status).label },
      { label: $localize`:@@portal.pay.billAmount:Bill amount`, value: this.fee() },
      {
        label: $localize`:@@portal.pay.billStatus:Bill status`,
        value: this.submitted() ? $localize`:@@portal.pay.paid:Paid` : $localize`:@@portal.pay.unpaid:Unpaid`,
      },
      { label: $localize`:@@portal.pay.submittedOn:Submitted on`, value: date(application.submittedAt) || '—' },
    ];
  });

  protected readonly checklist = computed<readonly ChecklistRow[]>(() => {
    const incomplete = this.state.incompleteSteps();
    const steps = this.state.steps();

    return this.state
      .groups()
      .filter(group => group !== 'pay-and-submit')
      .map(group => {
        const pages = steps.filter(step => stepGroup(step) === group);
        const firstIncomplete = pages.find(page => incomplete.includes(page)) ?? null;

        return { group, label: groupLabel(group), complete: firstIncomplete === null, firstIncomplete };
      });
  });

  protected readonly incompleteRows = computed<readonly ChecklistRow[]>(() => this.checklist().filter(row => !row.complete));

  constructor() {
    effect(() => {
      const paying = this.paying();
      const active = this.state.mode() === 'edit' && !this.submitted();

      untracked(() =>
        this.state.primaryAction.set(
          active
            ? {
                label: $localize`:@@portal.pay.payAndSubmit:Pay & Submit`,
                loading: paying,
                disabled: false,
                run: () => this.requestPayment(),
              }
            : null,
        ),
      );
    });

    inject(DestroyRef).onDestroy(() => this.state.primaryAction.set(null));
  }

  protected async completeStep(step: WizardStepId): Promise<void> {
    this.state.check(step);
    await this.state.goTo(step);
  }

  protected requestPayment(): void {
    this.problem.set(null);
    const incomplete = this.state.incompleteSteps();

    if (incomplete.length > 0) {
      incomplete.forEach(step => this.state.check(step));
      this.showIncomplete.set(true);
      // Move focus to the list of what is missing once it is rendered.
      setTimeout(() => this.incompleteAlert()?.nativeElement.focus());

      return;
    }

    this.showIncomplete.set(false);
    this.confirmOpen.set(true);
  }

  protected async pay(): Promise<void> {
    const application = this.state.application();

    if (!application) {
      return;
    }

    this.paying.set(true);

    try {
      if (!(await this.state.saveAll())) {
        this.confirmOpen.set(false);

        return;
      }

      const context = new HttpContext().set(DAHC_CALLER_HANDLES_PROBLEMS, true);
      const session = (await firstValueFrom(this.api.createPaymentSession(application.id, this.idempotencyKey, context))).data;
      savePendingPayment({ applicationId: application.id, paymentSessionId: session.id });

      if (session.status === 'PAID' || !session.checkoutUrl) {
        // Paid earlier but not submitted yet: finish the submission on the return page.
        await this.router.navigate(['/candidate/applications', application.id, 'payment-return'], {
          queryParams: { paymentSessionId: session.id },
        });

        return;
      }

      this.document.location.assign(session.checkoutUrl);
    } catch (error: unknown) {
      this.confirmOpen.set(false);
      this.idempotencyKey = crypto.randomUUID();

      if (!isApiProblemError(error)) {
        throw error;
      }

      this.problem.set(error.problem);
    } finally {
      this.paying.set(false);
    }
  }
}
