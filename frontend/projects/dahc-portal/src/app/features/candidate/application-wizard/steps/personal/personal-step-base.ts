import { Directive, inject } from '@angular/core';
import { AbstractControl, FormGroup, Validators } from '@angular/forms';

import { fieldError } from '../../../../../shared/forms/form-errors';
import { WizardStepId } from '../../../../../shared/program-rules';
import { WizardStateService } from '../../wizard-state.service';
import { PersonalInformationForm } from './personal.form';

/**
 * Shared helpers of the personal sub-steps: the one personal-information form, its error text and
 * required markers for a group, and whether a field came from ICP or IDAM (read-only, verified).
 */
@Directive()
export abstract class PersonalStepBase<G extends FormGroup> {
  protected readonly state = inject(WizardStateService);
  protected readonly personal = this.state.forms['personal-information'] as PersonalInformationForm;

  protected abstract readonly stepId: WizardStepId;
  protected abstract readonly groupName: 'identity' | 'contact' | 'nextOfKin';
  protected abstract readonly group: G;

  protected control(name: string): AbstractControl | null {
    return this.group.get(name);
  }

  protected error(name: string): string {
    this.state.revision();

    return fieldError(this.control(name), this.state.showsAllErrors(this.stepId));
  }

  protected isRequired(name: string): boolean {
    this.state.revision();

    return this.control(name)?.hasValidator(Validators.required) ?? false;
  }

  /** The value came from ICP (UAE Pass sign-in) and cannot be changed here. */
  protected fromIcp(name: string): boolean {
    return this.state.fieldState('personal-information', `${this.groupName}.${name}`)?.source === 'ICP';
  }

  protected fromIdam(name: string): boolean {
    return this.state.fieldState('personal-information', `${this.groupName}.${name}`)?.source === 'IDAM';
  }
}
