import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  model,
} from '@angular/core';

/**
 * In-page navigation that highlights the section in view (scroll spy). Clicking a link scrolls to
 * its section (instantly under reduced motion), updates the URL hash and moves focus to the section.
 * DERIVED design: a 1px divider with a 2px navy indicator, as on DH tabs. Ported from
 * dubai-health-ui dh-anchor.
 *
 * <dahc-anchor><dahc-anchor-link href="#intro" heading="Introduction" /></dahc-anchor>
 */
@Component({
  selector: 'dahc-anchor',
  templateUrl: './anchor.component.html',
  styleUrl: './anchor.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(click)': 'onClick($event)',
  },
})
export class DahcAnchorComponent {
  /** Accessible name of the navigation landmark. */
  readonly label = input<string>($localize`:@@dahcUi.anchor.label:On this page`);
  /** Space kept above a section when scrolling to it (for example a sticky header), in pixels. */
  readonly offsetTop = input<number>(0);
  /** CSS selector of the scroll container; the window when empty. */
  readonly container = input<string>('');
  /** The active href; two-way bindable. */
  readonly current = model<string>('');

  private readonly document = inject(DOCUMENT);
  private readonly links = contentChildren(DahcAnchorLinkComponent, { descendants: true });
  private scroller: HTMLElement | Window | null = null;
  private frame = 0;

  private readonly onScroll = (): void => {
    const view = this.document.defaultView;

    if (view) {
      view.cancelAnimationFrame(this.frame);
      this.frame = view.requestAnimationFrame(() => this.spy());
    }
  };

  constructor() {
    effect(() => this.listen(this.container()));
    inject(DestroyRef).onDestroy(() => {
      this.scroller?.removeEventListener('scroll', this.onScroll);
      this.document.defaultView?.cancelAnimationFrame(this.frame);
    });
  }

  /**
   * Marks the last section whose top has passed the offset line. At the very end of the scroll
   * range the last section wins, because a short last section can never reach the line.
   */
  spy(): void {
    const line = this.scrollerTop() + this.offsetTop() + 8;
    const links = this.links().filter(link => this.target(link.href()) !== null);
    let active = '';

    for (const link of links) {
      const target = this.target(link.href());

      if (target && target.getBoundingClientRect().top <= line) {
        active = link.href();
      }
    }

    if (this.atEnd() && links.length > 0) {
      active = links[links.length - 1]?.href() ?? active;
    }

    this.current.set(active || (this.links()[0]?.href() ?? ''));
  }

  /** Scrolls to the section of href. */
  scrollToSection(href: string): void {
    const target = this.target(href);
    const view = this.document.defaultView;

    if (!target || !view) {
      return;
    }

    const behavior: ScrollBehavior = view.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    const scroller = this.scroller ?? view;

    if (scroller === view) {
      view.scrollTo({ top: view.scrollY + target.getBoundingClientRect().top - this.offsetTop(), behavior });
    } else {
      const element = scroller as HTMLElement;
      element.scrollTo({
        top: element.scrollTop + target.getBoundingClientRect().top - this.scrollerTop() - this.offsetTop(),
        behavior,
      });
    }

    view.history.replaceState(view.history.state, '', href);
    this.current.set(href);

    // Move focus for keyboard and screen-reader users.
    if (!target.hasAttribute('tabindex')) {
      target.setAttribute('tabindex', '-1');
    }

    target.focus({ preventScroll: true });
  }

  protected onClick(event: MouseEvent): void {
    const anchor = event.target instanceof Element ? event.target.closest('a') : null;

    if (!anchor || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) {
      return;
    }

    const href = anchor.getAttribute('href') ?? '';

    if (!this.target(href)) {
      return;
    }

    event.preventDefault();
    this.scrollToSection(href);
  }

  private listen(container: string): void {
    const view = this.document.defaultView;

    if (!view) {
      return;
    }

    this.scroller?.removeEventListener('scroll', this.onScroll);
    this.scroller = (container && this.document.querySelector<HTMLElement>(container)) || view;
    this.scroller.addEventListener('scroll', this.onScroll, { passive: true });
    this.onScroll();
  }

  private target(href: string): HTMLElement | null {
    if (!href.startsWith('#') || href.length < 2) {
      return null;
    }

    return this.document.getElementById(decodeURIComponent(href.slice(1)));
  }

  private atEnd(): boolean {
    const view = this.document.defaultView;

    if (!this.scroller || !view) {
      return false;
    }

    if (this.scroller === view) {
      const root = this.document.documentElement;

      return root.scrollHeight > view.innerHeight && view.scrollY + view.innerHeight >= root.scrollHeight - 1;
    }

    const element = this.scroller as HTMLElement;

    return element.scrollHeight > element.clientHeight && element.scrollTop + element.clientHeight >= element.scrollHeight - 1;
  }

  private scrollerTop(): number {
    const view = this.document.defaultView;

    return !this.scroller || this.scroller === view ? 0 : (this.scroller as HTMLElement).getBoundingClientRect().top;
  }
}

/** A link in a dahc-anchor; nest links for sub-sections. Ported from dubai-health-ui dh-anchor-link. */
@Component({
  selector: 'dahc-anchor-link',
  templateUrl: './anchor-link.component.html',
  styleUrl: './anchor-link.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'listitem',
    '[class.dahc-anchor-link--active]': 'active()',
  },
})
export class DahcAnchorLinkComponent {
  /** "#section-id" of the target. */
  readonly href = input.required<string>();
  /** Link text. */
  readonly heading = input.required<string>();

  private readonly anchor = inject(DahcAnchorComponent, { optional: true });
  protected readonly children = contentChildren(DahcAnchorLinkComponent);

  readonly active = computed<boolean>(() => this.anchor?.current() === this.href());
}
