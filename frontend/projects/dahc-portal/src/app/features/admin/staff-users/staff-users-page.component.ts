import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  DahcAlertComponent,
  DahcButtonComponent,
  DahcEmptyStateComponent,
  DahcPageHeaderComponent,
  DahcSearchComponent,
  DahcSelectComponent,
  DahcSelectOption,
  DahcTableCellDirective,
  DahcTableColumn,
  DahcTableComponent,
  DahcTableRow,
  DahcTagComponent,
} from 'dahc-ui';
import { debounceTime, map } from 'rxjs';

import { AdminApiService } from '../../../api/admin-api.service';
import { StaffUser } from '../../../api/admin.models';
import { STAFF_ROLE_CODES, roleLabel } from '../../../core/auth/roles';
import { CursorList } from '../../../shared/cursor-list/cursor-list';
import { LoadMoreComponent } from '../../../shared/cursor-list/load-more.component';
import { PreRegisterDialogComponent } from './pre-register-dialog.component';

interface StaffUserRow extends DahcTableRow {
  readonly id: string;
  readonly displayName: string;
  readonly email: string;
  readonly roleLabels: readonly string[];
  readonly isActive: boolean;
  readonly signedIn: string;
}

const ALL = '';

/**
 * Staff users (contract listStaffUsers, preRegisterStaffUser): search by name or email, filter by
 * role and status, and pre-register new staff. Administrator only.
 */
@Component({
  selector: 'dahc-staff-users-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcAlertComponent,
    DahcButtonComponent,
    DahcEmptyStateComponent,
    DahcPageHeaderComponent,
    DahcSearchComponent,
    DahcSelectComponent,
    DahcTableCellDirective,
    DahcTableComponent,
    DahcTagComponent,
    LoadMoreComponent,
    PreRegisterDialogComponent,
    ReactiveFormsModule,
    RouterLink,
  ],
  styleUrl: '../admin-pages.scss',
  template: `
    <dahc-page-header
      i18n-heading="@@portal.admin.staffUsers.heading"
      heading="Staff users"
      i18n-description="@@portal.admin.staffUsers.description"
      description="Pre-register staff, grant or revoke roles and pools, and deactivate accounts."
      [focusOnLoad]="true">
      <div page-header-actions>
        <button dahc-button type="button" (click)="dialogOpen.set(true)" i18n="@@portal.admin.staffUsers.preRegister">Pre-register staff user</button>
      </div>
    </dahc-page-header>
    <div class="dahc-portal-page">
      <section class="section" aria-labelledby="staff-users-list">
        <h2 id="staff-users-list" class="section-heading" i18n="@@portal.admin.staffUsers.listHeading">All staff users</h2>
        <div class="toolbar">
          <dahc-search [formControl]="search" i18n-label="@@portal.admin.staffUsers.search" label="Search by name or email" [showLabel]="true" />
          <dahc-select [formControl]="roleFilter" i18n-label="@@portal.admin.staffUsers.roleFilter" label="Role" i18n-placeholder="@@portal.admin.staffUsers.allRoles" placeholder="All roles" [options]="roleOptions" />
          <dahc-select [formControl]="activeFilter" i18n-label="@@portal.admin.staffUsers.activeFilter" label="Status" i18n-placeholder="@@portal.admin.staffUsers.allStatuses" placeholder="All statuses" [options]="activeOptions" />
        </div>
        @if (list.problem(); as problem) {
          <dahc-alert variant="error" [announce]="true">
            {{ problem.detail ?? problem.title }}
            <button dahc-button type="button" variant="link" (click)="list.reload()" i18n="@@portal.action.tryAgain">Try again</button>
          </dahc-alert>
        }
        @if (list.loaded() && rows().length === 0 && !list.loading()) {
          <dahc-empty-state
            [headingLevel]="3"
            i18n-heading="@@portal.admin.staffUsers.emptyHeading"
            heading="No staff users found"
            i18n-description="@@portal.admin.staffUsers.emptyText"
            description="Change the search or filters, or pre-register a staff user." />
        } @else {
          <dahc-table
            i18n-caption="@@portal.admin.staffUsers.caption"
            caption="Staff users"
            [columns]="columns"
            [rows]="rows()"
            [loading]="list.loading()"
            scrollX="760px">
            <ng-template dahcTableCell="displayName" let-row>
              <a [routerLink]="['/admin/staff-users', asRow(row).id]">{{ asRow(row).displayName }}</a>
            </ng-template>
            <ng-template dahcTableCell="roleLabels" let-row>
              <span class="tags">
                @for (role of asRow(row).roleLabels; track role) {
                  <dahc-tag purpose="informative-blue" appearance="outline">{{ role }}</dahc-tag>
                }
              </span>
            </ng-template>
            <ng-template dahcTableCell="isActive" let-row>
              @if (asRow(row).isActive) {
                <dahc-tag purpose="success" i18n="@@portal.admin.status.active">Active</dahc-tag>
              } @else {
                <dahc-tag purpose="error" i18n="@@portal.admin.status.inactive">Deactivated</dahc-tag>
              }
            </ng-template>
          </dahc-table>
          <dahc-load-more [shown]="rows().length" [hasMore]="list.hasMore()" [loading]="list.loading()" (loadMore)="list.loadMore()" />
        }
      </section>
    </div>
    <dahc-pre-register-dialog [(open)]="dialogOpen" (registered)="onRegistered($event)" />
  `,
})
export class StaffUsersPageComponent {
  private readonly api = inject(AdminApiService);
  private readonly router = inject(Router);

