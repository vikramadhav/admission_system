import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  input,
  viewChild,
} from '@angular/core';

import { DahcBreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component';
import { DahcNavLink } from '../nav-link';

/** One "Label - Value" pair in the meta row, for example Application ID - GME-0142. */
export interface DahcPageHeaderMeta {
  readonly label: string;
  readonly value: string;
}

/**
 * Page title band with the page's only h1: optional breadcrumbs, description, a meta row of
 * label / value pairs, a status (content marked page-header-status, for example a dahc-tag) and
 * actions (content marked page-header-actions). With focusOnLoad the heading receives focus after
 * rendering, so screen-reader users hear the new page after client-side navigation.
 * Figma Banner › Page header 50:16877 (blue-200 band, breadcrumbs, Heading 1 36/40 navy, Body Large
 * 20/24 navy-700, primary action) and the GME banner (meta row "Label - Value", DRAFT tag).
 */
@Component({
  selector: 'dahc-page-header',
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcBreadcrumbsComponent],
})
export class DahcPageHeaderComponent {
  readonly heading = input.required<string>();
  readonly description = input<string>('');
  readonly breadcrumbs = input<readonly DahcNavLink[]>([]);
  readonly meta = input<readonly DahcPageHeaderMeta[]>([]);
  readonly focusOnLoad = input<boolean>(false);

  private readonly headingElement = viewChild.required<ElementRef<HTMLHeadingElement>>('headingElement');

  constructor() {
    afterNextRender(() => {
      if (this.focusOnLoad()) {
        this.headingElement().nativeElement.focus();
      }
    });
  }
}
