import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DahcAlertComponent, DahcCardComponent, DahcDetailItem, DahcDetailListComponent, DahcNavLink, DahcPageHeaderComponent } from 'dahc-ui';

import { SessionService } from '../../../core/auth/session.service';

/**
 * My account: the profile the API returns for the session (GET /auth/me). The BRD has no
 * profile page (CJ-21): personal details live in the Personal Information step of an application
 * (D-10) and sign-in details at IDAM.
 */
@Component({
  selector: 'dahc-account-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcAlertComponent, DahcCardComponent, DahcDetailListComponent, DahcPageHeaderComponent, RouterLink],
  styles: `
    .account { display: grid; gap: var(--dahc-space-6); max-inline-size: var(--dahc-size-container-max); margin-inline: auto; padding: var(--dahc-space-8) var(--dahc-space-4) var(--dahc-space-12); }
    @media (min-width: 48rem) { .account { padding-inline: var(--dahc-space-6); } }
    p { margin: 0; }
    /* Links inside an alert take the alert's text colour; the default link blue fails contrast on the info surface. */
    .account-link { color: var(--dahc-color-info-text); font-weight: var(--dahc-font-weight-bold); text-decoration: underline; }
  `,
  template: `
    <dahc-page-header i18n-heading="@@portal.account.heading" heading="My account" [breadcrumbs]="breadcrumbs" [focusOnLoad]="true" />
    <div class="account">
      <dahc-card i18n-heading="@@portal.account.profile" heading="Your profile">
        <dahc-detail-list [items]="details()" [columns]="2" />
      </dahc-card>
      <dahc-alert variant="info">
        <p i18n="@@portal.account.note">
          Your personal and contact details are kept in the Personal Information step of your application. To change your password or
          sign-in method, use your Dubai Health account (UAE Pass users manage their details in UAE Pass).
        </p>
        <p><a class="account-link" routerLink="/candidate/applications" i18n="@@portal.account.goToApplications">Go to my applications</a></p>
      </dahc-alert>
    </div>
  `,
})
export class AccountPageComponent {
  private readonly sessions = inject(SessionService);

  protected readonly breadcrumbs: readonly DahcNavLink[] = [
    { label: $localize`:@@portal.nav.home:Home`, route: '/candidate/dashboard' },
    { label: $localize`:@@portal.nav.account:My account` },
  ];

  protected readonly details = computed<readonly DahcDetailItem[]>(() => {
    const session = this.sessions.session();
    const language =
      session?.preferences.culture === 'ar-AE'
        ? $localize`:@@portal.account.arabic:Arabic`
        : $localize`:@@portal.account.english:English`;

    return [
      { label: $localize`:@@portal.account.name:Name`, value: session?.displayName ?? '' },
      { label: $localize`:@@portal.account.candidateNumber:Candidate number`, value: session?.candidateNumber ?? '' },
      { label: $localize`:@@portal.account.email:E-mail`, value: session?.email ?? '' },
      { label: $localize`:@@portal.account.language:Language`, value: language },
      { label: $localize`:@@portal.account.timeZone:Time zone`, value: this.sessions.timeZoneId() },
    ];
  });
}
