import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DahcAlertComponent, DahcButtonComponent, DahcPageHeaderComponent } from 'dahc-ui';

import { AuthService } from '../../core/auth/auth.service';
import { SessionService } from '../../core/auth/session.service';
import { RoleSyncService } from '../../core/session/role-sync.service';

export type StatusPageKind = 'signed-out' | 'not-allowed' | 'no-area' | 'duplicate-account' | 'not-found';

interface StatusPageText {
  readonly heading: string;
  readonly message: string;
}

/** Simple pages reached by navigation outcomes, selected by the route's data.kind. */
@Component({
  selector: 'dahc-status-page',
  templateUrl: './status-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcAlertComponent, DahcButtonComponent, DahcPageHeaderComponent, RouterLink],
})
export class StatusPageComponent implements OnInit {
  readonly kind = input<StatusPageKind>('not-found');

  private readonly auth = inject(AuthService);
  private readonly roleSync = inject(RoleSyncService);
  private readonly session = inject(SessionService).session;

  protected readonly text = computed<StatusPageText>(() => {
    switch (this.kind()) {
      case 'signed-out':
        return {
          heading: $localize`:@@portal.status.signedOut.heading:You have signed out`,
          message: $localize`:@@portal.status.signedOut.message:Your session has ended. Sign in again to continue with your application.`,
        };
      case 'not-allowed':
        return {
          heading: $localize`:@@portal.status.notAllowed.heading:You cannot open this page`,
          message: $localize`:@@portal.status.notAllowed.message:Your account does not have access to this page. If you think this is wrong, contact the admissions team.`,
        };
      case 'no-area':
        return {
          heading: $localize`:@@portal.status.noArea.heading:There is no portal area for your role`,
          message: $localize`:@@portal.status.noArea.message:Your account is signed in, but your current role has no screens in this portal. Contact the admissions team if you need access.`,
        };
      case 'duplicate-account':
        return {
          heading: $localize`:@@portal.status.duplicate.heading:Please use your original account`,
          message: $localize`:@@portal.status.duplicate.message:We found another account with the same Emirates ID, passport or mobile number. Sign out, then sign in with the account you created first. The admissions team has been told about the duplicate.`,
        };
      case 'not-found':
        return {
          heading: $localize`:@@portal.status.notFound.heading:Page not found`,
          message: $localize`:@@portal.status.notFound.message:The page you asked for does not exist or is no longer available.`,
        };
    }
  });

  protected readonly showSignIn = computed<boolean>(() => this.kind() === 'signed-out');
  protected readonly showSignOut = computed<boolean>(() => this.kind() === 'duplicate-account' || this.kind() === 'no-area');
  protected readonly showHomeLink = computed<boolean>(
    () => this.kind() === 'not-found' || (this.kind() === 'not-allowed' && this.session() !== null),
  );

  ngOnInit(): void {
    // A 403 can mean the active role was switched in another tab: follow it if so.
    if (this.kind() === 'not-allowed' && this.session() !== null) {
      void this.roleSync.checkForChange();
    }
  }

  protected signIn(): void {
    this.auth.signIn();
  }

  protected signOut(): void {
    void this.auth.signOut();
  }
}
