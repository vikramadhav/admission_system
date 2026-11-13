import { ChangeDetectionStrategy, Component, effect, inject, input, model, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  DahcAlertComponent,
  DahcButtonComponent,
  DahcFormFieldComponent,
  DahcInputDirective,
  DahcModalComponent,
  DahcSelectComponent,
  DahcSelectOption,
} from 'dahc-ui';

import { StaffFlagRequest } from '../../../shared/staff-application/staff-application-view.component';
import { NOTE_MAX_LENGTH, controlError, notBlank, problemText } from './review-support';
import { ReviewFacade } from './review.facade';

/**
 * Flags a field, section or attachment with a candidate-facing note (US-2.3.2): a note template
 * (lookup CORRECTION_NOTE_TEMPLATE) and the note body, up to 500 characters. The flag is kept on
 * the page until the officer saves all flags; existing flags can be edited or removed.
 */
@Component({
  selector: 'dahc-flag-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcAlertComponent, DahcButtonComponent, DahcFormFieldComponent, DahcInputDirective, DahcModalComponent, DahcSelectComponent, ReactiveFormsModule],
  styleUrl: './review-dialogs.scss',
  template: `
    <dahc-modal [(open)]="open" i18n-heading="@@portal.admission.review.flag.heading" heading="Flag for correction">
      <form class="review-form" [formGroup]="form" (ngSubmit)="save()" novalidate>
        <p class="review-text" i18n="@@portal.admission.review.flag.target">Flagged item: <strong>{{ target()?.label }}</strong></p>
        <p class="review-muted" i18n="@@portal.admission.review.flag.visibility">
          The candidate sees this note only when you return the application for correction.
        </p>
        <dahc-select
          formControlName="template"
          i18n-label="@@portal.admission.review.flag.template"
          label="Note template"
          [required]="true"
          [options]="templates()"
          [invalid]="templateError() !== ''"
          [errorMessage]="templateError()" />
        <dahc-form-field
          i18n-label="@@portal.admission.review.flag.note"
          label="Note to the candidate"
          [required]="true"
          [showCount]="true"
          [invalid]="noteError() !== ''"
          [error]="noteError()">
          <textarea dahcInput formControlName="note" [attr.maxlength]="maxLength"></textarea>
        </dahc-form-field>
        @if (error() !== '') {
          <dahc-alert variant="error" [announce]="true">{{ error() }}</dahc-alert>
        }
      </form>
      <div dahcDialogFooter class="review-buttons">
        @if (existing()) {
          <button dahc-button type="button" variant="danger" (click)="remove()" i18n="@@portal.admission.review.flag.remove">Remove flag</button>
        }
        <button dahc-button type="button" variant="secondary" (click)="open.set(false)" i18n="@@portal.action.cancel">Cancel</button>
        <button dahc-button type="button" (click)="save()" i18n="@@portal.admission.review.flag.save">Keep flag</button>
      </div>
    </dahc-modal>
  `,
})
export class FlagDialogComponent {
  private readonly facade = inject(ReviewFacade);

  readonly target = input<StaffFlagRequest | null>(null);
  readonly open = model<boolean>(false);

  protected readonly maxLength = NOTE_MAX_LENGTH;
  protected readonly form = new FormGroup({
    template: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    note: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, notBlank, Validators.maxLength(NOTE_MAX_LENGTH)] }),
  });
  protected readonly templates = signal<readonly DahcSelectOption[]>([]);
  protected readonly existing = signal<boolean>(false);
  protected readonly attempted = signal<boolean>(false);
  protected readonly error = signal<string>('');

  constructor() {
    effect(() => {
      const target = this.target();

      if (this.open() && target) {
        const flag = this.facade.flagFor(target.pointer);
        this.existing.set(flag !== null);
        this.form.reset({ template: flag?.candidateNoteCode ?? '', note: flag?.candidateNote ?? '' });
        this.attempted.set(false);
        this.error.set('');
        void this.loadTemplates();
      }
    });
  }

  protected templateError(): string {
    return controlError(this.form.controls.template, this.attempted());
  }

  protected noteError(): string {
    return controlError(this.form.controls.note, this.attempted());
  }

  protected save(): void {
    const target = this.target();
    this.attempted.set(true);
    this.form.markAllAsTouched();

    if (!target || this.form.invalid) {
      return;
    }

    const value = this.form.getRawValue();
    this.facade.setFlag({ fieldPointer: target.pointer, candidateNoteCode: value.template, candidateNote: value.note.trim() });
    this.open.set(false);
  }

  protected remove(): void {
    const target = this.target();

    if (target) {
      this.facade.removeFlag(target.pointer);
    }

    this.open.set(false);
  }

  private async loadTemplates(): Promise<void> {
    try {
      const items = await this.facade.lookup('CORRECTION_NOTE_TEMPLATE');
      this.templates.set(items.map(item => ({ value: item.code, label: item.label })));
    } catch (error: unknown) {
      this.error.set(problemText(error));
    }
  }
}
