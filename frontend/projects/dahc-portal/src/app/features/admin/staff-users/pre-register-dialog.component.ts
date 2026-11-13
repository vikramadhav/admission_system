import { ChangeDetectionStrategy, Component, computed, effect, inject, model, output, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DahcAlertComponent, DahcButtonComponent, DahcFormFieldComponent, DahcInputDirective, DahcModalComponent, DahcToastService } from 'dahc-ui';
import { firstValueFrom } from 'rxjs';

import { AdminApiService } from '../../../api/admin-api.service';
import { StaffUser } from '../../../api/admin.models';
import { isApiProblemError } from '../../../core/api/api-problem-error';
import { callerHandlesProblems } from '../../../core/api/api-request';
import { StaffRoleFieldsComponent, checkedRoles, staffRoleForm } from './staff-role-fields.component';

const ID_MAX = 200;
const NAME_MAX = 200;
const EMAIL_MAX = 320;

/**
 * Pre-register a staff user (contract preRegisterStaffUser): the IDAM user id, name, email and
 * one or more roles. The person can sign in once registered; 409 staff.already_registered is
 * shown in the dialog. One idempotency key per opening of the dialog.
 */
@Component({
  selector: 'dahc-pre-register-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcAlertComponent, DahcButtonComponent, DahcFormFieldComponent, DahcInputDirective, DahcModalComponent, ReactiveFormsModule, StaffRoleFieldsComponent],
  styleUrl: '../admin-pages.scss',
  template: `
    <dahc-modal [(open)]="open" i18n-heading="@@portal.admin.preRegister.heading" heading="Pre-register a staff user">
      <form class="dialog-form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <p class="dialog-text" i18n="@@portal.admin.preRegister.text">
          The person signs in with their Dubai Health account. Enter the IDAM user id exactly as IDAM shows it.
        </p>
        <dahc-form-field
          i18n-label="@@portal.admin.preRegister.idamUserId"
          label="IDAM user id"
          [required]="true"
          [invalid]="errorFor('idamUserId') !== ''"
          [error]="errorFor('idamUserId')">
          <input dahcInput type="text" formControlName="idamUserId" [attr.maxlength]="idMax" autocomplete="off" />
        </dahc-form-field>
        <dahc-form-field
          i18n-label="@@portal.admin.preRegister.displayName"
          label="Full name"
          [required]="true"
          [invalid]="errorFor('displayName') !== ''"
          [error]="errorFor('displayName')">
          <input dahcInput type="text" formControlName="displayName" [attr.maxlength]="nameMax" autocomplete="off" />
        </dahc-form-field>
        <dahc-form-field
          i18n-label="@@portal.admin.preRegister.email"
          label="Email address"
          [required]="true"
          [invalid]="errorFor('email') !== ''"
          [error]="errorFor('email')">
          <input dahcInput type="email" formControlName="email" [attr.maxlength]="emailMax" autocomplete="off" />
        </dahc-form-field>
        <dahc-staff-role-fields
          [form]="roles"
          i18n-legend="@@portal.admin.roles.legend"
          legend="Roles"
          [error]="rolesError()" />
        @if (error() !== '') {
          <dahc-alert variant="error" [announce]="true">{{ error() }}</dahc-alert>
        }
      </form>
      <div dahcDialogFooter class="dialog-buttons">
        <button dahc-button type="button" variant="secondary" (click)="open.set(false)" i18n="@@portal.action.cancel">Cancel</button>
        <button dahc-button type="button" [loading]="busy()" (click)="submit()" i18n="@@portal.admin.preRegister.submit">Pre-register</button>
      </div>
    </dahc-modal>
  `,
})
export class PreRegisterDialogComponent {
  private readonly api = inject(AdminApiService);
  private readonly toasts = inject(DahcToastService);

  readonly open = model<boolean>(false);
  readonly registered = output<StaffUser>();

  protected readonly idMax = ID_MAX;
  protected readonly nameMax = NAME_MAX;
  protected readonly emailMax = EMAIL_MAX;
  protected readonly form = new FormGroup({
    idamUserId: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(ID_MAX)] }),
    displayName: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(NAME_MAX)] }),
    email: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.email, Validators.maxLength(EMAIL_MAX)] }),
  });
  protected readonly roles = staffRoleForm();
  protected readonly busy = signal<boolean>(false);
  protected readonly error = signal<string>('');
  protected readonly attempted = signal<boolean>(false);

  private readonly formValue = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });
  private readonly rolesValue = toSignal(this.roles.valueChanges, { initialValue: this.roles.getRawValue() });
  private idempotencyKey = crypto.randomUUID();

  protected readonly rolesError = computed<string>(() => {
    this.rolesValue();

    return this.attempted() && checkedRoles(this.roles).length === 0 ? $localize`:@@portal.admin.roles.required:Choose at least one role.` : '';
  });

  constructor() {
    effect(() => {
      if (this.open()) {
        untracked(() => {
          this.idempotencyKey = crypto.randomUUID();
          this.form.reset();
          this.roles.reset();
          this.attempted.set(false);
          this.error.set('');
        });
      }
    });
  }

  protected errorFor(name: 'idamUserId' | 'displayName' | 'email'): string {
    this.formValue();
    const control = this.form.controls[name];

    if (!this.attempted() || control.valid) {
      return '';
    }

    if (control.hasError('required') || control.value.trim() === '') {
      return $localize`:@@portal.error.required:This field is required.`;
    }

    if (control.hasError('email')) {
      return $localize`:@@portal.admin.error.email:Enter a valid email address.`;
    }

    return $localize`:@@portal.admin.error.tooLong:This is too long.`;
  }

  protected async submit(): Promise<void> {
    this.attempted.set(true);
    const roles = checkedRoles(this.roles);
    const value = this.form.getRawValue();

    if (this.form.invalid || value.idamUserId.trim() === '' || value.displayName.trim() === '' || roles.length === 0) {
      return;
    }

    this.busy.set(true);
    this.error.set('');

    try {
      const result = await firstValueFrom(
        this.api.preRegisterStaffUser(
          {
            idamUserId: value.idamUserId.trim(),
            displayName: value.displayName.trim(),
            email: value.email.trim(),
            roles: roles.map(roleCode => ({ roleCode })),
          },
          this.idempotencyKey,
          callerHandlesProblems(),
        ),
      );
      this.toasts.show({ variant: 'success', heading: $localize`:@@portal.admin.preRegister.done:${result.data.displayName}:name: is pre-registered` });
      this.open.set(false);
      this.registered.emit(result.data);
    } catch (error: unknown) {
      this.error.set(
        isApiProblemError(error) ? (error.problem.detail ?? error.problem.title) : $localize`:@@portal.problem.unexpected:Something went wrong. Please try again later.`,
      );
    } finally {
      this.busy.set(false);
    }
  }
}
