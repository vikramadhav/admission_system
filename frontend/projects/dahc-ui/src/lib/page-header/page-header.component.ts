import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  input,
  viewChild,
} from '@angular/core';

/**
 * Page title band with the page's only h1, an optional description and projected actions
 * (content marked page-header-actions). With focusOnLoad the heading receives focus after
 * rendering, so screen-reader users hear the new page after client-side navigation.
 */
@Component({
  selector: 'dahc-page-header',
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DahcPageHeaderComponent {
  readonly heading = input.required<string>();
  readonly description = input<string>('');
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
