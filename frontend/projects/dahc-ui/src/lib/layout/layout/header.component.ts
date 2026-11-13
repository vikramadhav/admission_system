import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Top bar of a dahc-layout: a white 96px band with the DH divider, for logo, menu and actions.
 * For the complete application header (navigation, language, user, mobile menu) use
 * dahc-app-header.
 * Ported from dubai-health-ui dh-header (layout/dh-layout.ts). Figma DH Top navigation, Web 50:10832.
 */
@Component({
  selector: 'dahc-header',
  template: '<header class="dahc-header__bar" [attr.aria-label]="label() || null"><ng-content /></header>',
  styleUrl: './header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'dahc-header' },
})
export class DahcHeaderComponent {
  /** Names the header landmark when a page has more than one. */
  readonly label = input<string>('');
}
