import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DahcAlertComponent, DahcButtonComponent, DahcPageHeaderComponent } from 'dahc-ui';

import { AuthService } from '../../core/auth/auth.service';

export type StatusPageKind = 'signed-out' | 'not-allowed' | 'duplicate-account' | 'not-found';

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
export class StatusPageComponent {
  readonly kind = input<StatusPageKind>('not-found');

  private readonly auth = inject(AuthService);

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
  protected readonly showSignOut = computed<boolean>(() => this.kind() === 'duplicate-account');
  protected readonly showDashboardLink = computed<boolean>(() => this.kind() === 'not-found');

  protected signIn(): void {
    this.auth.signIn();
  }

  protected signOut(): void {
    void this.auth.signOut();
  }
}
