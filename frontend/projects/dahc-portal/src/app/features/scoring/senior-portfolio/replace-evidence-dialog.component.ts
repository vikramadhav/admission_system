import { ChangeDetectionStrategy, Component, computed, effect, inject, input, model, output, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
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
import { firstValueFrom } from 'rxjs';

import { ScoringApiService } from '../../../api/scoring-api.service';
import { callerHandlesProblems } from '../../../core/api/api-request';
import { problemText } from '../senior-dashboard/senior-labels';

const MAX_BYTES = 2 * 1024 * 1024;
const JUSTIFICATION_MAX = 500;

/** The evidence file being replaced. */
export interface EvidenceTarget {
  readonly evidenceId: string;
  readonly fileName: string;
  readonly questionLabel: string;
}

/**
 * Replace portfolio evidence under senior-referee authority (US-3.2.3): the justification comes
 * first, then the file. The new file is stored as a new version and the earlier one is kept for
 * audit. Replacing evidence does not reopen, reset or recompute any round; a score fix goes
 * through the override (US-3.2.2).
 */
@Component({
  selector: 'dahc-replace-evidence-dialog',
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
  styleUrl: '../senior-dashboard/senior-pages.scss',
  template: `
    <dahc-modal [(open)]="open" i18n-heading="@@portal.scoring.seniorPortfolio.replaceHeading" heading="Replace evidence">
      <form class="dialog-form" (ngSubmit)="submit()" novalidate>
        <p class="dialog-text" i18n="@@portal.scoring.seniorPortfolio.replaceTarget">
          Evidence: <strong>{{ target()?.fileName }}</strong> ({{ target()?.questionLabel }})
        </p>
        <dahc-alert variant="info" i18n="@@portal.scoring.seniorPortfolio.replaceNote">
          Scores are not recomputed. If the replacement changes a score, use Override score afterwards.
        </dahc-alert>
        <dahc-form-field
          i18n-label="@@portal.scoring.seniorPortfolio.replaceJustification"
          label="Justification"
          i18n-hint="@@portal.scoring.seniorPortfolio.replaceJustificationHint"
          hint="Why the file is replaced. It is kept in the audit history."
          [required]="true"
          [showCount]="true"
          [invalid]="justificationError() !== ''"
          [error]="justificationError()">
          <textarea dahcInput [formControl]="justification" [attr.maxlength]="justificationMax"></textarea>
        </dahc-form-field>
        <dahc-file-upload
          [formControl]="file"
          i18n-label="@@portal.scoring.seniorPortfolio.replaceFile"
          label="New file"
          i18n-hint="@@portal.scoring.seniorPortfolio.replaceFileHint"
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
      <div dahcDialogFooter class="dialog-buttons">
        <button dahc-button type="button" variant="secondary" (click)="open.set(false)" i18n="@@portal.action.cancel">Cancel</button>
        <button dahc-button type="button" [loading]="busy()" (click)="submit()" i18n="@@portal.scoring.seniorPortfolio.replaceSubmit">Replace file</button>
      </div>
    </dahc-modal>
  `,
})
export class ReplaceEvidenceDialogComponent {
  private readonly api = inject(ScoringApiService);

  readonly portfolioId = input.required<string>();
  readonly target = input<EvidenceTarget | null>(null);
  readonly open = model<boolean>(false);
  readonly completed = output<string>();

  protected readonly justificationMax = JUSTIFICATION_MAX;
  protected readonly maxBytes = MAX_BYTES;
  protected readonly justification = new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(JUSTIFICATION_MAX)] });
  protected readonly file = new FormControl<DahcFileUploadValue>(null);
  protected readonly busy = signal<boolean>(false);
  protected readonly error = signal<string>('');
  protected readonly attempted = signal<boolean>(false);

  private readonly justificationValue = toSignal(this.justification.valueChanges, { initialValue: '' });
  private readonly fileValue = toSignal(this.file.valueChanges, { initialValue: null });

  protected readonly justificationError = computed<string>(() => {
    this.justificationValue();

    return this.attempted() && this.justification.value.trim() === '' ? $localize`:@@portal.error.required:This field is required.` : '';
  });

  protected readonly fileError = computed<string>(() => {
    this.fileValue();

    return this.attempted() && !(this.file.value instanceof File) ? $localize`:@@portal.scoring.seniorPortfolio.replaceFileRequired:Choose the new file.` : '';
  });

  constructor() {
    effect(() => {
      if (this.open()) {
        untracked(() => {
          this.justification.reset('');
          this.file.reset(null);
          this.attempted.set(false);
          this.error.set('');
        });
      }
    });
  }

  protected async submit(): Promise<void> {
    const target = this.target();
    const file = this.file.value;
    this.attempted.set(true);

    if (!target || this.justification.value.trim() === '' || !(file instanceof File)) {
      return;
    }

    this.busy.set(true);
    this.error.set('');

    try {
      await firstValueFrom(this.api.replaceEvidence(this.portfolioId(), target.evidenceId, file, this.justification.value.trim(), callerHandlesProblems()));
      this.open.set(false);
      this.completed.emit($localize`:@@portal.scoring.seniorPortfolio.replaced:The evidence was replaced. The earlier version is kept for audit; scores were not recomputed.`);
    } catch (error: unknown) {
      this.error.set(problemText(error));
    } finally {
      this.busy.set(false);
    }
  }
}
