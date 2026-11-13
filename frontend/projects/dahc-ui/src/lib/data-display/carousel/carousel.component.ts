import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  model,
  signal,
} from '@angular/core';

import { DahcIconComponent } from '../../core/icon/icon.component';

/** One slide of a dahc-carousel: a group announced as "slide n of m". Only the current slide shows. */
@Component({
  selector: 'dahc-carousel-slide',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  styles: ':host { display: block; } :host([hidden]) { display: none; }',
  host: {
    class: 'dahc-carousel-slide',
    role: 'group',
    'aria-roledescription': 'slide',
    '[attr.aria-label]': 'position()',
    '[hidden]': '!active()',
  },
})
export class DahcCarouselSlideComponent {
  /** Set by the carousel. */
  readonly active = signal<boolean>(false);
  readonly position = signal<string>('');
}

/**
 * Rotating slides (WAI-ARIA APG carousel): previous / next buttons, one button per slide, and a
 * pause / play button when it rotates on its own. Rotation stops while the pointer or focus is
 * inside, when paused, and always for reduced motion. The slide region is announced politely
 * when the candidate changes slides. Slides are dahc-carousel-slide children.
 * Figma DH "Carousel indicator" (50:8076): white 8px dots at 50% (current 10px), 16px gap, 24px
 * chevrons, 8px padding on a dark pill; slide container DERIVED.
 * Ported from dubai-health-ui dh-carousel.
 */
@Component({
  selector: 'dahc-carousel',
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcIconComponent],
  host: {
    class: 'dahc-carousel',
    '(pointerenter)': 'hovered.set(true)',
    '(pointerleave)': 'hovered.set(false)',
    '(focusin)': 'focused.set(true)',
    '(focusout)': 'focused.set(false)',
  },
})
export class DahcCarouselComponent {
  /** Accessible name of the carousel. */
  readonly label = input<string>($localize`:@@dahcUi.carousel.label:Carousel`);
  /** Current slide (0-based). */
  readonly index = model<number>(0);
  /** Milliseconds between slides; 0 turns automatic rotation off. */
  readonly autoplay = input<number>(0);
  readonly previousLabel = input<string>($localize`:@@dahcUi.carousel.previous:Previous slide`);
  readonly nextLabel = input<string>($localize`:@@dahcUi.carousel.next:Next slide`);
  readonly goToLabel = input<string>($localize`:@@dahcUi.carousel.goTo:Go to slide`);
  readonly pauseLabel = input<string>($localize`:@@dahcUi.carousel.pause:Stop automatic slide show`);
  readonly playLabel = input<string>($localize`:@@dahcUi.carousel.play:Start automatic slide show`);
  readonly slideOfLabel = input<string>($localize`:@@dahcUi.carousel.of:of`);

  protected readonly slides = contentChildren(DahcCarouselSlideComponent);
  protected readonly count = computed<number>(() => this.slides().length);
  protected readonly dots = computed<readonly number[]>(() => Array.from({ length: this.count() }, (_, index) => index));
  protected readonly hovered = signal<boolean>(false);
  protected readonly focused = signal<boolean>(false);
  /** Stopped with the pause button. */
  protected readonly stopped = signal<boolean>(false);
  private readonly reducedMotion: boolean;

  /** Rotation is possible (autoplay set and motion allowed); the pause button shows then. */
  protected readonly rotates = computed<boolean>(() => this.autoplay() > 0 && !this.reducedMotion);
  /** Rotating right now: live announcements are off while it does (APG). */
  protected readonly rotating = computed<boolean>(() => this.rotates() && !this.stopped() && !this.hovered() && !this.focused());

  constructor() {
    const view = inject(DOCUMENT).defaultView;
    this.reducedMotion = view?.matchMedia('(prefers-reduced-motion: reduce)').matches ?? false;

    effect(() => {
      const slides = this.slides();
      const current = this.index();
      slides.forEach((slide, position) => {
        slide.active.set(position === current);
        slide.position.set(`${position + 1} ${this.slideOfLabel()} ${slides.length}`);
      });
    });

    effect(onCleanup => {
      if (!this.rotating() || !view) {
        return;
      }

      const timer = view.setInterval(() => this.go(this.index() + 1), Math.max(this.autoplay(), 1000));
      onCleanup(() => view.clearInterval(timer));
    });
  }

  go(position: number): void {
    const count = this.count();

    if (count > 0) {
      this.index.set((position + count) % count);
    }
  }

  protected toggleRotation(): void {
    this.stopped.update(stopped => !stopped);
  }
}
