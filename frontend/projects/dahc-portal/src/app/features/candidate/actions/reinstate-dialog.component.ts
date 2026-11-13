import { ChangeDetectionStrategy, Component, effect, inject, input, model, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  DahcAlertComponent,
  DahcButtonComponent,
  DahcFormFieldComponent,
  DahcInputDirective,
  DahcModalComponent,
  DahcToastService,
} from 'dahc-ui';
import { firstValueFrom } from 'rxjs';

import { ApplicationsApiService } from '../../../api/applications-api.service';
import { actionProblemText, meaningfulReason, reasonErrorText } from './action-support';
import { callerHandlesProblems } from '../../../core/api/api-request';

const MAX_LENGTH = 1000;

/** Requests reinstatement of a withdrawn application (US-1.2.5); a supervisor decides. */
@Component({
  selector: 'dahc-reinstate-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcAlertComponent, DahcButtonComponent, DahcFormFieldComponent, DahcInputDirective, DahcModalComponent, ReactiveFormsModule],
  styleUrl: './actions.scss',
  template: `
    <dahc-modal [(open)]="open" i18n-heading="@@portal.reinstate.heading" heading="Request reinstatement">
      <form class="action-form" (ngSubmit)="submit()" novalidate>
        <p class="action-text" i18n="@@portal.reinstate.text">
          Tell the admissions team why application {{ applicationNumber() }} should be reinstated. A supervisor reviews your request and
          you will receive the decision by e-mail.
        </p>
        <dahc-form-field
          i18n-label="@@portal.reinstate.justification"
          label="Justification"
          [required]="true"
          i18n-hint="@@portal.reinstate.hint"
          hint="Up to 1000 characters."
          [invalid]="errorText() !== ''"
          [error]="errorText()">
          <textarea dahcInput [formControl]="justification" [attr.maxlength]="maxLength"></textarea>
        </dahc-form-field>
        @if (error() !== '') {
          <dahc-alert variant="error" [announce]="true">{{ error() }}</dahc-alert>
        }
      </form>
      <div dahcDialogFooter class="action-buttons">
        <button dahc-button type="button" variant="secondary" (click)="open.set(false)" i18n="@@portal.action.cancel">Cancel</button>
        <button dahc-button type="button" [loading]="busy()" (click)="submit()" i18n="@@portal.reinstate.submit">Send request</button>
      </div>
    </dahc-modal>
  `,
})
export class ReinstateDialogComponent {
  private readonly applicationsApi = inject(ApplicationsApiService);
  private readonly toasts = inject(DahcToastService);

  readonly applicationId = input.required<string>();
  readonly applicationNumber = input<string>('');
  readonly open = model<boolean>(false);
  readonly completed = output<void>();

  protected readonly maxLength = MAX_LENGTH;
  protected readonly justification = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(MAX_LENGTH), meaningfulReason],
  });
  protected readonly busy = signal<boolean>(false);
  protected readonly error = signal<string>('');
  protected readonly attempted = signal<boolean>(false);

  constructor() {
    effect(() => {
      if (this.open()) {
        this.justification.reset('');
        this.attempted.set(false);
        this.error.set('');
      }
    });
  }

  protected errorText(): string {
    return reasonErrorText(this.justification, this.attempted());
  }

  protected async submit(): Promise<void> {
    this.attempted.set(true);
    this.justification.markAsTouched();

    if (this.justification.invalid) {
      return;
    }

    this.busy.set(true);
    this.error.set('');

    try {
      await firstValueFrom(
        this.applicationsApi.requestReinstatement(this.applicationId(), { justification: this.justification.value.trim() }, callerHandlesProblems()),
      );
      this.toasts.show({
        variant: 'success',
        heading: $localize`:@@portal.reinstate.done:Your reinstatement request was sent.`,
        message: $localize`:@@portal.reinstate.doneText:You will receive the decision by e-mail.`,
      });
      this.open.set(false);
      this.completed.emit();
    } catch (error: unknown) {
      this.error.set(actionProblemText(error));
    } finally {
      this.busy.set(false);
    }
  }
}
