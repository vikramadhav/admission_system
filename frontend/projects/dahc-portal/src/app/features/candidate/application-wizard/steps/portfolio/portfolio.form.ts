import { FormControl, FormGroup, FormRecord, Validators } from '@angular/forms';

import { AttachmentSlot, PortfolioAnswer, PortfolioSubmission } from '../../../../../api/candidate-lifecycle.models';
import { requireWhen } from '../../../../../shared/forms/form-errors';
import { PortfolioQuestion } from '../../../../../shared/portfolio-questions';
import { YesNo } from '../../../../../shared/section-values';

export type PortfolioQuestionForm = FormGroup<{
  answer: FormControl<YesNo>;
  details: FormRecord<FormControl<string>>;
}>;

export type PortfolioForm = FormRecord<PortfolioQuestionForm>;

/** One group per question: the Yes/No answer and the detail fields asked for a Yes. */
export function createPortfolioForm(questions: readonly PortfolioQuestion[]): PortfolioForm {
  const form: PortfolioForm = new FormRecord<PortfolioQuestionForm>({});

  for (const question of questions) {
    const details = new FormRecord<FormControl<string>>({});

    for (const field of question.fields) {
      details.addControl(field.key, new FormControl('', { nonNullable: true }));

      if (field.otherKey) {
        details.addControl(field.otherKey, new FormControl('', { nonNullable: true }));
      }
    }

    form.addControl(
      question.id,
      new FormGroup({
        answer: new FormControl<YesNo>('', { nonNullable: true, validators: [Validators.required] }),
        details,
      }),
    );
  }

  return form;
}

/** Yes makes the details required (and the "Other" text when Other is chosen); No requires nothing more. */
export function syncPortfolioForm(form: PortfolioForm, questions: readonly PortfolioQuestion[]): void {
  for (const question of questions) {
    const group = form.controls[question.id];

    if (!group) {
      continue;
    }

    const yes = group.controls.answer.value === 'YES';

    for (const field of question.fields) {
      const control = group.controls.details.controls[field.key];

      if (control) {
        requireWhen(control, yes);
      }

      const other = field.otherKey ? group.controls.details.controls[field.otherKey] : undefined;

      if (other && control) {
        requireWhen(other, yes && control.value === 'OTHER');
      }
    }
  }
}

/** Loads a submitted portfolio into the form. */
export function patchPortfolioForm(form: PortfolioForm, submission: PortfolioSubmission): void {
  for (const answer of submission.answers) {
    const group = form.controls[answer.questionId];

    if (group) {
      group.controls.answer.setValue(answer.answer, { emitEvent: false });
      group.controls.details.patchValue(answer.details ?? {}, { emitEvent: false });
    }
  }
}

/** Evidence slots of a question without a file. */
export function missingEvidence(question: PortfolioQuestion, slots: readonly AttachmentSlot[]): readonly AttachmentSlot[] {
  return slots.filter(slot => slot.sectionKey === 'portfolio' && slot.portfolioQuestionId === question.id && slot.attachment === null);
}

export function evidenceIds(question: PortfolioQuestion, slots: readonly AttachmentSlot[]): string[] {
  return slots
    .filter(slot => slot.sectionKey === 'portfolio' && slot.portfolioQuestionId === question.id && slot.attachment !== null)
    .map(slot => slot.attachment?.attachmentId ?? '')
    .filter(id => id !== '');
}

/** The contract's answers; details only for Yes, without empty "Other" texts. */
export function portfolioAnswers(form: PortfolioForm, questions: readonly PortfolioQuestion[], slots: readonly AttachmentSlot[]): PortfolioAnswer[] {
  return questions.map(question => {
    const group = form.controls[question.id];
    const answer = group?.controls.answer.value === 'YES' ? 'YES' : 'NO';

    if (answer === 'NO' || !group) {
      return { questionId: question.id, answer };
    }

    const details = Object.fromEntries(Object.entries(group.controls.details.getRawValue()).filter(([, value]) => value !== ''));

    return { questionId: question.id, answer, details, evidenceIds: evidenceIds(question, slots) };
  });
}
