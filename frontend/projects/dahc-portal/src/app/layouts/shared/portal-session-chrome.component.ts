import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { DahcButtonComponent, DahcModalComponent } from 'dahc-ui';

import { AuthService } from '../../core/auth/auth.service';
import { InactivityService } from '../../core/session/inactivity.service';

/**
 * Inactivity sign-out shared by every signed-in layout (candidate and staff): starts the timer
 * for the layout's lifetime and shows the two-minute warning (A-11).
 */
@Component({
  selector: 'dahc-portal-session-chrome',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcButtonComponent, DahcModalComponent],
  styles: `
    .session-text { margin: 0; }
    .session-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: var(--dahc-space-3); }
  `,
  template: `
    <dahc-modal
      [open]="inactivity.warning()"
      [closable]="false"
      [closeOnBackdrop]="false"
      size="sm"
      i18n-heading="@@portal.session.warningHeading"
      heading="Are you still there?">
      <p class="session-text" i18n="@@portal.session.warningText">
        For your security, you will be signed out in {{ inactivity.secondsLeft() }} seconds because you have not been active.
        Save your work before you leave.
      </p>
      <div dahcDialogFooter class="session-actions">
        <button dahc-button type="button" variant="secondary" (click)="signOut()" i18n="@@portal.action.signOut">Sign out</button>
        <button dahc-button type="button" (click)="inactivity.staySignedIn()" i18n="@@portal.session.stay">Stay signed in</button>
      </div>
    </dahc-modal>
  `,
})
export class PortalSessionChromeComponent {
  private readonly auth = inject(AuthService);

  protected readonly inactivity = inject(InactivityService);

  constructor() {
    this.inactivity.start(inject(DestroyRef));
  }

  protected signOut(): void {
    void this.auth.signOut();
  }
}
