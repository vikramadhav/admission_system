import { ChangeDetectionStrategy, Component, WritableSignal, computed, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DahcAlertComponent, DahcButtonComponent, DahcFormFieldComponent, DahcInputDirective, DahcPhoneInputComponent, DahcTagComponent } from 'dahc-ui';

import { OtpChannel } from '../../../../../api/candidate-lifecycle.models';
import { WizardStepId } from '../../../../../shared/program-rules';
import { ContactVerificationDialogComponent } from './contact-verification-dialog.component';
import { PersonalStepBase } from './personal-step-base';
import { ContactForm } from './personal.form';

type ContactField = 'contactEmail' | 'contactMobile';

/**
 * Personal information › Contact (Figma 1:3208, US-1.3.3): registered e-mail and mobile come from
 * the Dubai Health account; contact details start as copies and must be verified by a one-time
 * code when changed, before the section can be saved (AC11).
 */
@Component({
  selector: 'dahc-contact-step',
  templateUrl: './contact-step.component.html',
  styleUrls: ['../step.scss', './contact-step.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ContactVerificationDialogComponent,
    DahcAlertComponent,
    DahcButtonComponent,
    DahcFormFieldComponent,
    DahcInputDirective,
    DahcPhoneInputComponent,
    DahcTagComponent,
    ReactiveFormsModule,
  ],
})
export class ContactStepComponent extends PersonalStepBase<ContactForm> {
  protected readonly stepId: WizardStepId = 'personal-contact';
  protected readonly groupName = 'contact';
  protected readonly group = this.personal.controls.contact;
  protected readonly accountHint = $localize`:@@portal.personal.fromAccount:From your Dubai Health account`;

  /** Values verified in this session; the API keeps the authoritative record. */
  private readonly verifiedValues = this.state.retain<WritableSignal<string[]>>('verifiedContacts', () => signal<string[]>([]));

  protected readonly verifying = signal<{ field: ContactField; channel: OtpChannel; value: string } | null>(null);
  protected readonly dialogOpen = signal<boolean>(false);
  protected readonly applicationId = computed<string>(() => this.state.application()?.id ?? '');

  /** The contact value differs from the registered one. */
  protected changed(field: ContactField): boolean {
    this.state.revision();
    const contact = this.group.getRawValue();
    const registered = field === 'contactEmail' ? contact.registeredEmail : contact.registeredMobile;
    const value = contact[field];

    return value !== '' && value.trim().toLowerCase() !== registered.trim().toLowerCase();
  }

  protected verified(field: ContactField): boolean {
    return this.verifiedValues().includes(this.group.controls[field].value);
  }

  protected needsVerification(field: ContactField): boolean {
    return this.state.editable() && this.changed(field) && !this.verified(field) && this.group.controls[field].valid;
  }

  protected verify(field: ContactField): void {
    this.verifying.set({ field, channel: field === 'contactEmail' ? 'EMAIL' : 'SMS', value: this.group.controls[field].value });
    this.dialogOpen.set(true);
  }

  protected onVerified(value: string): void {
    this.verifiedValues.update(values => [...values, value]);
    this.state.revision.update(revision => revision + 1);
  }
}
