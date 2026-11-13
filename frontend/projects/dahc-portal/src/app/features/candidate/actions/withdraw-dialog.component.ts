import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, input, model, output, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  DahcAlertComponent,
  DahcButtonComponent,
  DahcFormFieldComponent,
  DahcInputDirective,
  DahcModalComponent,
  DahcSelectComponent,
  DahcSelectOption,
  DahcToastService,
} from 'dahc-ui';
import { firstValueFrom, map, startWith } from 'rxjs';

import { CandidateActionsApiService } from '../../../api/candidate-actions-api.service';
import { WithdrawalChallenge } from '../../../api/candidate-lifecycle.models';
import { actionProblemCode, actionProblemText, meaningfulReason, reasonErrorText, secondsUntil } from './action-support';
import { callerHandlesProblems } from '../../../core/api/api-request';

const OTHER = 'OTHER';

type Step = 'reason' | 'code';

/**
 * Withdrawal (US-1.2.4): reason, then the one-time code sent to the registered e-mail and
 * mobile, with Resend after the cooldown. The fee is non-refundable (note 4).
 */
@Component({
  selector: 'dahc-withdraw-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcAlertComponent,
    DahcButtonComponent,
    DahcFormFieldComponent,
    DahcInputDirective,
    DahcModalComponent,
    DahcSelectComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './withdraw-dialog.component.html',
  styleUrl: './actions.scss',
})
export class WithdrawDialogComponent {
  private readonly actionsApi = inject(CandidateActionsApiService);
  private readonly toasts = inject(DahcToastService);

  readonly applicationId = input.required<string>();
  readonly applicationNumber = input<string>('');
  readonly open = model<boolean>(false);
  readonly completed = output<void>();

  protected readonly step = signal<Step>('reason');
  protected readonly busy = signal<boolean>(false);
  protected readonly error = signal<string>('');
  protected readonly attempted = signal<boolean>(false);
  protected readonly challenge = signal<WithdrawalChallenge | null>(null);
  protected readonly now = signal<number>(Date.now());

  protected readonly reasonCode = new FormControl<string>('', { nonNullable: true, validators: [Validators.required] });
  protected readonly otherReason = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.maxLength(500), meaningfulReason],
  });
  protected readonly otp = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(/^\d{4,12}$/)],
  });

  private readonly reasonValue = toSignal(this.reasonCode.valueChanges.pipe(startWith(this.reasonCode.value)), {
    initialValue: '',
  });
  protected readonly isOther = computed<boolean>(() => this.reasonValue() === OTHER);

  protected readonly reasons = rxResource({
    params: () => (this.open() ? true : undefined),
    stream: () => this.actionsApi.listWithdrawalReasons(callerHandlesProblems()).pipe(map(result => result.data)),
  });

  protected readonly reasonOptions = computed<readonly DahcSelectOption[]>(() =>
    this.reasons.hasValue()
      ? [...this.reasons.value()]
          .filter(item => item.active)
          .sort((first, second) => first.sortOrder - second.sortOrder)
          .map(item => ({ value: item.code, label: item.label }))
      : [],
  );

  protected readonly resendIn = computed<number>(() => {
    const challenge = this.challenge();

    return challenge ? secondsUntil(challenge.resendAvailableAt, this.now()) : 0;
  });

  protected readonly destinations = computed<string>(() =>
    (this.challenge()?.destinations ?? []).map(destination => destination.maskedValue).join(', '),
  );

  constructor() {
    effect(() => {
      if (this.open()) {
        this.step.set('reason');
        this.reasonCode.reset('');
        this.otherReason.reset('');
        this.otp.reset('');
        this.challenge.set(null);
        this.attempted.set(false);
        this.error.set('');
      }
    });

    const timer = setInterval(() => {
      if (this.challenge() !== null) {
        this.now.set(Date.now());
      }
    }, 1000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  protected reasonError(): string {
    return reasonErrorText(this.reasonCode, this.attempted());
  }

  protected otherError(): string {
    return reasonErrorText(this.otherReason, this.attempted());
  }

  protected otpError(): string {
    if (!(this.otp.touched || this.attempted()) || !this.otp.errors) {
      return '';
    }

    return this.otp.errors['required']
      ? $localize`:@@portal.withdraw.codeRequired:Enter the code we sent you.`
      : $localize`:@@portal.withdraw.codeFormat:Enter the code using numbers only.`;
  }

  protected async sendCode(): Promise<void> {
    this.attempted.set(true);
    this.reasonCode.markAsTouched();
    this.otherReason.markAsTouched();
    const other = this.isOther();

    if (this.reasonCode.invalid || (other && (this.otherReason.value.trim() === '' || this.otherReason.invalid))) {
      if (other && this.otherReason.value.trim() === '') {
        this.otherReason.setErrors({ required: true });
      }

      return;
    }

    await this.run(async () => {
      const result = await firstValueFrom(
        this.actionsApi.startWithdrawal(this.applicationId(), {
          reasonCode: this.reasonCode.value,
          ...(other ? { otherReason: this.otherReason.value.trim() } : {}),
        }, callerHandlesProblems()),
      );
      this.challenge.set(result.data);
      this.now.set(Date.now());
      this.attempted.set(false);
      this.step.set('code');
    });
  }

  protected async resend(): Promise<void> {
    const challenge = this.challenge();

    if (!challenge || this.resendIn() > 0) {
      return;
    }

    await this.run(async () => {
      const result = await firstValueFrom(this.actionsApi.resendWithdrawalOtp(this.applicationId(), challenge.requestId, callerHandlesProblems()));
      this.challenge.set({ ...challenge, ...result.data });
      this.now.set(Date.now());
      this.toasts.show({ variant: 'info', heading: $localize`:@@portal.withdraw.resent:A new code was sent.` });
    });
  }

  protected async confirm(): Promise<void> {
    const challenge = this.challenge();
    this.attempted.set(true);
    this.otp.markAsTouched();

    if (!challenge || this.otp.invalid) {
      return;
    }

    await this.run(async () => {
      await firstValueFrom(this.actionsApi.confirmWithdrawal(this.applicationId(), challenge.requestId, this.otp.value, callerHandlesProblems()));
      this.toasts.show({
        variant: 'success',
        heading: $localize`:@@portal.withdraw.done:Your application was withdrawn.`,
        message: $localize`:@@portal.withdraw.doneText:We have sent you a confirmation by e-mail.`,
      });
      this.open.set(false);
      this.completed.emit();
    });
  }

  private async run(action: () => Promise<void>): Promise<void> {
    this.busy.set(true);
    this.error.set('');

    try {
      await action();
    } catch (error: unknown) {
      const code = actionProblemCode(error);
      this.error.set(
        code === 'otp.invalid'
          ? $localize`:@@portal.withdraw.codeInvalid:The code is not correct. Check it and try again.`
          : code === 'otp.expired'
            ? $localize`:@@portal.withdraw.codeExpired:This code has expired. Send a new code.`
            : actionProblemText(error),
      );
    } finally {
      this.busy.set(false);
    }
  }
}