  protected readonly dialogOpen = signal<boolean>(false);
  protected readonly search = new FormControl<string>('', { nonNullable: true });
  protected readonly roleFilter = new FormControl<string>(ALL, { nonNullable: true });
  protected readonly activeFilter = new FormControl<string>(ALL, { nonNullable: true });
  protected readonly roleOptions: readonly DahcSelectOption[] = STAFF_ROLE_CODES.map(code => ({ value: code, label: roleLabel(code) }));
  protected readonly activeOptions: readonly DahcSelectOption[] = [
    { value: 'true', label: $localize`:@@portal.admin.status.active:Active` },
    { value: 'false', label: $localize`:@@portal.admin.status.inactive:Deactivated` },
  ];
  protected readonly columns: readonly DahcTableColumn[] = [
    { key: 'displayName', title: $localize`:@@portal.admin.staffUsers.colName:Name` },
    { key: 'email', title: $localize`:@@portal.admin.staffUsers.colEmail:Email` },
    { key: 'roleLabels', title: $localize`:@@portal.admin.staffUsers.colRoles:Roles` },
    { key: 'isActive', title: $localize`:@@portal.admin.staffUsers.colStatus:Status` },
    { key: 'signedIn', title: $localize`:@@portal.admin.staffUsers.colSignedIn:Signed in` },
  ];

  private readonly query = toSignal(this.search.valueChanges.pipe(debounceTime(300)), { initialValue: '' });
  private readonly role = toSignal(this.roleFilter.valueChanges, { initialValue: ALL });
  private readonly active = toSignal(this.activeFilter.valueChanges, { initialValue: ALL });

  protected readonly list = new CursorList<StaffUser>(cursor => {
    const active = this.active();

    return this.api
      .listStaffUsers({ cursor, q: this.query().trim(), roleCode: this.role() || null, isActive: active === ALL ? null : active === 'true' })
      .pipe(map(result => ({ items: result.data, nextCursor: result.pagination?.nextCursor ?? null })));
  });

  protected readonly rows = computed<readonly StaffUserRow[]>(() =>
    this.list.items().map(user => ({
      id: user.staffUserId,
      displayName: user.displayName,
      email: user.email,
      roleLabels: user.roles.map(role => roleLabel(role.roleCode)),
      isActive: user.isActive,
      signedIn: user.hasSignedIn ? $localize`:@@portal.admin.yes:Yes` : $localize`:@@portal.admin.notYet:Not yet`,
    })),
  );

  constructor() {
    effect(() => {
      this.query();
      this.role();
      this.active();
      untracked(() => this.list.reload());
    });
  }

  protected onRegistered(user: StaffUser): void {
    void this.router.navigate(['/admin/staff-users', user.staffUserId]);
  }

  protected asRow(row: DahcTableRow): StaffUserRow {
    return row as StaffUserRow;
  }
}
