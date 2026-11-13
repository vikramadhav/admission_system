import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DahcIconComponent } from '../../core/icon/icon.component';
import { DahcNavLink } from '../nav-link';

/** dark: on light backgrounds (navy links); light: on navy or images (Figma Version). */
export type DahcBreadcrumbsTone = 'dark' | 'light';

/**
 * Where the page sits in the site: a trail of links ending with the current page.
 * The last item is the current page (not a link, aria-current="page").
 * Figma Breadcrumbs 50:9802: home icon (Health centre 2) first, links Bold 16/20 capitalised,
 * 16px chevron separators, current page Regular 16/20. Dark: links navy, current navy-500 (A11y fix:
 * navy-700); Light: links blue, current navy-200 (A11y fix: white links). GME uses 13px; DH 16 kept
 * (decision D3). Hover underline and focus are DERIVED. Long trails wrap.
 */
@Component({
  selector: 'dahc-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrl: './breadcrumbs.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcIconComponent, RouterLink],
  host: {
    '[class.dahc-breadcrumbs--light]': "tone() === 'light'",
  },
})
export class DahcBreadcrumbsComponent {
  readonly items = input.required<readonly DahcNavLink[]>();
  readonly tone = input<DahcBreadcrumbsTone>('dark');
  /** Shows the home icon before the first item (its label stays the accessible name). */
  readonly homeIcon = input<boolean>(true);
  readonly label = input<string>($localize`:@@dahcUi.breadcrumbs.label:Breadcrumb`);
}
