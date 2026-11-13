import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, FormRecord, ReactiveFormsModule } from '@angular/forms';
import { DahcCheckboxComponent } from 'dahc-ui';

import { STAFF_ROLE_CODES, StaffRoleCode, roleLabel } from '../../../core/auth/roles';

/** One checkbox per staff role code; the record is keyed by role code. */
export type StaffRoleForm = FormRecord<FormControl<boolean>>;

/** A role form with every staff role, the given ones checked. */
export function staffRoleForm(checked: readonly string[] = []): StaffRoleForm {
  const form = new FormRecord<FormControl<boolean>>({});

  for (const code of STAFF_ROLE_CODES) {
    form.addControl(code, new FormControl<boolean>(checked.includes(code), { nonNullable: true }));
  }

  return form;
}

/** The checked role codes, in contract order. */
export function checkedRoles(form: StaffRoleForm): StaffRoleCode[] {
  return STAFF_ROLE_CODES.filter(code => form.controls[code]?.value === true);
}

/**
 * Checkboxes for the contract's StaffRoleCode values (setStaffUserRoles, preRegisterStaffUser).
 * Program, specialty and pool scopes are not offered: there is no operation that lists pools
 * (PQ-03, PQ-41), so role assignments are sent without scopes.
 */
@Component({
  selector: 'dahc-staff-role-fields',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcCheckboxComponent, ReactiveFormsModule],
  styles: `
    fieldset { display: grid; gap: var(--dahc-space-2); margin: 0; padding: 0; border: 0; min-inline-size: 0; }
    legend { margin-block-end: var(--dahc-space-2); padding: 0; font-weight: var(--dahc-type-label-weight); }
    .roles { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, calc(var(--dahc-space-16) * 4)), 1fr)); gap: var(--dahc-space-2); }
    .error { margin: 0; color: var(--dahc-color-error-text); }
  `,
  template: `
    <fieldset [attr.aria-describedby]="error() !== '' ? errorId : null">
      <legend>{{ legend() }}</legend>
      <div class="roles">
        @for (code of codes; track code) {
          <dahc-checkbox [formControl]="control(code)" [invalid]="error() !== ''">{{ label(code) }}</dahc-checkbox>
        }
      </div>
      @if (error() !== '') {
        <p class="error" [id]="errorId" role="alert">{{ error() }}</p>
      }
    </fieldset>
  `,
})
export class StaffRoleFieldsComponent {
  readonly form = input.required<StaffRoleForm>();
  readonly legend = input.required<string>();
  readonly error = input<string>('');

  protected readonly codes = STAFF_ROLE_CODES;
  protected readonly errorId = `dahc-role-error-${crypto.randomUUID()}`;

  protected control(code: StaffRoleCode): FormControl<boolean> {
    const control = this.form().controls[code];

    if (!control) {
      throw new Error(`Missing role control ${code}`);
    }

    return control;
  }

  protected label(code: string): string {
    return roleLabel(code);
  }
}
