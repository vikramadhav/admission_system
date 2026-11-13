import { Injectable, computed, inject } from '@angular/core';

import { isRoleCode } from '../auth/roles';
import { SessionService } from '../auth/session.service';
import { DahcPermission, ROLE_PERMISSIONS } from './permissions';

/**
 * What the active role may see and start in the portal. A usability aid only: hiding a button
 * or a page is never a security control, because the API authorizes every request.
 */
@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly session = inject(SessionService).session;

  readonly permissions = computed<ReadonlySet<DahcPermission>>(() => {
    const role = this.session()?.activeRole;

    return new Set(role && isRoleCode(role) ? ROLE_PERMISSIONS[role] : []);
  });

  has(permission: DahcPermission): boolean {
    return this.permissions().has(permission);
  }
}
