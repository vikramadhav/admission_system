import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  DahcDatePickerComponent,
  DahcFormFieldComponent,
  DahcInputDirective,
  DahcRadioGroupComponent,
  DahcSelectComponent,
  DahcTagComponent,
} from 'dahc-ui';

import { fieldError } from '../../../../../shared/forms/form-errors';
import { PortfolioQuestion } from '../../../../../shared/portfolio-questions';
import { YES_NO } from '../../../../../shared/reference-data';
import { SectionAttachmentsComponent } from '../../section-attachments.component';
import { WizardStateService } from '../../wizard-state.service';
import { PortfolioQuestionForm, missingEvidence } from './portfolio.form';

/**
 * One portfolio question (Figma question card, 1:4900): prompt, indicative points, the Yes/No
 * answer and, for Yes, the details and evidence the BRD asks for (US-1.3.10 AC3-AC4).
 */
@Component({
  selector: 'dahc-portfolio-question-card',
  templateUrl: './portfolio-question-card.component.html',
  styleUrls: ['../step.scss', './portfolio-question-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcDatePickerComponent,
    DahcFormFieldComponent,
    DahcInputDirective,
    DahcRadioGroupComponent,
    DahcSelectComponent,
    DahcTagComponent,
    ReactiveFormsModule,
    SectionAttachmentsComponent,
  ],
})
export class PortfolioQuestionCardComponent {
  protected readonly state = inject(WizardStateService);
  protected readonly yesNo = YES_NO;

  readonly question = input.required<PortfolioQuestion>();
  readonly group = input.required<PortfolioQuestionForm>();
  readonly showAllErrors = input<boolean>(false);

  protected readonly headingId = computed<string>(() => `portfolio-question-${this.question().id}`);

  protected isYes(): boolean {
    this.state.revision();

    return this.group().controls.answer.value === 'YES';
  }

  protected answerError(): string {
    this.state.revision();

    return fieldError(this.group().controls.answer, this.showAllErrors());
  }

  protected detailError(key: string): string {
    this.state.revision();

    return fieldError(this.group().controls.details.controls[key], this.showAllErrors());
  }

  protected isOther(key: string): boolean {
    this.state.revision();

    return this.group().controls.details.controls[key]?.value === 'OTHER';
  }

  protected evidenceMissing(): boolean {
    return this.showAllErrors() && this.isYes() && missingEvidence(this.question(), this.state.slots()).length > 0;
  }
}
