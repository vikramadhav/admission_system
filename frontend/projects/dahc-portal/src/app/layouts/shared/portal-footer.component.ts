import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DahcFooterComponent, DahcNavLink } from 'dahc-ui';

/** GME footer (Figma footer variant 1, for example 1:2478): Dubai Health links, 800 60, copyright. */
@Component({
  selector: 'dahc-portal-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcFooterComponent],
  styles: ':host { display: block; }',
  template: `<dahc-footer [links]="links" phone="800 60" [copyright]="copyright" />`,
})
export class PortalFooterComponent {
  // The destinations are Dubai Health web pages that are not known yet (doc 02, OQ-P07).
  protected readonly links: readonly DahcNavLink[] = [
    { label: $localize`:@@portal.footer.about:About Dubai Health`, href: 'https://www.dubaihealth.ae' },
    { label: $localize`:@@portal.footer.media:Media Center`, href: 'https://www.dubaihealth.ae' },
    { label: $localize`:@@portal.footer.careers:Careers`, href: 'https://www.dubaihealth.ae' },
    { label: $localize`:@@portal.footer.contact:Contact Us`, href: 'https://www.dubaihealth.ae' },
    { label: $localize`:@@portal.footer.privacy:Privacy Policy`, href: 'https://www.dubaihealth.ae' },
  ];
  protected readonly copyright = $localize`:@@portal.footer.copyright:© 2026 Dubai Health. All rights reserved.`;
}
