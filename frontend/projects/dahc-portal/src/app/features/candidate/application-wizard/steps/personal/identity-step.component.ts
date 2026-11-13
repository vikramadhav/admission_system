import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  DahcAlertComponent,
  DahcDatePickerComponent,
  DahcFormFieldComponent,
  DahcInputDirective,
  DahcRadioGroupComponent,
  DahcSelectComponent,
} from 'dahc-ui';

import { WizardStepId } from '../../../../../shared/program-rules';
import { COUNTRIES, EMIRATES, GENDERS, MARITAL_STATUSES, YES_NO, countryName } from '../../../../../shared/reference-data';
import { PersonalStepBase } from './personal-step-base';
import { IdentityForm, identityConditions } from './personal.form';

/** Text fields of the identity sub-step that ICP may pre-fill (shown as read-only inputs then). */
type IdentityText = 'firstNameEn' | 'middleNameEn' | 'lastNameEn' | 'firstNameAr' | 'middleNameAr' | 'lastNameAr' | 'visaUnifiedNumber' | 'visaFileNumber' | 'passportNumber' | 'passportCity' | 'familyBookCityNumber' | 'familyId' | 'passportUnifiedNumber';

/** Personal information › Identity (Figma 1:2781, US-1.3.3 identity data dictionary). */
@Component({
  selector: 'dahc-identity-step',
  templateUrl: './identity-step.component.html',
  styleUrl: '../step.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcAlertComponent,
    DahcDatePickerComponent,
    DahcFormFieldComponent,
    DahcInputDirective,
    DahcRadioGroupComponent,
    DahcSelectComponent,
    ReactiveFormsModule,
  ],
})
export class IdentityStepComponent extends PersonalStepBase<IdentityForm> {
  protected readonly stepId: WizardStepId = 'personal-identity';
  protected readonly groupName = 'identity';
  protected readonly group = this.personal.controls.identity;

  protected readonly countries = COUNTRIES;
  protected readonly emirates = EMIRATES;
  protected readonly genders = GENDERS;
  protected readonly maritalStatuses = MARITAL_STATUSES;
  protected readonly yesNo = YES_NO;
  protected readonly verifiedHint = $localize`:@@portal.personal.verifiedIcp:Verified via ICP`;

  protected readonly names: readonly { readonly name: IdentityText; readonly label: string; readonly dir: 'ltr' | 'rtl' }[] = [
    { name: 'firstNameEn', label: $localize`:@@portal.personal.firstNameEn:English first name`, dir: 'ltr' },
    { name: 'middleNameEn', label: $localize`:@@portal.personal.middleNameEn:English middle name`, dir: 'ltr' },
    { name: 'lastNameEn', label: $localize`:@@portal.personal.lastNameEn:English last name`, dir: 'ltr' },
    { name: 'firstNameAr', label: $localize`:@@portal.personal.firstNameAr:Arabic first name`, dir: 'rtl' },
    { name: 'middleNameAr', label: $localize`:@@portal.personal.middleNameAr:Arabic middle name`, dir: 'rtl' },
    { name: 'lastNameAr', label: $localize`:@@portal.personal.lastNameAr:Arabic last name`, dir: 'rtl' },
  ];

  /** True when any identity field was pre-filled from ICP (UAE Pass sign-in). */
  protected readonly prefilledFromIcp = computed<boolean>(() => {
    this.state.revision();

    return Object.keys(this.group.controls).some(name => this.fromIcp(name));
  });

  protected conditions(): ReturnType<typeof identityConditions> {
    this.state.revision();

    return identityConditions(this.group.controls);
  }

  protected hint(name: string, fallback = ''): string {
    return this.fromIcp(name) ? this.verifiedHint : fallback;
  }

  /** Read-only date or select values from ICP are shown as text, like Figma's verified fields. */
  protected readOnly(name: string): boolean {
    return this.control(name)?.disabled ?? false;
  }

  protected display(name: 'dateOfBirth' | 'emiratesIdExpiry' | 'gender' | 'nationality' | 'countryOfResidence'): string {
    const value = this.group.controls[name].value;

    switch (name) {
      case 'gender':
        return GENDERS.find(option => option.value === value)?.label ?? value;
      case 'nationality':
      case 'countryOfResidence':
        return countryName(value);
      default:
        return formatIsoDate(value);
    }
  }

  /** Emirates ID shown masked when it cannot be edited (Figma 784-••••-•••••••-•). */
  protected maskedEmiratesId(): string {
    const value = this.group.controls.emiratesIdNumber.value;

    return value === '' ? '' : `${value.slice(0, 3)}-••••-•••••••-${value.slice(-1)}`;
  }
}

function formatIsoDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
}
