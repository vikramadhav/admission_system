import { ChangeDetectionStrategy, Component, computed, effect, inject, input, model, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DahcAlertComponent, DahcButtonComponent, DahcFormFieldComponent, DahcInputDirective, DahcModalComponent } from 'dahc-ui';

import { NOTE_MAX_LENGTH, ReviewActionDone, controlError, newIdempotencyKey, notBlank, problemText } from './review-support';
import { ReviewFacade } from './review.facade';

/** The actions that need only a mandatory note or justification. */
export type NoteActionKind = 'escalate' | 'guidance' | 'reinstate';

interface NoteActionText {
  readonly heading: string;
  readonly intro: string;
  readonly label: string;
  readonly submit: string;
  readonly done: string;
}

/**
 * One dialog for the note-only actions: the officer escalates for clarification (US-2.4.2), the
 * supervisor returns guidance (US-2.4.4) or directly reinstates a screened-out application with a
 * justification (US-2.5.2, STP-2.5 rule 4). The note is required, up to 500 characters.
 */
@Component({
  selector: 'dahc-note-action-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcAlertComponent, DahcButtonComponent, DahcFormFieldComponent, DahcInputDirective, DahcModalComponent, ReactiveFormsModule],
  styleUrl: './review-dialogs.scss',
  template: `
    <dahc-modal [(open)]="open" [heading]="text().heading">
      <form class="review-form" (submit)="$event.preventDefault(); submit()" novalidate>
        <p class="review-muted">{{ text().intro }}</p>
        <dahc-form-field [label]="text().label" [required]="true" [showCount]="true" [invalid]="noteError() !== ''" [error]="noteError()">
          <textarea dahcInput [formControl]="note" [attr.maxlength]="maxLength"></textarea>
        </dahc-form-field>
        @if (error() !== '') {
          <dahc-alert variant="error" [announce]="true">{{ error() }}</dahc-alert>
        }
      </form>
      <div dahcDialogFooter class="review-buttons">
        <button dahc-button type="button" variant="secondary" (click)="open.set(false)" i18n="@@portal.action.cancel">Cancel</button>
        <button dahc-button type="button" [loading]="busy()" (click)="submit()">{{ text().submit }}</button>
      </div>
    </dahc-modal>
  `,
})
export class NoteActionDialogComponent {
  private readonly facade = inject(ReviewFacade);

  readonly kind = input.required<NoteActionKind>();
  readonly open = model<boolean>(false);
  readonly completed = output<ReviewActionDone>();

  protected readonly maxLength = NOTE_MAX_LENGTH;
  protected readonly note = new FormControl<string>('', { nonNullable: true, validators: [Validators.required, notBlank, Validators.maxLength(NOTE_MAX_LENGTH)] });
  protected readonly busy = signal<boolean>(false);
  protected readonly error = signal<string>('');
  protected readonly attempted = signal<boolean>(false);
  private key = newIdempotencyKey();

  protected readonly text = computed<NoteActionText>(() => {
    switch (this.kind()) {
      case 'escalate':
        return {
          heading: $localize`:@@portal.admission.review.escalate.heading:Escalate for clarification`,
          intro: $localize`:@@portal.admission.review.escalate.intro:Ask the supervisor for guidance. The application comes back to you with their answer.`,
          label: $localize`:@@portal.admission.review.escalate.note:Question for the supervisor`,
          submit: $localize`:@@portal.admission.review.escalate.submit:Escalate`,
          done: $localize`:@@portal.admission.review.escalate.done:The application was escalated to the supervisor.`,
        };
      case 'guidance':
        return {
          heading: $localize`:@@portal.admission.review.guidance.heading:Return with guidance`,
          intro: $localize`:@@portal.admission.review.guidance.intro:Your guidance goes back to the assigned officer, who makes the decision.`,
          label: $localize`:@@portal.admission.review.guidance.note:Guidance for the officer`,
          submit: $localize`:@@portal.admission.review.guidance.submit:Return to officer`,
          done: $localize`:@@portal.admission.review.guidance.done:Your guidance was sent to the officer.`,
        };
      case 'reinstate':
        return {
          heading: $localize`:@@portal.admission.review.reinstate.heading:Reinstate application`,
          intro: $localize`:@@portal.admission.review.reinstate.intro:The application, verification and portfolio statuses from before the screen-out are restored. Use this only in exceptional cases.`,
          label: $localize`:@@portal.admission.review.reinstate.justification:Justification`,
          submit: $localize`:@@portal.admission.review.reinstate.submit:Reinstate`,
          done: $localize`:@@portal.admission.review.reinstate.done:The application was reinstated.`,
        };
    }
  });

  constructor() {
    effect(() => {
      if (this.open()) {
        this.note.reset('');
        this.attempted.set(false);
        this.error.set('');
        this.key = newIdempotencyKey();
      }
    });
  }

  protected noteError(): string {
    return controlError(this.note, this.attempted());
  }

  protected async submit(): Promise<void> {
    this.attempted.set(true);
    this.note.markAsTouched();

    if (this.note.invalid) {
      return;
    }

    const value = this.note.value.trim();
    this.busy.set(true);
    this.error.set('');

    try {
      switch (this.kind()) {
        case 'escalate':
          await this.facade.escalate(value, this.key);
          break;
        case 'guidance':
          await this.facade.returnWithGuidance(value);
          break;
        case 'reinstate':
          await this.facade.reinstate(value, this.key);
          break;
      }

      this.open.set(false);
      this.completed.emit({ message: this.text().done, leave: true });
    } catch (error: unknown) {
      this.error.set(problemText(error));
    } finally {
      this.busy.set(false);
    }
  }
}
