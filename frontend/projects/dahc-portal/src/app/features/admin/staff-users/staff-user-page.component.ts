import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  DahcAlertComponent,
  DahcButtonComponent,
  DahcCardComponent,
  DahcDetailItem,
  DahcDetailListComponent,
  DahcFormFieldComponent,
  DahcInputDirective,
  DahcModalComponent,
  DahcNavLink,
  DahcPageHeaderComponent,
  DahcSkeletonComponent,
  DahcTagComponent,
  DahcToastService,
} from 'dahc-ui';
import { firstValueFrom, map } from 'rxjs';

import { AdminApiService } from '../../../api/admin-api.service';
import { StaffUser } from '../../../api/admin.models';
import { isApiProblemError } from '../../../core/api/api-problem-error';
import { callerHandlesProblems } from '../../../core/api/api-request';
import { roleLabel } from '../../../core/auth/roles';
import { StaffRoleFieldsComponent, checkedRoles, staffRoleForm } from './staff-role-fields.component';

const REASON_MAX = 500;
const STALE = 'request.precondition_failed';

/**
 * One staff user (contract getStaffUser, setStaffUserRoles, deactivateStaffUser,
 * reactivateStaffUser). Role changes send the user's `version` as If-Match; a stale version gets
 * 409 and the page offers to reload. A removed active role falls back to another role the user
 * still holds (standards s.15).
 */
@Component({
  selector: 'dahc-staff-user-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcAlertComponent,
    DahcButtonComponent,
    DahcCardComponent,
    DahcDetailListComponent,
    DahcFormFieldComponent,
    DahcInputDirective,
    DahcModalComponent,
    DahcPageHeaderComponent,
    DahcSkeletonComponent,
    DahcTagComponent,
    ReactiveFormsModule,
    StaffRoleFieldsComponent,
  ],
  styleUrl: '../admin-pages.scss',
  template: `
    <dahc-page-header [heading]="heading()" [breadcrumbs]="breadcrumbs()" [focusOnLoad]="true">
      @if (user(); as current) {
        <div page-header-status>
          @if (current.isActive) {
            <dahc-tag purpose="success" i18n="@@portal.admin.status.active">Active</dahc-tag>
          } @else {
            <dahc-tag purpose="error" i18n="@@portal.admin.status.inactive">Deactivated</dahc-tag>
          }
        </div>
      }
    </dahc-page-header>
    <div class="dahc-portal-page">
      @if (resource.error(); as failure) {
        <dahc-alert variant="error" [announce]="true">
          {{ problemText(failure) }}
          <button dahc-button type="button" variant="link" (click)="resource.reload()" i18n="@@portal.action.tryAgain">Try again</button>
        </dahc-alert>
      } @else if (user(); as current) {
        <dahc-detail-list i18n-heading="@@portal.admin.staffUser.details" heading="Account" [headingLevel]="2" [columns]="2" [items]="details()" />

        <section class="section" aria-labelledby="staff-user-roles">
          <h2 id="staff-user-roles" class="section-heading" i18n="@@portal.admin.staffUser.rolesHeading">Roles</h2>
          <p class="section-text" i18n="@@portal.admin.staffUser.rolesNote">
            Changes apply from the user's next request. If you remove the role the user is working in, they continue in another role they still hold.
          </p>
          <div class="dialog-form">
            <dahc-staff-role-fields [form]="roles" i18n-legend="@@portal.admin.roles.legend" legend="Roles" [error]="rolesError()" />
            @if (stale()) {
              <dahc-alert variant="warning" [announce]="true">
                <span i18n="@@portal.admin.staffUser.stale">Someone else changed this user while you were editing. Reload to see the latest roles, then make your change again.</span>
                <button dahc-button type="button" variant="link" (click)="reload()" i18n="@@portal.admin.reload">Reload</button>
              </dahc-alert>
            } @else if (rolesProblem() !== '') {
              <dahc-alert variant="error" [announce]="true">{{ rolesProblem() }}</dahc-alert>
            }
            <div class="actions">
              <button dahc-button type="button" [loading]="savingRoles()" (click)="saveRoles()" i18n="@@portal.admin.staffUser.saveRoles">Save roles</button>
            </div>
          </div>
        </section>

        <dahc-card [heading]="current.isActive ? deactivateHeading : reactivateHeading">
          <p class="dialog-text">
            @if (current.isActive) {
              <span i18n="@@portal.admin.staffUser.deactivateText">A deactivated user can no longer sign in or use the portal. Their history is kept.</span>
            } @else {
              <span i18n="@@portal.admin.staffUser.reactivateText">Reactivating lets the user sign in again with the roles shown above.</span>
            }
          </p>
          <div card-footer class="actions">
            @if (current.isActive) {
              <button dahc-button type="button" variant="danger-outline" (click)="deactivateOpen.set(true)" i18n="@@portal.admin.staffUser.deactivate">Deactivate user</button>
            } @else {
              <button dahc-button type="button" variant="secondary" [loading]="reactivating()" (click)="reactivate()" i18n="@@portal.admin.staffUser.reactivate">Reactivate user</button>
            }
          </div>
          @if (statusProblem() !== '') {
            <dahc-alert variant="error" [announce]="true">{{ statusProblem() }}</dahc-alert>
          }
        </dahc-card>
      } @else {
        <dahc-skeleton [rows]="6" />
      }
    </div>

    <dahc-modal [(open)]="deactivateOpen" i18n-heading="@@portal.admin.deactivate.heading" heading="Deactivate this user?">
      <div class="dialog-form">
        <p class="dialog-text" i18n="@@portal.admin.deactivate.text">{{ user()?.displayName }} will be signed out at their next request and cannot sign in until reactivated.</p>
        <dahc-form-field
          i18n-label="@@portal.admin.deactivate.reason"
          label="Reason"
          [required]="true"
          [showCount]="true"
          [invalid]="reasonError() !== ''"
          [error]="reasonError()">
          <textarea dahcInput [formControl]="reason" [attr.maxlength]="reasonMax"></textarea>
        </dahc-form-field>
        @if (deactivateProblem() !== '') {
          <dahc-alert variant="error" [announce]="true">{{ deactivateProblem() }}</dahc-alert>
        }
      </div>
      <div dahcDialogFooter class="dialog-buttons">
        <button dahc-button type="button" variant="secondary" (click)="deactivateOpen.set(false)" i18n="@@portal.action.cancel">Cancel</button>
        <button dahc-button type="button" variant="danger" [loading]="deactivating()" (click)="deactivate()" i18n="@@portal.admin.staffUser.deactivate">Deactivate user</button>
      </div>
    </dahc-modal>
  `,
})
export class StaffUserPageComponent {
  private readonly api = inject(AdminApiService);
  private readonly toasts = inject(DahcToastService);

