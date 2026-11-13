import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Bottom bar of a dahc-layout: the navy DH footer band for free content (padding 64 / 64 / 48,
 * gap 40). For the complete Dubai Health footer (logo, links, contact, social) use dahc-footer.
 * Links inside take the footer text colour.
 * Ported from dubai-health-ui dh-footer (layout/dh-layout.ts). Figma DH Bottom navigation 50:11046.
 */
@Component({
  selector: 'dahc-layout-footer',
  template: '<footer class="dahc-layout-footer__band" [attr.aria-label]="label() || null"><ng-content /></footer>',
  styleUrl: './layout-footer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'dahc-layout-footer' },
})
export class DahcLayoutFooterComponent {
  /** Names the footer landmark when a page has more than one. */
  readonly label = input<string>('');
}
