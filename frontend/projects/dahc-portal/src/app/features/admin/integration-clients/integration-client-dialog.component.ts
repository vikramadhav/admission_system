import { ChangeDetectionStrategy, Component, computed, effect, inject, input, model, output, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DahcAlertComponent, DahcButtonComponent, DahcCheckboxComponent, DahcFormFieldComponent, DahcInputDirective, DahcModalComponent, DahcToastService } from 'dahc-ui';
import { firstValueFrom } from 'rxjs';

import { AdminApiService } from '../../../api/admin-api.service';
import { IntegrationClient, IntegrationClientInput, IntegrationPermission } from '../../../api/admin.models';
import { isApiProblemError } from '../../../core/api/api-problem-error';
import { callerHandlesProblems } from '../../../core/api/api-request';

const FIELD_MAX = 200;
const STALE = 'request.precondition_failed';

/** Display name of an integration permission. */
export function permissionLabel(permission: string): string {
  return permission === 'payments.events-write' ? $localize`:@@portal.admin.clients.permission.paymentEvents:Send payment gateway events` : permission;
}

/**
 * Register an integration client (contract registerIntegrationClient; one idempotency key per
 * opening, 409 integration.already_registered) or edit one (updateIntegrationClient, If-Match =
 * the client's `version`; a stale version gets 409 and the dialog offers to reload).
 */
@Component({
  selector: 'dahc-integration-client-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcAlertComponent, DahcButtonComponent, DahcCheckboxComponent, DahcFormFieldComponent, DahcInputDirective, DahcModalComponent, ReactiveFormsModule],
  styleUrl: '../admin-pages.scss',
  styles: `
    fieldset { display: grid; gap: var(--dahc-space-2); margin: 0; padding: 0; border: 0; min-inline-size: 0; }
    legend { margin-block-end: var(--dahc-space-2); padding: 0; font-weight: var(--dahc-type-label-weight); }
  `,
  template: `
    <dahc-modal [(open)]="open" [heading]="heading()">
      <form class="dialog-form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        @if (client() === null) {
          <dahc-form-field
            i18n-label="@@portal.admin.clients.idamClientId"
            label="IDAM client id"
            [required]="true"
            [invalid]="errorFor('idamClientId') !== ''"
            [error]="errorFor('idamClientId')">
            <input dahcInput type="text" formControlName="idamClientId" [attr.maxlength]="fieldMax" autocomplete="off" />
          </dahc-form-field>
        } @else {
          <p class="dialog-text" i18n="@@portal.admin.clients.idamClientIdFixed">IDAM client id: {{ client()?.idamClientId }}</p>
        }
        <dahc-form-field
          i18n-label="@@portal.admin.clients.name"
          label="Name"
          [required]="true"
          [invalid]="errorFor('name') !== ''"
          [error]="errorFor('name')">
          <input dahcInput type="text" formControlName="name" [attr.maxlength]="fieldMax" autocomplete="off" />
        </dahc-form-field>
        <fieldset>
          <legend i18n="@@portal.admin.clients.permissions">Permissions</legend>
          <dahc-checkbox formControlName="paymentEvents">{{ paymentEventsLabel }}</dahc-checkbox>
        </fieldset>
        <dahc-checkbox formControlName="isActive" i18n="@@portal.admin.clients.active">Active (the client can call the API)</dahc-checkbox>
        @if (stale()) {
          <dahc-alert variant="warning" [announce]="true">
            <span i18n="@@portal.admin.clients.stale">Someone else changed this client while you were editing. Close this dialog and reload the list, then make your change again.</span>
          </dahc-alert>
        } @else if (error() !== '') {
          <dahc-alert variant="error" [announce]="true">{{ error() }}</dahc-alert>
        }
      </form>
      <div dahcDialogFooter class="dialog-buttons">
        <button dahc-button type="button" variant="secondary" (click)="open.set(false)" i18n="@@portal.action.cancel">Cancel</button>
        <button dahc-button type="button" [loading]="busy()" [disabled]="stale()" (click)="submit()">{{ confirmLabel() }}</button>
      </div>
    </dahc-modal>
  `,
})
export class IntegrationClientDialogComponent {
  private readonly api = inject(AdminApiService);
  private readonly toasts = inject(DahcToastService);

