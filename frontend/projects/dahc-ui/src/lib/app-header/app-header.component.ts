import { ChangeDetectionStrategy, Component, DOCUMENT, inject, input, output } from '@angular/core';

import { DahcButtonComponent } from '../button/button.component';
import { DahcThemeSwitchComponent } from '../theme-switch/theme-switch.component';

/**
 * Top banner of an application: skip link, product name, link to the other language,
 * theme switch and, when signed in, the user's name and a sign-out button.
 */
@Component({
  selector: 'dahc-app-header',
  templateUrl: './app-header.component.html',
  styleUrl: './app-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcButtonComponent, DahcThemeSwitchComponent],
})
export class DahcAppHeaderComponent {
  readonly productName = input.required<string>();
  /** Id of the main content element the skip link moves to. */
  readonly mainContentId = input<string>('main-content');
  readonly skipLinkLabel = input<string>($localize`:@@dahcUi.appHeader.skipLink:Skip to main content`);
  /** Link to the same page in the other language; hidden when empty. */
  readonly languageHref = input<string>('');
  readonly languageLabel = input<string>('');
  /** BCP 47 language of the linked page, used for hreflang and the link text's lang. */
  readonly languageCode = input<string>('');
  readonly userName = input<string>('');
  readonly signedIn = input<boolean>(false);
  readonly signOutLabel = input<string>($localize`:@@dahcUi.appHeader.signOut:Sign out`);
  readonly signOut = output<void>();

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
    this.signOut.emit();
  }
}
