import { ChangeDetectionStrategy, Component, InjectionToken, computed, inject, input } from '@angular/core';

/**
 * URL of the folder that serves src/assets/logo, relative to the document base href.
 * Each app copies the folder there (angular.json assets: output "dahc-ui/logo").
 */
export const DAHC_LOGO_BASE_URL = new InjectionToken<string>('DAHC_LOGO_BASE_URL', {
  providedIn: 'root',
  factory: () => 'dahc-ui/logo/',
});

/** horizontal: mark and bilingual wordmark; icon: mark only (Figma Orientation). */
export type DahcLogoOrientation = 'horizontal' | 'icon';

/** navy on light surfaces, white on navy or images (Figma Color). */
export type DahcLogoColor = 'navy' | 'white';

/**
 * The Dubai Health logo, Figma Logo › DH logo 50:2078 (Navy blue / White × Horizontal / Icon only),
 * exported read-only from Figma. The Vertical orientation is not shipped yet (54 separate vector
 * layers in Figma). Size it with CSS block-size; the width follows the aspect ratio.
 */
@Component({
  selector: 'dahc-logo',
  template: '<img class="dahc-logo__image" [src]="source()" [alt]="label()" />',
  styles: ':host { display: inline-flex; block-size: var(--dahc-size-control-lg); } .dahc-logo__image { display: block; block-size: 100%; inline-size: auto; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DahcLogoComponent {
  readonly orientation = input<DahcLogoOrientation>('horizontal');
  readonly color = input<DahcLogoColor>('navy');
  /** Text alternative; empty when the logo sits next to the same name in text. */
  readonly label = input<string>($localize`:@@dahcUi.logo.label:Dubai Health`);

  private readonly baseUrl = inject(DAHC_LOGO_BASE_URL);

  protected readonly source = computed<string>(() => `${this.baseUrl}dh-logo-${this.orientation()}-${this.color()}.svg`);
}