  /** Bound from the route. */
  readonly staffUserId = input.required<string>();

  protected readonly reasonMax = REASON_MAX;
  protected readonly deactivateHeading = $localize`:@@portal.admin.staffUser.deactivateHeading:Deactivate account`;
  protected readonly reactivateHeading = $localize`:@@portal.admin.staffUser.reactivateHeading:Reactivate account`;
  protected readonly roles = staffRoleForm();
  protected readonly reason = new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(REASON_MAX)] });
  protected readonly savingRoles = signal<boolean>(false);
  protected readonly rolesAttempted = signal<boolean>(false);
  protected readonly rolesProblem = signal<string>('');
  protected readonly stale = signal<boolean>(false);
  protected readonly deactivateOpen = signal<boolean>(false);
  protected readonly deactivating = signal<boolean>(false);
  protected readonly deactivateAttempted = signal<boolean>(false);
  protected readonly deactivateProblem = signal<string>('');
  protected readonly reactivating = signal<boolean>(false);
  protected readonly statusProblem = signal<string>('');

  /** The latest version from a save, so a second save does not need a reload. */
  private readonly saved = signal<StaffUser | null>(null);
  private readonly rolesValue = toSignal(this.roles.valueChanges, { initialValue: this.roles.getRawValue() });
  private readonly reasonValue = toSignal(this.reason.valueChanges, { initialValue: '' });

  protected readonly resource = rxResource({
    params: () => this.staffUserId(),
    stream: ({ params }) => this.api.getStaffUser(params, callerHandlesProblems()).pipe(map(result => result.data)),
  });

  protected readonly user = computed<StaffUser | null>(() => this.saved() ?? (this.resource.hasValue() ? this.resource.value() : null));

  protected readonly heading = computed<string>(() => this.user()?.displayName ?? $localize`:@@portal.admin.staffUser.loading:Staff user`);
  protected readonly breadcrumbs = computed<readonly DahcNavLink[]>(() => [
    { label: $localize`:@@portal.admin.staffUsers.heading:Staff users`, route: '/admin/staff-users' },
    { label: this.heading() },
  ]);

  protected readonly details = computed<readonly DahcDetailItem[]>(() => {
    const user = this.user();

    if (user === null) {
      return [];
    }

    return [
      { label: $localize`:@@portal.admin.staffUser.email:Email`, value: user.email },
      {
        label: $localize`:@@portal.admin.staffUser.signedIn:Signed in`,
        value: user.hasSignedIn ? $localize`:@@portal.admin.yes:Yes` : $localize`:@@portal.admin.notYet:Not yet`,
      },
      {
        label: $localize`:@@portal.admin.staffUser.activeRole:Working as`,
        value: user.activeRole ? roleLabel(user.activeRole) : $localize`:@@portal.admin.none:None`,
      },
      { label: $localize`:@@portal.admin.staffUser.linkedCandidate:Linked candidate record`, value: user.linkedCandidateId ?? $localize`:@@portal.admin.none:None` },
    ];
  });

  protected readonly rolesError = computed<string>(() => {
    this.rolesValue();

    return this.rolesAttempted() && checkedRoles(this.roles).length === 0
      ? $localize`:@@portal.admin.staffUser.rolesRequired:Keep at least one role. To remove all access, deactivate the user instead.`
      : '';
  });

  protected readonly reasonError = computed<string>(() => {
    this.reasonValue();

    return this.deactivateAttempted() && this.reason.value.trim() === '' ? $localize`:@@portal.error.required:This field is required.` : '';
  });

  constructor() {
    effect(() => {
      const user = this.user();

      if (user !== null) {
        untracked(() => this.roles.reset(Object.fromEntries(this.roleCodesOf(user).map(code => [code, true]))));
      }
    });
    effect(() => {
      if (this.deactivateOpen()) {
        untracked(() => {
          this.reason.reset('');
          this.deactivateAttempted.set(false);
          this.deactivateProblem.set('');
        });
      }
    });
  }

  protected reload(): void {
    this.saved.set(null);
    this.stale.set(false);
    this.rolesProblem.set('');
    this.resource.reload();
  }

  protected async saveRoles(): Promise<void> {
    const user = this.user();
    this.rolesAttempted.set(true);
    const roles = checkedRoles(this.roles);

    if (user === null || roles.length === 0) {
      return;
    }

    this.savingRoles.set(true);
    this.rolesProblem.set('');
    this.stale.set(false);

    try {
      const result = await firstValueFrom(this.api.setStaffUserRoles(user.staffUserId, roles.map(roleCode => ({ roleCode })), user.version, callerHandlesProblems()));
      this.saved.set(result.data);
      this.toasts.show({ variant: 'success', heading: $localize`:@@portal.admin.staffUser.rolesSaved:Roles saved` });
    } catch (error: unknown) {
      if (isApiProblemError(error) && error.problem.status === 409 && error.problem.code === STALE) {
        this.stale.set(true);
      } else {
        this.rolesProblem.set(this.problemText(error));
      }
    } finally {
      this.savingRoles.set(false);
    }
  }

  protected async deactivate(): Promise<void> {
    const user = this.user();
    this.deactivateAttempted.set(true);

    if (user === null || this.reason.value.trim() === '') {
      return;
    }

    this.deactivating.set(true);
    this.deactivateProblem.set('');

    try {
      const result = await firstValueFrom(this.api.deactivateStaffUser(user.staffUserId, this.reason.value.trim(), callerHandlesProblems()));
      this.saved.set(result.data);
      this.deactivateOpen.set(false);
      this.toasts.show({ variant: 'success', heading: $localize`:@@portal.admin.staffUser.deactivated:${user.displayName}:name: is deactivated` });
    } catch (error: unknown) {
      this.deactivateProblem.set(this.problemText(error));
    } finally {
      this.deactivating.set(false);
    }
  }

  protected async reactivate(): Promise<void> {
    const user = this.user();

    if (user === null) {
      return;
    }

    this.reactivating.set(true);
    this.statusProblem.set('');

    try {
      const result = await firstValueFrom(this.api.reactivateStaffUser(user.staffUserId, callerHandlesProblems()));
      this.saved.set(result.data);
      this.toasts.show({ variant: 'success', heading: $localize`:@@portal.admin.staffUser.reactivated:${user.displayName}:name: is active again` });
    } catch (error: unknown) {
      this.statusProblem.set(this.problemText(error));
    } finally {
      this.reactivating.set(false);
    }
  }

  protected problemText(error: unknown): string {
    return isApiProblemError(error) ? (error.problem.detail ?? error.problem.title) : $localize`:@@portal.problem.unexpected:Something went wrong. Please try again later.`;
  }

  private roleCodesOf(user: StaffUser): string[] {
    return user.roles.map(role => role.roleCode);
  }
}
