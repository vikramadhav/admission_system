import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { DahcAppHeaderComponent, DahcButtonComponent, DahcModalComponent, DahcNavLink, DahcToastRegionComponent } from 'dahc-ui';
import { filter, map, startWith } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { SessionService } from '../../core/auth/session.service';
import { LanguageLink, LocaleService } from '../../core/locale/locale.service';
import { InactivityService } from '../../core/session/inactivity.service';
import { PortalFooterComponent } from '../shared/portal-footer.component';
import { PortalProblemComponent } from '../shared/portal-problem.component';

/**
 * Candidate area layout (Figma page structure): header with the candidate navigation, the API
 * message area, the routed page, footer, toasts and the inactivity sign-out warning.
 */
@Component({
  selector: 'dahc-candidate-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcAppHeaderComponent,
    DahcButtonComponent,
    DahcModalComponent,
    DahcToastRegionComponent,
    PortalFooterComponent,
    PortalProblemComponent,
    RouterOutlet,
  ],
  styleUrl: '../shared/layout.scss',
  template: `
    <dahc-app-header
      i18n-productName="@@portal.productName"
      productName="GME Admissions"
      logoSrc="brand/mbru-logo.svg"
      i18n-logoAlt="@@portal.brand.logoAlt"
      logoAlt="Dubai Health, Mohammed Bin Rashid University of Medicine and Health Sciences"
      mainContentId="main-content"
      [navItems]="navItems()"
      i18n-navLabel="@@portal.nav.label"
      navLabel="Candidate"
      [languageHref]="languageLink()?.href ?? ''"
      [languageLabel]="languageLink()?.label ?? ''"
      [languageCode]="languageLink()?.languageCode ?? ''"
      [signedIn]="session() !== null"
      [userName]="session()?.displayName ?? ''"
      (signOut)="signOut()" />
    <main id="main-content" class="dahc-layout-main" tabindex="-1">
      <dahc-portal-problem />
      <router-outlet />
    </main>
    <dahc-portal-footer />
    <dahc-toast-region />

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
export class CandidateLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly locale = inject(LocaleService);
  private readonly router = inject(Router);
  private readonly url = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { requireSync: true },
  );

  protected readonly inactivity = inject(InactivityService);
  protected readonly session = inject(SessionService).session;

  protected readonly navItems = computed<readonly DahcNavLink[]>(() => {
    const url = this.url();

    return [
      {
        label: $localize`:@@portal.nav.home:Home`,
        route: '/candidate/dashboard',
        current: url.startsWith('/candidate/dashboard'),
      },
      {
        label: $localize`:@@portal.nav.applications:My applications`,
        route: '/candidate/applications',
        current: url.startsWith('/candidate/applications'),
      },
      {
        label: $localize`:@@portal.nav.account:My account`,
        route: '/candidate/account',
        current: url.startsWith('/candidate/account'),
      },
    ];
  });

  protected readonly languageLink = computed<LanguageLink | null>(() => {
    this.url();

    return this.locale.otherLanguageLink();
  });

  constructor() {
    this.inactivity.start(inject(DestroyRef));
  }

  protected signOut(): void {
    void this.auth.signOut();
  }
}
