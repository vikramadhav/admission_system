import { ChangeDetectionStrategy, Component, InjectionToken, computed, inject, input } from '@angular/core';

import { DAHC_COLOURED_ICONS, DAHC_DIRECTIONAL_ICONS, DahcIconName } from './icon-names';

export type DahcIconSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * URL of the folder that serves src/assets/icons, relative to the document base href.
 * Each app copies the folder there (angular.json assets: output "dahc-ui/icons").
 */
export const DAHC_ICON_BASE_URL = new InjectionToken<string>('DAHC_ICON_BASE_URL', {
  providedIn: 'root',
  factory: () => 'dahc-ui/icons/',
});

/**
 * A DH Design System icon (Icons 50:4272). The SVG is used as a CSS mask filled with the
 * current text colour, so icons follow the theme and forced-colours mode, and no SVG markup
 * is ever inserted into the DOM (Trusted Types, standard s.24). Brand logos (social-*-brand)
 * are drawn as background images in their own colours.
 * Decorative by default; give it a label when the icon alone carries meaning.
 */
@Component({
  selector: 'dahc-icon',
  template: '',
  styleUrl: './icon.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'dahc-icon',
    '[class.dahc-icon--xs]': "size() === 'xs'",
    '[class.dahc-icon--sm]': "size() === 'sm'",
    '[class.dahc-icon--md]': "size() === 'md'",
    '[class.dahc-icon--lg]': "size() === 'lg'",
    '[class.dahc-icon--directional]': 'isDirectional()',
    '[class.dahc-icon--coloured]': 'isColoured()',
    '[style.--dahc-icon-image]': 'image()',
    '[attr.role]': "label() ? 'img' : null",
    '[attr.aria-label]': 'label() || null',
    '[attr.aria-hidden]': "label() ? null : 'true'",
  },
})
export class DahcIconComponent {
  readonly name = input.required<DahcIconName>();
  /** xs 12, sm 16, md 20, lg 24 pixels (size-icon-* tokens). */
  readonly size = input<DahcIconSize>('md');
  /** Accessible name. Leave empty when the icon is decorative or next to visible text. */
  readonly label = input<string>('');

  private readonly baseUrl = inject(DAHC_ICON_BASE_URL);

  protected readonly image = computed<string>(() => `url("${this.baseUrl}${this.name()}.svg")`);
  protected readonly isDirectional = computed<boolean>(() => DAHC_DIRECTIONAL_ICONS.has(this.name()));
  /** Brand logos (social-*-brand) are drawn as images in their own colours. */
  protected readonly isColoured = computed<boolean>(() => DAHC_COLOURED_ICONS.has(this.name()));
}
