import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DahcDatePickerComponent, DahcFormFieldComponent, DahcInputDirective, DahcSelectComponent } from 'dahc-ui';

import { fieldError } from '../../../../../shared/forms/form-errors';
import { COUNTRIES, OTHER, RESIDENCY_SPECIALTIES, TRAINING_HOSPITALS, countryName } from '../../../../../shared/reference-data';
import { SectionAttachmentsComponent } from '../../section-attachments.component';
import { WizardStateService } from '../../wizard-state.service';
import { ResidencyInformationForm } from './residency.form';

type Field = keyof ResidencyInformationForm['controls'];

/** Residency Information (Figma 1:4456, US-1.3.7, Fellowship): residency specialty, hospital, country, completion. */
@Component({
  selector: 'dahc-residency-step',
  styleUrl: '../step.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcDatePickerComponent, DahcFormFieldComponent, DahcInputDirective, DahcSelectComponent, ReactiveFormsModule, SectionAttachmentsComponent],
  template: `
    <div class="step" [formGroup]="form">
      <div class="step-grid">
        <dahc-select
          formControlName="specialty"
          i18n-label="@@portal.residency.specialty"
          label="Specialty"
          i18n-description="@@portal.residency.specialtyHint"
          description="The residency specialty your fellowship requires."
          [options]="specialties"
          [required]="true"
          [invalid]="error('specialty') !== ''"
          [errorMessage]="error('specialty')" />
        <dahc-select
          formControlName="trainingHospital"
          i18n-label="@@portal.residency.hospital"
          label="Training hospital"
          [options]="hospitals"
          [required]="true"
          [invalid]="error('trainingHospital') !== ''"
          [errorMessage]="error('trainingHospital')" />
        @if (form.controls.trainingHospital.value === other) {
          <dahc-form-field
            i18n-label="@@portal.residency.otherHospital"
            label="Other training hospital"
            [required]="true"
            [invalid]="error('otherTrainingHospital') !== ''"
            [error]="error('otherTrainingHospital')">
            <input dahcInput type="text" formControlName="otherTrainingHospital" />
          </dahc-form-field>
          <dahc-select
            formControlName="trainingCountry"
            i18n-label="@@portal.residency.country"
            label="Training country"
            [options]="countries"
            [required]="true"
            [invalid]="error('trainingCountry') !== ''"
            [errorMessage]="error('trainingCountry')" />
        } @else if (form.controls.trainingHospital.value !== '') {
          <dahc-form-field i18n-label="@@portal.residency.country" label="Training country">
            <input dahcInput type="text" [value]="countryName(form.controls.trainingCountry.value)" readonly />
          </dahc-form-field>
        }
        <dahc-date-picker
          formControlName="completionDate"
          i18n-label="@@portal.residency.completionDate"
          label="Completion date"
          [required]="true"
          [invalid]="error('completionDate') !== ''"
          [errorMessage]="error('completionDate')" />
      </div>
      <dahc-section-attachments
        sectionKey="residency-information"
        i18n-heading="@@portal.residency.documents"
        heading="Documents"
        [showRequired]="showAll()" />
    </div>
  `,
})
export class ResidencyStepComponent {
  protected readonly state = inject(WizardStateService);
  protected readonly form = this.state.forms['residency-information'] as ResidencyInformationForm;
  protected readonly specialties = RESIDENCY_SPECIALTIES;
  protected readonly hospitals = TRAINING_HOSPITALS;
  protected readonly countries = COUNTRIES;
  protected readonly other = OTHER;
  protected readonly countryName = countryName;

  protected error(name: Field): string {
    this.state.revision();

    return fieldError(this.form.controls[name], this.showAll());
  }

  protected showAll(): boolean {
    return this.state.showsAllErrors('residency-information');
  }
}
