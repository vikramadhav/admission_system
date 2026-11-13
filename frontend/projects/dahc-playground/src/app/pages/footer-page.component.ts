import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DahcFooterComponent, DahcNavLink, DahcSocialLink } from 'dahc-ui';

import { DocExampleComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-footer-page',
  templateUrl: './footer-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcFooterComponent, DocExampleComponent, PlaygroundPageComponent],
})
export class FooterPageComponent {
  protected readonly whenToUse = [
    'Put one at the bottom of every page of a public site or an application.',
    'Keep the links few and stable: about, contact, privacy and terms.',
    'Give the phone number as it is written; the footer makes it a tel: link.',
    'Name social links for screen readers, for example "Dubai Health on LinkedIn".',
  ];

  protected readonly sourceFiles = [
    'navigation/footer/footer.component.ts',
    'navigation/footer/footer.component.html',
    'navigation/footer/footer.component.css',
  ];
  protected readonly links: readonly DahcNavLink[] = [
    { label: 'About Dubai Health', href: '#about' },
    { label: 'Media center', href: '#media' },
    { label: 'Contact us', href: '#contact' },
    { label: 'Careers', href: '#careers' },
    { label: 'Privacy policy', href: '#privacy' },
  ];
  protected readonly socialLinks: readonly DahcSocialLink[] = [
    { icon: 'social-x', label: 'Dubai Health on X', href: 'https://x.com' },
    { icon: 'social-linkedin', label: 'Dubai Health on LinkedIn', href: 'https://www.linkedin.com' },
    { icon: 'social-facebook', label: 'Dubai Health on Facebook', href: 'https://www.facebook.com' },
    { icon: 'social-instagram', label: 'Dubai Health on Instagram', href: 'https://www.instagram.com' },
    { icon: 'social-threads', label: 'Dubai Health on Threads', href: 'https://www.threads.net' },
  ];
}
