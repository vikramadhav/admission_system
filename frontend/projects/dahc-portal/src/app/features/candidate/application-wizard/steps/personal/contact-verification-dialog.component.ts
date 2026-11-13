import { HttpContext } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DahcAlertComponent, DahcButtonComponent, DahcFormFieldComponent, DahcInputDirective, DahcModalComponent } from 'dahc-ui';
import { firstValueFrom } from 'rxjs';

import { CandidateActionsApiService } from '../../../../../api/candidate-actions-api.service';
import { ContactVerification, OtpChannel } from '../../../../../api/candidate-lifecycle.models';
import { isApiProblemError } from '../../../../../core/api/api-problem-error';
import { DAHC_CALLER_HANDLES_PROBLEMS } from '../../../../../core/api/api-request';

const callerHandles = (): HttpContext => new HttpContext().set(DAHC_CALLER_HANDLES_PROBLEMS, true);

/**
 * Verifies a changed contact e-mail or mobile with a one-time code (US-1.3.3 AC11, CL:1381-1570):
 * the code is sent when the dialog opens, can be sent again after the cooldown, and is confirmed here.
 */
@Component({
  selector: 'dahc-contact-verification-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcAlertComponent, DahcButtonComponent, DahcFormFieldComponent, DahcInputDirective, DahcModalComponent, FormsModule],
  styles: `
    .otp { display: grid; gap: var(--dahc-space-4); }
    .otp-text { margin: 0; }
    .otp-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: var(--dahc-space-3); }
  `,
  template: `
    <dahc-modal [(open)]="open" size="sm" [heading]="heading()" (opened)="start()">
      <div class="otp">
        @if (problem() !== '') {
          <dahc-alert variant="error" [announce]="true">{{ problem() }}</dahc-alert>
        }
        @if (challenge(); as current) {
          <p class="otp-text" i18n="@@portal.personal.otpSent">We sent a one-time code to {{ current.destination.maskedValue }}. Enter it below.</p>
          <dahc-form-field i18n-label="@@portal.personal.otpCode" label="One-time code" [required]="true">
            <input
              dahcInput
              type="text"
              inputmode="numeric"
              autocomplete="one-time-code"
              maxlength="12"
              dir="ltr"
              [ngModel]="code()"
              (ngModelChange)="code.set($event)" />
          </dahc-form-field>
          <p class="otp-text" aria-live="polite">
            @if (secondsUntilResend() > 0) {
              <span i18n="@@portal.personal.otpResendIn">You can ask for a new code in {{ secondsUntilResend() }} seconds.</span>
            }
          </p>
        } @else if (busy()) {
          <p class="otp-text" role="status" i18n="@@portal.personal.otpSending">Sending the code…</p>
        }
      </div>
      <div dahcDialogFooter class="otp-actions">
        <button dahc-button type="button" variant="secondary" [disabled]="busy() || secondsUntilResend() > 0" (click)="resend()" i18n="@@portal.personal.otpResend">
          Resend code
        </button>
        <button dahc-button type="button" [loading]="busy()" [disabled]="!challenge() || code().trim().length < 4" (click)="confirm()" i18n="@@portal.personal.otpConfirm">
          Verify
        </button>
      </div>
    </dahc-modal>
  `,
})
export class ContactVerificationDialogComponent {
  private readonly api = inject(CandidateActionsApiService);
  private readonly now = signal<number>(Date.now());

  readonly applicationId = input.required<string>();
  readonly channel = input.required<OtpChannel>();
  readonly value = input.required<string>();
  readonly open = model<boolean>(false);
  /** Emits the verified value. */
  readonly verified = output<string>();

  protected readonly challenge = signal<ContactVerification | null>(null);
  protected readonly code = signal<string>('');
  protected readonly busy = signal<boolean>(false);
  protected readonly problem = signal<string>('');

  protected readonly heading = computed<string>(() =>
    this.channel() === 'EMAIL'
      ? $localize`:@@portal.personal.verifyEmailHeading:Verify your contact e-mail`
      : $localize`:@@portal.personal.verifyMobileHeading:Verify your contact mobile number`,
  );

  protected readonly secondsUntilResend = computed<number>(() => {
    const available = this.challenge()?.resendAvailableAt;

    return available ? Math.max(0, Math.ceil((Date.parse(available) - this.now()) / 1000)) : 0;
  });

  constructor() {
    const timer = setInterval(() => this.now.set(Date.now()), 1000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  protected async start(): Promise<void> {
    this.challenge.set(null);
    this.code.set('');
    this.problem.set('');
    await this.send(() =>
      firstValueFrom(this.api.startContactVerification(this.applicationId(), { channel: this.channel(), value: this.value() }, callerHandles())),
    );
  }

  protected async resend(): Promise<void> {
    const current = this.challenge();

    if (current) {
      await this.send(() => firstValueFrom(this.api.resendContactVerificationOtp(this.applicationId(), current.verificationId, callerHandles())));
    } else {
      await this.start();
    }
  }

  protected async confirm(): Promise<void> {
    const current = this.challenge();

    if (!current) {
      return;
    }

    this.busy.set(true);
    this.problem.set('');

    try {
      await firstValueFrom(this.api.confirmContactVerification(this.applicationId(), current.verificationId, this.code().trim(), callerHandles()));
      this.verified.emit(this.value());
      this.open.set(false);
    } catch (error: unknown) {
      this.problem.set(this.messageFor(error));
    } finally {
      this.busy.set(false);
    }
  }

  private async send(request: () => Promise<{ data: ContactVerification }>): Promise<void> {
    this.busy.set(true);
    this.problem.set('');

    try {
      this.challenge.set((await request()).data);
    } catch (error: unknown) {
      this.problem.set(this.messageFor(error));
    } finally {
      this.busy.set(false);
    }
  }

  private messageFor(error: unknown): string {
    if (!isApiProblemError(error)) {
      return $localize`:@@portal.personal.otpFailed:Something went wrong. Please try again.`;
    }

    switch (error.problem.code) {
      case 'otp.invalid':
        return $localize`:@@portal.personal.otpInvalid:The code is not correct. Check it and try again.`;
      case 'otp.expired':
        return $localize`:@@portal.personal.otpExpired:This code has expired. Ask for a new code.`;
      default:
        return error.problem.detail ?? error.problem.title;
    }
  }
}
