import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import {
  DahcCheckboxComponent,
  DahcFormFieldComponent,
  DahcInputDirective,
  DahcRadioGroupComponent,
  DahcSelectComponent,
  DahcSelectOption,
} from 'dahc-ui';

import { SessionService } from '../../../../../core/auth/session.service';
import { fieldError } from '../../../../../shared/forms/form-errors';
import { SPONSOR_TYPES, YES_NO } from '../../../../../shared/reference-data';
import { SectionAttachmentsComponent } from '../../section-attachments.component';
import { WizardStateService } from '../../wizard-state.service';
import { ApplicationInformationForm } from './application-information.form';

/** Step 2, Application Information (Figma 1:2505, US-1.3.2): status, sponsorship, declarations, documents, terms. */
@Component({
  selector: 'dahc-application-information-step',
  templateUrl: './application-information-step.component.html',
  styleUrls: ['../step.scss', './application-information-step.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcCheckboxComponent,
    DahcFormFieldComponent,
    DahcInputDirective,
    DahcRadioGroupComponent,
    DahcSelectComponent,
    ReactiveFormsModule,
    SectionAttachmentsComponent,
  ],
})
export class ApplicationInformationStepComponent {
  private readonly session = inject(SessionService).session;

  protected readonly state = inject(WizardStateService);
  protected readonly form = this.state.forms['application-information'] as ApplicationInformationForm;
  protected readonly yesNo = YES_NO;
  protected readonly sponsorTypes = SPONSOR_TYPES;

  protected readonly statusOptions = computed<readonly DahcSelectOption[]>(() =>
    (this.state.rules()?.candidateStatuses ?? []).map(({ value, label }) => ({ value, label })),
  );
  protected readonly employmentQuestions = computed<boolean>(() => this.state.rules()?.employmentQuestions ?? false);
  protected readonly candidateName = computed<string>(() => this.session()?.displayName ?? '');
  protected readonly programName = computed<string>(() => this.state.program()?.name ?? '');

  protected readonly declarations = [
    {
      control: 'licenseDenied',
      label: $localize`:@@portal.info.licenseDenied:Have you ever been denied a medical license or had it revoked, limited, restricted or suspended?`,
    },
    {
      control: 'academicProbation',
      label: $localize`:@@portal.info.academicProbation:Have you ever been placed on academic probation in a training program?`,
    },
    {
      control: 'dismissed',
      label: $localize`:@@portal.info.dismissed:Have you ever been dismissed from a residency, fellowship or professional appointment?`,
    },
    {
      control: 'misconduct',
      label: $localize`:@@portal.info.misconduct:Do you have any pending or previous professional misconduct?`,
    },
  ] as const;

  protected error(name: keyof ApplicationInformationForm['controls']): string {
    this.state.revision();

    return fieldError(this.form.controls[name], this.showAll());
  }

  protected showAll(): boolean {
    return this.state.showsAllErrors('application-information');
  }

  protected isRequired(name: keyof ApplicationInformationForm['controls']): boolean {
    this.state.revision();

    return this.form.controls[name].hasValidator(Validators.required);
  }
}
