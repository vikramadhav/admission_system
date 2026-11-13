import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DahcMenuComponent, DahcMenuItem } from 'dahc-ui';

import { roleLabel } from '../../core/auth/roles';
import { SessionService } from '../../core/auth/session.service';
import { RoleSyncService } from '../../core/session/role-sync.service';

/**
 * Active-role switch, attached to the bottom of the header (dahc-app-header has no slot for it,
 * GAP-01). Shown only to staff users who hold more than one role (standards s.23); candidates
 * never see it.
 *
 * Temporary (owner, 2026-11-13): it stays while IDAM integration is pending and users may hold
 * several roles. Once every user has a single role it no longer renders, and it can be deleted.
 */
@Component({
  selector: 'dahc-role-switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcMenuComponent],
  styles: `
    :host { display: block; }
    .role-bar {
      background-color: var(--dahc-color-surface);
      border-block-end: 1px solid var(--dahc-color-border-subtle);
    }
    .role-bar-inner {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: flex-end;
      gap: var(--dahc-space-3);
      max-inline-size: var(--dahc-size-container-max);
      margin-inline: auto;
      padding-block: var(--dahc-space-2);
      padding-inline: var(--dahc-space-4);
    }
    .role-current {
      margin: 0;
      color: var(--dahc-color-text-secondary);
      font-size: var(--dahc-type-body-sm-size);
      line-height: var(--dahc-type-body-sm-line-height);
    }
    .role-current strong { color: var(--dahc-color-text-primary); }
  `,
  template: `
    @if (otherRoles().length > 0) {
      <nav class="role-bar" i18n-aria-label="@@portal.roleSwitch.label" aria-label="Role">
        <div class="role-bar-inner">
          <p class="role-current" i18n="@@portal.roleSwitch.current">Working as <strong>{{ activeRoleLabel() }}</strong></p>
          <dahc-menu
            i18n-label="@@portal.roleSwitch.button"
            label="Switch role"
            size="sm"
            [disabled]="roleSync.switching()"
            [items]="otherRoles()"
            (itemSelected)="switchTo($event)" />
        </div>
      </nav>
    }
  `,
})
export class RoleSwitchComponent {
  private readonly session = inject(SessionService).session;

  protected readonly roleSync = inject(RoleSyncService);

  protected readonly activeRoleLabel = computed<string>(() => roleLabel(this.session()?.activeRole ?? ''));

  protected readonly otherRoles = computed<readonly DahcMenuItem[]>(() => {
    const session = this.session();

    if (session === null || session.userType !== 'STAFF') {
      return [];
    }

    return session.roles.filter(role => role !== session.activeRole).map(role => ({ value: role, label: roleLabel(role) }));
  });

  protected switchTo(role: string): void {
    void this.roleSync.switchTo(role);
  }
}
