import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DahcDatePickerComponent, DahcFormFieldComponent, DahcInputDirective, DahcSelectComponent } from 'dahc-ui';

import { fieldError } from '../../../../../shared/forms/form-errors';
import { COUNTRIES, INTERNSHIP_ORGANIZATIONS, OTHER, countryName } from '../../../../../shared/reference-data';
import { SectionAttachmentsComponent } from '../../section-attachments.component';
import { WizardStateService } from '../../wizard-state.service';
import { InternshipInformationForm } from './internship.form';

type Field = keyof InternshipInformationForm['controls'];

/** Internship Information (Figma 1:4255, US-1.3.6): organization, location, dates, certificate. */
@Component({
  selector: 'dahc-internship-step',
  styleUrl: '../step.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcDatePickerComponent, DahcFormFieldComponent, DahcInputDirective, DahcSelectComponent, ReactiveFormsModule, SectionAttachmentsComponent],
  template: `
    <div class="step" [formGroup]="form">
      <div class="step-grid">
        <dahc-select
          formControlName="organization"
          i18n-label="@@portal.internship.organization"
          label="Organization name"
          [options]="organizations"
          [required]="true"
          [invalid]="error('organization') !== ''"
          [errorMessage]="error('organization')" />
        @if (form.controls.organization.value === other) {
          <dahc-form-field
            i18n-label="@@portal.internship.otherOrganization"
            label="Other organization name"
            [required]="true"
            [invalid]="error('otherOrganization') !== ''"
            [error]="error('otherOrganization')">
            <input dahcInput type="text" formControlName="otherOrganization" />
          </dahc-form-field>
          <dahc-select
            formControlName="location"
            i18n-label="@@portal.internship.location"
            label="Location"
            [options]="countries"
            [required]="true"
            [invalid]="error('location') !== ''"
            [errorMessage]="error('location')" />
        } @else if (form.controls.organization.value !== '') {
          <dahc-form-field i18n-label="@@portal.internship.location" label="Location">
            <input dahcInput type="text" [value]="countryName(form.controls.location.value)" readonly />
          </dahc-form-field>
        }
        <dahc-date-picker
          formControlName="fromDate"
          i18n-label="@@portal.internship.fromDate"
          label="From date"
          [max]="today"
          [required]="true"
          [invalid]="error('fromDate') !== ''"
          [errorMessage]="error('fromDate')" />
        <dahc-date-picker
          formControlName="toDate"
          i18n-label="@@portal.internship.toDate"
          label="To date"
          i18n-hint="@@portal.internship.toDateHint"
          hint="If you are a current intern, enter the expected end date."
          [required]="true"
          [invalid]="error('toDate') !== ''"
          [errorMessage]="error('toDate')" />
      </div>

      <section class="step-section" aria-labelledby="internship-documents-heading">
        <h3 id="internship-documents-heading" class="step-section-heading" i18n="@@portal.internship.documents">Documents</h3>
        <dahc-section-attachments sectionKey="internship-information" [showRequired]="showAll()" />
      </section>
    </div>
  `,
})
export class InternshipStepComponent {
  protected readonly state = inject(WizardStateService);
  protected readonly form = this.state.forms['internship-information'] as InternshipInformationForm;
  protected readonly organizations = INTERNSHIP_ORGANIZATIONS;
  protected readonly countries = COUNTRIES;
  protected readonly other = OTHER;
  protected readonly countryName = countryName;
  protected readonly today = new Date().toISOString().slice(0, 10);

  protected error(name: Field): string {
    this.state.revision();

    return fieldError(this.form.controls[name], this.showAll());
  }

  protected showAll(): boolean {
    return this.state.showsAllErrors('internship-information');
  }
}
