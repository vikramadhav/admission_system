import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterRenderEffect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

/**
 * Pins its content (a toolbar, a step navigation) once it scrolls to `offsetTop` pixels from the
 * top of the viewport, using position: sticky; `affixedChange` reports when it is pinned.
 * Ported from dubai-health-ui dh-affix (utility/dh-anchor.ts). DERIVED.
 */
@Component({
  selector: 'dahc-affix',
  template: '<ng-content />',
  styleUrl: './affix.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'dahc-affix',
    '[class.dahc-affix--affixed]': 'affixed()',
    // Sticky 1px above the offset: once pinned, the top pixel leaves the observed root line.
    '[style.inset-block-start.px]': 'offsetTop() - 1',
  },
})
export class DahcAffixComponent {
  /** Distance from the top of the viewport in pixels. */
  readonly offsetTop = input<number>(0);
  /** True while pinned. */
  readonly affixedChange = output<boolean>();

  protected readonly affixed = signal<boolean>(false);

  constructor() {
    const element: HTMLElement = inject(ElementRef<HTMLElement>).nativeElement;
    let observer: IntersectionObserver | null = null;

    afterRenderEffect(() => {
      const offset = this.offsetTop();
      observer?.disconnect();

      if (typeof IntersectionObserver === 'undefined') {
        return;
      }

      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry) {
            return;
          }

          const affixed = entry.intersectionRatio < 1 && entry.boundingClientRect.top <= offset;

          if (affixed !== this.affixed()) {
            this.affixed.set(affixed);
            this.affixedChange.emit(affixed);
          }
        },
        { rootMargin: `-${offset}px 0px 0px 0px`, threshold: [1] },
      );
      observer.observe(element);
    });

    inject(DestroyRef).onDestroy(() => observer?.disconnect());
  }
}
