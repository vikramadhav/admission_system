import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { PermissionService } from '../permissions/permission.service';
import { DahcPermission } from '../permissions/permissions';

/**
 * Opens a page inside an area only when the active role has the permission, otherwise the
 * unauthorised page. Runs after the area's roleGuard, so the session already exists. A usability
 * aid only: the API authorizes every request.
 */
export function permissionGuard(permission: DahcPermission): CanActivateFn {
  return () => {
    const permissions = inject(PermissionService);

    return permissions.has(permission) ? true : inject(Router).parseUrl('/unauthorised');
  };
}