  /** Null registers a new client; a client is edited. */
  readonly client = input<IntegrationClient | null>(null);
  readonly open = model<boolean>(false);
  readonly saved = output<IntegrationClient>();
  /** Emitted when the client changed elsewhere (409), so the list reloads. */
  readonly staleDetected = output<void>();

  protected readonly fieldMax = FIELD_MAX;
  protected readonly paymentEventsLabel = permissionLabel('payments.events-write');
  protected readonly form = new FormGroup({
    idamClientId: new FormControl<string>('', { nonNullable: true, validators: [Validators.maxLength(FIELD_MAX)] }),
    name: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(FIELD_MAX)] }),
    paymentEvents: new FormControl<boolean>(false, { nonNullable: true }),
    isActive: new FormControl<boolean>(true, { nonNullable: true }),
  });
  protected readonly busy = signal<boolean>(false);
  protected readonly error = signal<string>('');
  protected readonly stale = signal<boolean>(false);
  protected readonly attempted = signal<boolean>(false);

  private readonly formValue = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });
  private idempotencyKey = crypto.randomUUID();

  protected readonly heading = computed<string>(() =>
    this.client() === null
      ? $localize`:@@portal.admin.clients.registerHeading:Register an integration client`
      : $localize`:@@portal.admin.clients.editHeading:Edit integration client`,
  );
  protected readonly confirmLabel = computed<string>(() =>
    this.client() === null ? $localize`:@@portal.admin.clients.register:Register` : $localize`:@@portal.admin.clients.save:Save changes`,
  );

  constructor() {
    effect(() => {
      if (this.open()) {
        const client = this.client();
        untracked(() => {
          this.idempotencyKey = crypto.randomUUID();
          this.form.reset({
            idamClientId: client?.idamClientId ?? '',
            name: client?.name ?? '',
            paymentEvents: client?.permissions.includes('payments.events-write') ?? false,
            isActive: client?.isActive ?? true,
          });
          this.attempted.set(false);
          this.error.set('');
          this.stale.set(false);
        });
      }
    });
  }

  protected errorFor(name: 'idamClientId' | 'name'): string {
    this.formValue();
    const value = this.form.controls[name].value.trim();

    if (!this.attempted()) {
      return '';
    }

    if (value === '' && (name === 'name' || this.client() === null)) {
      return $localize`:@@portal.error.required:This field is required.`;
    }

    return value.length > FIELD_MAX ? $localize`:@@portal.admin.error.tooLong:This is too long.` : '';
  }

  protected async submit(): Promise<void> {
    this.attempted.set(true);

    if (this.errorFor('idamClientId') !== '' || this.errorFor('name') !== '') {
      return;
    }

    const value = this.form.getRawValue();
    const client = this.client();
    const permissions: IntegrationPermission[] = value.paymentEvents ? ['payments.events-write'] : [];
    const input: IntegrationClientInput = {
      idamClientId: client?.idamClientId ?? value.idamClientId.trim(),
      name: value.name.trim(),
      isActive: value.isActive,
      permissions,
    };

    this.busy.set(true);
    this.error.set('');

    try {
      const result = await firstValueFrom(
        client === null
          ? this.api.registerIntegrationClient(input, this.idempotencyKey, callerHandlesProblems())
          : this.api.updateIntegrationClient(client.integrationClientId, input, client.version, callerHandlesProblems()),
      );
      this.toasts.show({
        variant: 'success',
        heading:
          client === null
            ? $localize`:@@portal.admin.clients.registered:${result.data.name}:name: is registered`
            : $localize`:@@portal.admin.clients.saved:${result.data.name}:name: is saved`,
      });
      this.open.set(false);
      this.saved.emit(result.data);
    } catch (error: unknown) {
      if (client !== null && isApiProblemError(error) && error.problem.status === 409 && error.problem.code === STALE) {
        this.stale.set(true);
        this.staleDetected.emit();
      } else {
        this.error.set(
          isApiProblemError(error) ? (error.problem.detail ?? error.problem.title) : $localize`:@@portal.problem.unexpected:Something went wrong. Please try again later.`,
        );
      }
    } finally {
      this.busy.set(false);
    }
  }
}
