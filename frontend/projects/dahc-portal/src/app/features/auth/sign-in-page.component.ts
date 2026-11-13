import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { DahcAlertComponent, DahcButtonComponent, DahcCardComponent, DahcPageHeaderComponent } from 'dahc-ui';

import { DAHC_ALTERNATIVE_SIGN_IN } from '../../core/auth/alternative-sign-in';
import { AuthService } from '../../core/auth/auth.service';

/**
 * Sign-in hand-off (US-1.1.2). Candidates sign in with their Dubai Health (IDAM) account or UAE
 * Pass through IDAM; the portal never sees credentials. The mock build lists personas instead.
 */
@Component({
  selector: 'dahc-sign-in-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcAlertComponent, DahcButtonComponent, DahcCardComponent, DahcPageHeaderComponent],
  styles: `
    .sign-in { display: grid; gap: var(--dahc-space-6); max-inline-size: var(--dahc-size-container-max); margin-inline: auto; padding: var(--dahc-space-8) var(--dahc-space-4); }
    @media (min-width: 48rem) { .sign-in { padding-inline: var(--dahc-space-6); } }
    .sign-in-text { margin: 0; color: var(--dahc-color-text-secondary); }
    .persona-list { display: grid; gap: var(--dahc-space-3); margin: 0; padding: 0; list-style: none; }
    @media (min-width: 48rem) { .persona-list { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    .persona { display: grid; gap: var(--dahc-space-2); justify-items: start; block-size: 100%; }
    .persona h3 { margin: 0; font-size: var(--dahc-type-heading-4-size); line-height: var(--dahc-type-heading-4-line-height); }
    .persona p { margin: 0; color: var(--dahc-color-text-secondary); }
  `,
  template: `
    <dahc-page-header
      i18n-heading="@@portal.signInPage.heading"
      heading="Sign in to GME Admissions"
      i18n-description="@@portal.signInPage.description"
      description="Apply for graduate medical education programs at Dubai Health."
      [focusOnLoad]="true" />
    <div class="sign-in">
      @if (alternative; as mock) {
        <dahc-alert variant="info" i18n-heading="@@portal.signInPage.mockHeading" heading="Mock environment">
          <p class="sign-in-text" i18n="@@portal.signInPage.mockText">
            This build uses sample data instead of the admission service. Choose a candidate to continue. One-time codes are 123456.
          </p>
        </dahc-alert>
        <ul class="persona-list">
          @for (persona of mock.personas; track persona.id) {
            <li>
              <dahc-card class="persona">
                <h3>{{ persona.name }}</h3>
                <p>{{ persona.description }}</p>
                <button dahc-button type="button" size="sm" (click)="mock.signInAs(persona.id, returnPath())" i18n="@@portal.signInPage.continueAs">
                  Continue as {{ persona.name }}
                </button>
              </dahc-card>
            </li>
          }
        </ul>
        @if (mock.reset) {
          <div>
            <button dahc-button type="button" variant="link" (click)="mock.reset()" i18n="@@portal.signInPage.reset">Restore the sample data</button>
          </div>
        }
      } @else {
        <dahc-card i18n-heading="@@portal.signInPage.cardHeading" heading="Sign in with your Dubai Health account or UAE Pass">
          <p class="sign-in-text" i18n="@@portal.signInPage.cardText">
            You will continue to the Dubai Health sign-in page. New candidates can create an account there.
          </p>
          <div card-footer>
            <button dahc-button type="button" (click)="signIn()" i18n="@@portal.action.signIn">Sign in</button>
          </div>
        </dahc-card>
      }
    </div>
  `,
})
export class SignInPageComponent {
  private readonly auth = inject(AuthService);

  /** Where to continue after signing in (query parameter; the router binds undefined when it is absent). */
  readonly returnUrl = input<string | undefined>(undefined);

  protected readonly alternative = inject(DAHC_ALTERNATIVE_SIGN_IN);

  protected returnPath(): string {
    const url = this.returnUrl();

    // Only paths inside the portal, never another origin.
    return url?.startsWith('/') && !url.startsWith('//') ? url : '/candidate/dashboard';
  }

  protected signIn(): void {
    this.auth.signIn(this.returnPath());
  }
}
