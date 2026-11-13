import { HttpContext } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, LOCALE_ID, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  DahcAlertComponent,
  DahcButtonComponent,
  DahcDetailItem,
  DahcDetailListComponent,
  DahcIconComponent,
  DahcModalComponent,
  DahcNavLink,
  DahcPageHeaderComponent,
} from 'dahc-ui';
import { firstValueFrom } from 'rxjs';

import { Application } from '../../../api/application.models';
import { ApplicationsApiService } from '../../../api/applications-api.service';
import { CandidateActionsApiService } from '../../../api/candidate-actions-api.service';
import { PaymentSession } from '../../../api/candidate-lifecycle.models';
import { isApiProblemError } from '../../../core/api/api-problem-error';
import { DAHC_CALLER_HANDLES_PROBLEMS } from '../../../core/api/api-request';
import { ApiProblemDetails } from '../../../core/api/api.models';
import { SessionService } from '../../../core/auth/session.service';
import { formatDahcDateTime } from '../../../core/locale/date-time.pipe';
import { clearPendingPayment, readPendingPayment } from './pending-payment';

type ReturnState = 'confirming' | 'submitted' | 'failed' | 'unconfirmed' | 'error';

const POLL_ATTEMPTS = 5;
const POLL_INTERVAL_MS = 2000;

/**
 * Where the payment gateway returns the candidate (US-1.3.12, extract §4): the payment session is
 * read until it settles (PENDING or UNKNOWN is never shown as success or failure), a PAID session
 * submits the application, and the Figma success dialog (1:5892) closes the journey. A failed or
 * cancelled payment leaves the application a draft with a retry.
 */
@Component({
  selector: 'dahc-payment-return-page',
  templateUrl: './payment-return-page.component.html',
  styleUrl: './payment-return-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcAlertComponent,
    DahcButtonComponent,
    DahcDetailListComponent,
    DahcIconComponent,
    DahcModalComponent,
    DahcPageHeaderComponent,
    RouterLink,
  ],
})
export class PaymentReturnPageComponent {
  private readonly applicationsApi = inject(ApplicationsApiService);
  private readonly actionsApi = inject(CandidateActionsApiService);
  private readonly router = inject(Router);
  private readonly locale = inject(LOCALE_ID);
  private readonly timeZoneId = inject(SessionService).timeZoneId;

  /** Route parameter and query parameter (component input binding). */
  readonly applicationId = input<string>('');
  readonly paymentSessionId = input<string>('');

  protected readonly state = signal<ReturnState>('confirming');
  protected readonly application = signal<Application | null>(null);
  protected readonly session = signal<PaymentSession | null>(null);
  protected readonly problem = signal<ApiProblemDetails | null>(null);
  protected readonly successOpen = signal<boolean>(false);

  protected readonly breadcrumbs = computed<readonly DahcNavLink[]>(() => [
    { label: $localize`:@@portal.nav.home:Home`, route: '/candidate/dashboard' },
    { label: $localize`:@@portal.nav.applications:My applications`, route: '/candidate/applications' },
    { label: this.application()?.applicationNumber ?? $localize`:@@portal.payment.breadcrumb:Payment` },
  ]);

  protected readonly receipt = computed<readonly DahcDetailItem[]>(() => {
    const application = this.application();
    const session = this.session();

    if (!application) {
      return [];
    }

    const amount = session ? `${session.currency} ${session.amount}` : '';
    return [
      { label: $localize`:@@portal.payment.applicationNumber:Application number`, value: application.applicationNumber },
      { label: $localize`:@@portal.payment.program:Program`, value: application.program.name },
      {
        label: $localize`:@@portal.payment.submittedOn:Submitted on`,
        value: formatDahcDateTime(application.submittedAt, this.locale, this.timeZoneId(), 'date'),
      },
      { label: $localize`:@@portal.payment.receiptNumber:Receipt number`, value: session?.receiptId ?? '' },
      { label: $localize`:@@portal.payment.amountPaid:Amount paid`, value: amount },
      { label: $localize`:@@portal.payment.paymentStatus:Payment status`, value: $localize`:@@portal.pay.paid:Paid` },
    ];
  });

  constructor() {
    effect(() => {
      const applicationId = this.applicationId();
      const paymentSessionId = this.paymentSessionId();

      untracked(() => void this.finish(applicationId, paymentSessionId));
    });
  }

  protected async retry(): Promise<void> {
    await this.finish(this.applicationId(), this.paymentSessionId());
  }

  protected async goToDashboard(): Promise<void> {
    this.successOpen.set(false);
    await this.router.navigate(['/candidate/dashboard']);
  }

  private async finish(applicationIdInput: string, sessionIdInput: string): Promise<void> {
    const pending = readPendingPayment();
    const applicationId = applicationIdInput || pending?.applicationId || '';
    const paymentSessionId = sessionIdInput || (pending?.applicationId === applicationId ? pending.paymentSessionId : '');
    const context = (): HttpContext => new HttpContext().set(DAHC_CALLER_HANDLES_PROBLEMS, true);

    this.state.set('confirming');
    this.problem.set(null);

    try {
      const application = (await firstValueFrom(this.applicationsApi.getApplication(applicationId, context()))).data;
      this.application.set(application);

      if (application.status !== 'DRAFT') {
        if (paymentSessionId) {
          await this.loadSession(applicationId, paymentSessionId, context());
        }

        this.succeed();

        return;
      }

      if (!paymentSessionId) {
        this.state.set('failed');

        return;
      }

      let session = await this.loadSession(applicationId, paymentSessionId, context());

      for (let attempt = 1; attempt < POLL_ATTEMPTS && (session.status === 'PENDING' || session.status === 'UNKNOWN'); attempt++) {
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
        session = await this.loadSession(applicationId, paymentSessionId, context());
      }

      switch (session.status) {
        case 'PAID': {
          const submitted = await firstValueFrom(this.actionsApi.submitApplication(applicationId, paymentSessionId, context()));
          this.application.set(submitted.data);
          this.succeed();
          break;
        }
        case 'FAILED':
        case 'CANCELLED':
          clearPendingPayment();
          this.state.set('failed');
          break;
        default:
          // Still reconciling: never claim success or failure (PAY:58).
          this.state.set('unconfirmed');
      }
    } catch (error: unknown) {
      if (!isApiProblemError(error)) {
        throw error;
      }

      this.problem.set(error.problem);
      this.state.set('error');
    }
  }

  private async loadSession(applicationId: string, paymentSessionId: string, context: HttpContext): Promise<PaymentSession> {
    const session = (await firstValueFrom(this.actionsApi.getPaymentSession(applicationId, paymentSessionId, context))).data;
    this.session.set(session);

    return session;
  }

  private succeed(): void {
    clearPendingPayment();
    this.state.set('submitted');
    this.successOpen.set(true);
  }
}
