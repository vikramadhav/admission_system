import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DahcAlertComponent, DahcButtonComponent, DahcPageHeaderComponent } from 'dahc-ui';

import { AuthService } from '../../core/auth/auth.service';
import { SessionService } from '../../core/auth/session.service';

/**
 * The IDAM redirect URI. After a completed sign-in it continues to the saved route; when
 * IDAM was cancelled, failed or unreachable, or the DAHC session could not be started,
 * it explains what happened and offers to try again.
 */
@Component({
  selector: 'dahc-sign-in-status',
  templateUrl: './sign-in-status.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcAlertComponent, DahcButtonComponent, DahcPageHeaderComponent],
})
export class SignInStatusComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly sessions = inject(SessionService);
  private readonly router = inject(Router);

  protected readonly problem = this.sessions.problem;
  protected readonly hasFailed = computed<boolean>(
    () => this.auth.failure() !== null || this.sessions.problem() !== null || !this.auth.isAuthenticated(),
  );
  protected readonly failureMessage = computed<string>(() => {
    const problem = this.sessions.problem();

    if (problem !== null) {
      return problem.detail ?? problem.title;
    }

    if (this.auth.failure() === 'idam_unavailable') {
      return $localize`:@@portal.signIn.unavailable:The sign-in service is not available right now. Please try again in a few minutes.`;
    }

    return $localize`:@@portal.signIn.notCompleted:Sign-in was cancelled or could not be completed. No account changes were made.`;
  });

  ngOnInit(): void {
    if (!this.hasFailed()) {
      void this.router.navigateByUrl(this.auth.consumeReturnPath(), { replaceUrl: true });
    }
  }

  protected tryAgain(): void {
    this.auth.signIn();
  }
}
