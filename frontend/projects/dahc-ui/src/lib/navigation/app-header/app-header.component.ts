import { ChangeDetectionStrategy, Component, DOCUMENT, inject, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DahcButtonComponent } from '../../actions/button/button.component';
import { DahcIconButtonComponent } from '../../actions/icon-button/icon-button.component';
import { DahcThemeSwitchComponent } from '../../actions/theme-switch/theme-switch.component';
import { DahcIconComponent } from '../../core/icon/icon.component';
import { DahcBadgeComponent } from '../../data-display/badge/badge.component';
import { DahcDrawerComponent } from '../../feedback/dialog/drawer.component';
import { DahcLogoComponent } from '../logo/logo.component';
import { DahcNavLink } from '../nav-link';

/**
 * Top banner of an application: skip link, logo and product name, main navigation, link to the
 * other language, theme switch, notifications and, when signed in, the user's name and sign-out.
 * Below 1024px the navigation, language and sign-out move into a menu drawer opened by a
 * hamburger button. Figma Navigation › Top navigation 50:10831 (Menu items 50:11253: 80px items,
 * Regular 16/20, current Bold with a 4px navy underline) and the GME header (white 80px bar, navy
 * logo tile, 40px ghost icon buttons with a red badge, language and profile pills). Mobile menu:
 * Burger Menu 50:10087 (365px drawer). With logoSrc the brand is that image tile instead (the GME
 * MBRU tile, Figma 113x111): from 1024px it is 112px tall and overhangs the 80px bar onto the
 * banner, below that it fits the bar; the product name stays as visually hidden text. Focus
 * states are DERIVED.
 */
@Component({
  selector: 'dahc-app-header',
  templateUrl: './app-header.component.html',
  styleUrl: './app-header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcBadgeComponent,
    DahcButtonComponent,
    DahcDrawerComponent,
    DahcIconButtonComponent,
    DahcIconComponent,
    DahcLogoComponent,
    DahcThemeSwitchComponent,
    RouterLink,
  ],
})
export class DahcAppHeaderComponent {
  readonly productName = input.required<string>();
  /** Id of the main content element the skip link moves to. */
  readonly mainContentId = input<string>('main-content');
  /** Brand image (a complete logo tile) shown instead of the Dubai Health tile and product name. */
  readonly logoSrc = input<string>('');
  /** Accessible name of the brand image, for example the institution it shows. */
  readonly logoAlt = input<string>('');
  readonly skipLinkLabel = input<string>($localize`:@@dahcUi.appHeader.skipLink:Skip to main content`);
  /** Main navigation; the item with current set is marked as the current page. */
  readonly navItems = input<readonly DahcNavLink[]>([]);
  readonly navLabel = input<string>($localize`:@@dahcUi.appHeader.nav:Main`);
  /** Link to the same page in the other language; hidden when empty. */
  readonly languageHref = input<string>('');
  readonly languageLabel = input<string>('');
  /** BCP 47 language of the linked page, used for hreflang and the link text's lang. */
  readonly languageCode = input<string>('');
  /** Unread notifications; null hides the notifications button. */
  readonly notificationCount = input<number | null>(null);
  readonly notificationsLabel = input<string>($localize`:@@dahcUi.appHeader.notifications:Notifications`);
  readonly userName = input<string>('');
  readonly signedIn = input<boolean>(false);
  readonly signOutLabel = input<string>($localize`:@@dahcUi.appHeader.signOut:Sign out`);
  readonly menuLabel = input<string>($localize`:@@dahcUi.appHeader.menu:Menu`);
  readonly signOut = output<void>();
  readonly notificationsOpened = output<void>();

  protected readonly menuOpen = signal<boolean>(false);

  private readonly document = inject(DOCUMENT);

  /**
   * Moves focus in script: with a <base href> a fragment-only link would resolve against
   * the base URL and reload the application instead of moving to the main content.
   */
  protected skipToMainContent(event: Event): void {
    const target = this.document.getElementById(this.mainContentId());

    if (!target) {
      return;
    }

    event.preventDefault();

    if (!target.hasAttribute('tabindex')) {
      target.setAttribute('tabindex', '-1');
    }

    target.focus();
  }

  protected requestSignOut(): void {
    this.menuOpen.set(false);
    this.signOut.emit();
  }

  protected openNotifications(): void {
    this.notificationsOpened.emit();
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}
