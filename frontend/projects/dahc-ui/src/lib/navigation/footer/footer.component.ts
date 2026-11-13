import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DahcIconComponent } from '../../core/icon/icon.component';
import { DahcIconName } from '../../core/icon/icon-names';
import { DahcLogoComponent } from '../logo/logo.component';
import { DahcNavLink } from '../nav-link';

/** A social profile link: the platform icon and its accessible name. */
export interface DahcSocialLink {
  readonly icon: DahcIconName;
  readonly label: string;
  readonly href: string;
}

/**
 * Site footer: logo, links, contact number, social links and copyright.
 * Figma Bottom navigation › Web Footer 50:11046: navy band, padding 64; row 1 logo · divider ·
 * Bold 16/20 white links (gap 36) · "Reach us on" 12/16 + phone + Bold 20/24 number in blue;
 * navy-800 divider; row 2 copyright Regular 14/18 navy-600 and 24px social icons in blue (gap 24).
 * Mobile Footer 50:11129 stacks the same content centred. A11y fix: the copyright uses navy-300
 * (navy-600 on navy is 2.3:1) and blue texts use the light link blue that passes on navy.
 */
@Component({
  selector: 'dahc-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcIconComponent, DahcLogoComponent, RouterLink],
})
export class DahcFooterComponent {
  readonly links = input<readonly DahcNavLink[]>([]);
  readonly linksLabel = input<string>($localize`:@@dahcUi.footer.links:Footer`);
  readonly contactLabel = input<string>($localize`:@@dahcUi.footer.contact:Reach us on`);
  /** Phone number as shown, for example "800 60"; hidden when empty. */
  readonly phone = input<string>('');
  readonly socialLinks = input<readonly DahcSocialLink[]>([]);
  readonly copyright = input<string>('');

  /** tel: link from the shown number, digits only. */
  protected phoneHref(): string {
    return `tel:${this.phone().replace(/[^\d+]/g, '')}`;
  }
}
