import { DOCUMENT, DestroyRef, Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DahcToastService } from 'dahc-ui';

import { isApiProblemError } from '../api/api-problem-error';
import { roleHome, roleLabel } from '../auth/roles';
import { SessionService } from '../auth/session.service';

/**
 * Keeps the portal on the server-stored active role (standards s.23). A switch calls
 * PUT /auth/active-role, then the navigation, permissions and guards follow from the new session
 * and the user moves to that role's home. Because a switch applies to every tab and device, the
 * session is read again whenever the tab comes back into view.
 *
 * Temporary: the switch exists while staff users hold several roles and IDAM integration is
 * pending; once each user has one role it disappears on its own (it shows only for 2+ roles).
 */
@Injectable({ providedIn: 'root' })
export class RoleSyncService {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly sessions = inject(SessionService);
  private readonly toasts = inject(DahcToastService);
  private readonly switchingState = signal<boolean>(false);

  /** True while a switch request is in flight. */
  readonly switching = this.switchingState.asReadonly();

  private readonly onVisibilityChange = (): void => {
    if (this.document.visibilityState === 'visible') {
      void this.checkForChange();
    }
  };

  /** Watches for role changes made in other tabs for the lifetime of the given scope (a layout). */
  start(destroyRef: DestroyRef): void {
    this.document.addEventListener('visibilitychange', this.onVisibilityChange);
    destroyRef.onDestroy(() => this.document.removeEventListener('visibilitychange', this.onVisibilityChange));
  }

  /** Switches to another role the user holds and opens its home page. */
  async switchTo(roleCode: string): Promise<void> {
    if (this.switchingState() || roleCode === this.sessions.session()?.activeRole) {
      return;
    }

    this.switchingState.set(true);

    try {
      const session = await this.sessions.switchRole(roleCode);
      await this.router.navigateByUrl(roleHome(session.activeRole));
      this.toasts.show({
        variant: 'success',
        heading: $localize`:@@portal.roleSwitch.switchedHeading:You are now working as ${roleLabel(session.activeRole)}:role:`,
      });
    } catch (error: unknown) {
      if (!isApiProblemError(error)) {
        throw error;
      }

      this.toasts.show({
        variant: 'error',
        heading: $localize`:@@portal.roleSwitch.failedHeading:Your role could not be changed`,
        message: error.problem.detail ?? error.problem.title,
        duration: 0,
      });
    } finally {
      this.switchingState.set(false);
    }
  }

  /** Reads the session again; if another tab switched the role, follows it to the new home. */
  async checkForChange(): Promise<void> {
    const before = this.sessions.session()?.activeRole;
    const after = (await this.sessions.refresh())?.activeRole;

    if (after === undefined || after === before) {
      return;
    }

    await this.router.navigateByUrl(roleHome(after));
    this.toasts.show({
      variant: 'info',
      heading: $localize`:@@portal.roleSwitch.changedElsewhereHeading:Your role changed to ${roleLabel(after)}:role:`,
      message: $localize`:@@portal.roleSwitch.changedElsewhereMessage:It was changed in another tab or device, so this page now shows that role.`,
    });
  }
}
