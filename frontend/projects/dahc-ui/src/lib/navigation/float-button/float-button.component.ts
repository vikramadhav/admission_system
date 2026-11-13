import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

import { DahcIconComponent } from '../../core/icon/icon.component';
import { DahcIconName } from '../../core/icon/icon-names';

/** primary: navy; default: white with a navy icon. */
export type DahcFloatButtonVariant = 'primary' | 'default';
/** end: bottom right in LTR (bottom left in RTL); start: the other corner. */
export type DahcFloatButtonPlacement = 'end' | 'start';

/**
 * A round action button fixed to a corner of the viewport, for one action that should stay
 * reachable (for example "Contact us"). The label is its accessible name and is shown as a tip on
 * hover and focus. With href it renders a link. Listen to (click) on the element.
 * DERIVED design (dubai-health-ui UDD-019): DH primary colours, 48px, Shadow 4.
 * Ported from dubai-health-ui dh-float-button.
 */
@Component({
  selector: 'dahc-float-button',
  templateUrl: './float-button.component.html',
  styleUrl: './float-button.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcIconComponent],
  host: {
    '[class.dahc-float-button--default]': "variant() === 'default'",
    '[class.dahc-float-button--start]': "placement() === 'start'",
    '[class.dahc-float-button--inline]': 'inline()',
  },
})
export class DahcFloatButtonComponent {
  /** Accessible name and tip. */
  readonly label = input.required<string>();
  readonly icon = input.required<DahcIconName>();
  /** Renders a link instead of a button. */
  readonly href = input<string>('');
  readonly variant = input<DahcFloatButtonVariant>('primary');
  readonly placement = input<DahcFloatButtonPlacement>('end');
  /** Stays in the page flow instead of being fixed to the viewport (groups, documentation). */
  readonly inline = input<boolean>(false);
}

/**
 * Floating "back to top" button, shown once the page (or the target container) has scrolled down.
 * Scrolls smoothly, or instantly under reduced motion. DERIVED (dubai-health-ui UDD-019): float
 * button with the DH Government "Arrows/Up" glyph. Ported from dubai-health-ui dh-back-top.
 */
@Component({
  selector: 'dahc-back-top',
  templateUrl: './back-top.component.html',
  styleUrl: './float-button.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcIconComponent],
  host: {
    '[class.dahc-float-button--default]': "variant() === 'default'",
    '[class.dahc-float-button--start]': "placement() === 'start'",
    '[class.dahc-float-button--inline]': 'inline()',
    '[class.dahc-float-button--hidden]': '!visible()',
  },
})
export class DahcBackTopComponent {
  readonly label = input<string>($localize`:@@dahcUi.backTop.label:Back to top`);
  /** Scroll distance in pixels after which the button appears. */
  readonly visibilityHeight = input<number>(400);
  /** CSS selector of the scroll container; the window when empty. */
  readonly target = input<string>('');
  readonly variant = input<DahcFloatButtonVariant>('default');
  readonly placement = input<DahcFloatButtonPlacement>('end');
  readonly inline = input<boolean>(false);
  /** Emits before scrolling to the top. */
  readonly backToTop = output<void>();

  protected readonly visible = signal<boolean>(false);

  private readonly document = inject(DOCUMENT);
  private scroller: HTMLElement | Window | null = null;

  private readonly onScroll = (): void => {
    const view = this.document.defaultView;
    const top = !this.scroller || this.scroller === view ? (view?.scrollY ?? 0) : (this.scroller as HTMLElement).scrollTop;
    this.visible.set(top >= this.visibilityHeight());
  };

  constructor() {
    effect(() => this.listen(this.target()));
    inject(DestroyRef).onDestroy(() => this.scroller?.removeEventListener('scroll', this.onScroll));
  }

  /** Scrolls the target to the top. */
  scrollToTop(): void {
    const view = this.document.defaultView;

    if (!view) {
      return;
    }

    this.backToTop.emit();
    const behavior: ScrollBehavior = view.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    (this.scroller ?? view).scrollTo({ top: 0, behavior });
  }

  private listen(target: string): void {
    const view = this.document.defaultView;

    if (!view) {
      return;
    }

    this.scroller?.removeEventListener('scroll', this.onScroll);
    this.scroller = (target && this.document.querySelector<HTMLElement>(target)) || view;
    this.scroller.addEventListener('scroll', this.onScroll, { passive: true });
    this.onScroll();
  }
}
