import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DahcFormFieldComponent, DahcInputDirective, DahcPhoneInputComponent, DahcSelectComponent } from 'dahc-ui';

import { WizardStepId } from '../../../../../shared/program-rules';
import { RELATIONSHIPS } from '../../../../../shared/reference-data';
import { PersonalStepBase } from './personal-step-base';
import { NextOfKinForm } from './personal.form';

/** Personal information › Next of kin (Figma 1:3396, US-1.3.3 next-of-kin fields). */
@Component({
  selector: 'dahc-next-of-kin-step',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: '../step.scss',
  imports: [DahcFormFieldComponent, DahcInputDirective, DahcPhoneInputComponent, DahcSelectComponent, ReactiveFormsModule],
  template: `
    <div class="step" [formGroup]="group">
      <h3 class="step-subheading" i18n="@@portal.personal.nextOfKinHeading">Next of Kin</h3>
      <div class="step-grid">
        <dahc-form-field i18n-label="@@portal.personal.kinFirstName" label="First name" [required]="true" [invalid]="error('firstName') !== ''" [error]="error('firstName')">
          <input dahcInput type="text" formControlName="firstName" autocomplete="off" />
        </dahc-form-field>
        <dahc-form-field i18n-label="@@portal.personal.kinMiddleName" label="Middle name" [invalid]="error('middleName') !== ''" [error]="error('middleName')">
          <input dahcInput type="text" formControlName="middleName" autocomplete="off" />
        </dahc-form-field>
        <dahc-form-field i18n-label="@@portal.personal.kinSurname" label="Surname" [required]="true" [invalid]="error('surname') !== ''" [error]="error('surname')">
          <input dahcInput type="text" formControlName="surname" autocomplete="off" />
        </dahc-form-field>
        <dahc-select
          formControlName="relationship"
          i18n-label="@@portal.personal.kinRelationship"
          label="Relationship to candidate"
          [options]="relationships"
          [required]="true"
          [invalid]="error('relationship') !== ''"
          [errorMessage]="error('relationship')" />
        <dahc-phone-input
          formControlName="phone"
          i18n-label="@@portal.personal.kinPhone"
          label="Primary telephone contact"
          [required]="true"
          [invalid]="error('phone') !== ''"
          [errorMessage]="error('phone')" />
        <dahc-form-field i18n-label="@@portal.personal.kinEmail" label="Primary e-mail" [required]="true" [invalid]="error('email') !== ''" [error]="error('email')">
          <input dahcInput type="email" formControlName="email" autocomplete="off" dir="ltr" />
        </dahc-form-field>
        <dahc-form-field
          i18n-label="@@portal.personal.kinConfirmEmail"
          label="Confirm primary e-mail"
          [required]="true"
          [invalid]="error('confirmEmail') !== ''"
          [error]="error('confirmEmail')">
          <input dahcInput type="email" formControlName="confirmEmail" autocomplete="off" dir="ltr" />
        </dahc-form-field>
        <dahc-form-field
          i18n-label="@@portal.personal.kinArea"
          label="Area of residence"
          [required]="true"
          [invalid]="error('areaOfResidence') !== ''"
          [error]="error('areaOfResidence')">
          <input dahcInput type="text" formControlName="areaOfResidence" />
        </dahc-form-field>
      </div>
    </div>
  `,
})
export class NextOfKinStepComponent extends PersonalStepBase<NextOfKinForm> {
  protected readonly stepId: WizardStepId = 'personal-next-of-kin';
  protected readonly groupName = 'nextOfKin';
  protected readonly group = this.personal.controls.nextOfKin;
  protected readonly relationships = RELATIONSHIPS;
}
