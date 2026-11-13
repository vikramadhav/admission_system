import { ChangeDetectionStrategy, Component, effect, inject, input, model, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  DahcAlertComponent,
  DahcButtonComponent,
  DahcFileUploadComponent,
  DahcFileUploadValue,
  DahcFormFieldComponent,
  DahcInputDirective,
  DahcModalComponent,
} from 'dahc-ui';

import { ApplicationAttachment } from '../../../api/admission.models';
import { NOTE_MAX_LENGTH, ReviewActionDone, controlError, notBlank, problemText } from './review-support';
import { ReviewFacade } from './review.facade';

const MAX_BYTES = 2 * 1024 * 1024;

/**
 * Replaces an application attachment during verification (US-2.3.6): the justification comes
 * first, then the file. The previous version is kept for audit and statuses do not change. The
 * server checks type and size; the client hint is the existing 2 MB PDF/JPEG/PNG rule. Portfolio
 * evidence is never offered here.
 */
@Component({
  selector: 'dahc-replace-attachment-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcAlertComponent,
    DahcButtonComponent,
    DahcFileUploadComponent,
    DahcFormFieldComponent,
    DahcInputDirective,
    DahcModalComponent,
    ReactiveFormsModule,
  ],
  styleUrl: './review-dialogs.scss',
  template: `
    <dahc-modal [(open)]="open" i18n-heading="@@portal.admission.review.replace.heading" heading="Replace attachment">
      <form class="review-form" (submit)="$event.preventDefault(); submit()" novalidate>
        <p class="review-text" i18n="@@portal.admission.review.replace.target">Attachment: <strong>{{ attachment()?.label }}</strong></p>
        <dahc-form-field
          i18n-label="@@portal.admission.review.replace.justification"
          label="Justification"
          i18n-hint="@@portal.admission.review.replace.justificationHint"
          hint="Why the file is replaced. It is kept in the audit history."
          [required]="true"
          [showCount]="true"
          [invalid]="reasonError() !== ''"
          [error]="reasonError()">
          <textarea dahcInput [formControl]="reason" [attr.maxlength]="maxLength"></textarea>
        </dahc-form-field>
        <dahc-file-upload
          [formControl]="file"
          i18n-label="@@portal.admission.review.replace.file"
          label="New file"
          i18n-hint="@@portal.admission.review.replace.fileHint"
          hint="PDF, JPEG or PNG, up to 2 MB."
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          [maxSize]="maxBytes"
          [required]="true"
          [invalid]="fileError() !== ''"
          [errorMessage]="fileError()" />
        @if (error() !== '') {
          <dahc-alert variant="error" [announce]="true">{{ error() }}</dahc-alert>
        }
      </form>
      <div dahcDialogFooter class="review-buttons">
        <button dahc-button type="button" variant="secondary" (click)="open.set(false)" i18n="@@portal.action.cancel">Cancel</button>
        <button dahc-button type="button" [loading]="busy()" (click)="submit()" i18n="@@portal.admission.review.replace.submit">Replace file</button>
      </div>
    </dahc-modal>
  `,
})
export class ReplaceAttachmentDialogComponent {
  private readonly facade = inject(ReviewFacade);

  readonly attachment = input<ApplicationAttachment | null>(null);
  readonly open = model<boolean>(false);
  readonly completed = output<ReviewActionDone>();

  protected readonly maxLength = NOTE_MAX_LENGTH;
  protected readonly maxBytes = MAX_BYTES;
  protected readonly reason = new FormControl<string>('', { nonNullable: true, validators: [Validators.required, notBlank, Validators.maxLength(NOTE_MAX_LENGTH)] });
  protected readonly file = new FormControl<DahcFileUploadValue>(null);
  protected readonly busy = signal<boolean>(false);
  protected readonly error = signal<string>('');
  protected readonly attempted = signal<boolean>(false);

  constructor() {
    effect(() => {
      if (this.open()) {
        this.reason.reset('');
        this.file.reset(null);
        this.attempted.set(false);
        this.error.set('');
      }
    });
  }

  protected reasonError(): string {
    return controlError(this.reason, this.attempted());
  }

  protected fileError(): string {
    return this.attempted() && !(this.file.value instanceof File)
      ? $localize`:@@portal.admission.review.replace.fileRequired:Choose the new file.`
      : '';
  }

  protected async submit(): Promise<void> {
    const attachment = this.attachment();
    const file = this.file.value;
    this.attempted.set(true);
    this.reason.markAsTouched();

    if (!attachment || this.reason.invalid || !(file instanceof File)) {
      return;
    }

    this.busy.set(true);
    this.error.set('');

    try {
      await this.facade.replaceAttachment(attachment.attachment.attachmentId, file, this.reason.value.trim());
      this.open.set(false);
      this.completed.emit({ message: $localize`:@@portal.admission.review.replace.done:The attachment was replaced. The earlier version is kept for audit.`, leave: false });
    } catch (error: unknown) {
      this.error.set(problemText(error));
    } finally {
      this.busy.set(false);
    }
  }
}
