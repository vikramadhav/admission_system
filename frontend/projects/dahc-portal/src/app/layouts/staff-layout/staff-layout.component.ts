import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { DahcAppHeaderComponent, DahcNavLink, DahcToastRegionComponent } from 'dahc-ui';
import { filter, map, startWith } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { SessionService } from '../../core/auth/session.service';
import { LanguageLink, LocaleService } from '../../core/locale/locale.service';
import { PermissionService } from '../../core/permissions/permission.service';
import { RoleSyncService } from '../../core/session/role-sync.service';
import { PortalFooterComponent } from '../shared/portal-footer.component';
import { PortalProblemComponent } from '../shared/portal-problem.component';
import { PortalSessionChromeComponent } from '../shared/portal-session-chrome.component';
import { RoleSwitchComponent } from '../shared/role-switch.component';
import { staffNavItems } from './staff-nav';

/**
 * Layout of the staff areas (admission, scoring, finance, monitoring, admin): header with the
 * navigation the active role may use, the role switch, the API message area, the routed page,
 * footer, toasts and the shared inactivity sign-out. Each area's routes load it as their parent.
 */
@Component({
  selector: 'dahc-staff-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcAppHeaderComponent,
    DahcToastRegionComponent,
    PortalFooterComponent,
    PortalProblemComponent,
    PortalSessionChromeComponent,
    RoleSwitchComponent,
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
      i18n-navLabel="@@portal.nav.staffLabel"
      navLabel="Staff"
      [languageHref]="languageLink()?.href ?? ''"
      [languageLabel]="languageLink()?.label ?? ''"
      [languageCode]="languageLink()?.languageCode ?? ''"
      [signedIn]="session() !== null"
      [userName]="session()?.displayName ?? ''"
      (signOut)="signOut()" />
    <dahc-role-switch />
    <main id="main-content" class="dahc-layout-main" tabindex="-1">
      <dahc-portal-problem />
      <router-outlet />
    </main>
    <dahc-portal-footer />
    <dahc-toast-region />
    <dahc-portal-session-chrome />
  `,
})
export class StaffLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly locale = inject(LocaleService);
  private readonly permissions = inject(PermissionService);
  private readonly router = inject(Router);
  private readonly url = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { requireSync: true },
  );

  protected readonly session = inject(SessionService).session;

  protected readonly navItems = computed<readonly DahcNavLink[]>(() => {
    const url = this.url();
    this.permissions.permissions();

    return staffNavItems()
      .filter(item => this.permissions.has(item.permission))
      .map(item => ({ label: item.label, route: item.route, current: url === item.route || url.startsWith(item.route + '/') }));
  });

  protected readonly languageLink = computed<LanguageLink | null>(() => {
    this.url();

    return this.locale.otherLanguageLink();
  });

  constructor() {
    inject(RoleSyncService).start(inject(DestroyRef));
  }

  protected signOut(): void {
    void this.auth.signOut();
  }
}
