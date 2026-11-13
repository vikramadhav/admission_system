import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, computed, inject, input, signal } from '@angular/core';

import { DahcFormControl, provideDahcValueAccessor } from '../../core/forms/form-control';

function starOf(event: Event): number | null {
  const star = event.target instanceof Element ? event.target.closest<HTMLElement>('[role="radio"]') : null;

  return star?.dataset['star'] === undefined ? null : Number(star.dataset['star']);
}

/**
 * Star rating. The form value is the number of stars, 0 when not rated. A WAI-ARIA radio group
 * with a roving tab stop: Arrow keys change the rating (Left / Right mirrored in RTL), Home / End
 * jump to 1 and [count]; clicking the current rating clears it unless [allowClear] is false.
 * [readonly] shows the rating as an image with a text alternative.
 * DERIVED design: 24px stars, navy for the rating and navy-200 for the rest (Secondary Orange
 * fails 3:1 non-text contrast). Ported from dubai-health-ui dh-rate (entry/dh-range.ts).
 */
@Component({
  selector: 'dahc-rate',
  templateUrl: './rate.component.html',
  styleUrl: './rate.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  providers: [provideDahcValueAccessor(() => DahcRateComponent)],
  host: {
    '[class.dahc-rate--disabled]': 'isDisabled()',
    // The stars take focus themselves (roving tab stop); keys, clicks and hover are handled here.
    '(keydown)': 'onKeydown($event)',
    '(click)': 'onClick($event)',
    '(pointerover)': 'onPointerOver($event)',
    '(pointerleave)': 'hover.set(0)',
  },
})
export class DahcRateComponent extends DahcFormControl<number> {
  /** Accessible name of the group, for example "Rate your visit". */
  readonly label = input<string>($localize`:@@dahcUi.rate.label:Rating`);
  readonly count = input<number>(5);
  readonly readonly = input<boolean>(false);
  readonly allowClear = input<boolean>(true);

  protected readonly hover = signal<number>(0);
  protected readonly stars = computed<readonly number[]>(() => Array.from({ length: this.count() }, (_, index) => index + 1));
  protected readonly shown = computed<number>(() => this.hover() || this.value());
  /** The star in the tab order: the current rating, or the first. */
  protected readonly focusable = computed<number>(() => this.value() || 1);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  protected emptyValue(): number {
    return 0;
  }

  protected starLabel(star: number): string {
    return $localize`:@@dahcUi.rate.star:${star}:star: of ${this.count()}:count:`;
  }

  protected readonlyLabel(): string {
    return $localize`:@@dahcUi.rate.readonly:${this.label()}:label:: ${this.value()}:value: of ${this.count()}:count:`;
  }

  protected choose(star: number): void {
    if (this.readonly() || this.isDisabled()) {
      return;
    }

    const next = this.allowClear() && star === this.value() ? 0 : Math.min(this.count(), Math.max(0, star));
    this.commitValue(next);
    this.markTouched();
    this.focusCurrent();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.isDisabled() || this.readonly()) {
      return;
    }

    const rtl = getComputedStyle(this.host.nativeElement).direction === 'rtl';
    const up = ['ArrowUp', rtl ? 'ArrowLeft' : 'ArrowRight'];
    const down = ['ArrowDown', rtl ? 'ArrowRight' : 'ArrowLeft'];
    const value = this.value();
    let next: number;

    if (up.includes(event.key)) {
      next = Math.min(this.count(), value + 1);
    } else if (down.includes(event.key)) {
      next = Math.max(1, value - 1);
    } else if (event.key === 'Home') {
      next = 1;
    } else if (event.key === 'End') {
      next = this.count();
    } else if (event.key === ' ' || event.key === 'Enter') {
      next = this.focusable();
    } else {
      return;
    }

    event.preventDefault();

    if (next !== value) {
      this.commitValue(next);
      this.focusCurrent();
    }
  }

  protected onClick(event: MouseEvent): void {
    const star = starOf(event);

    if (star !== null) {
      this.choose(star);
    }
  }

  protected onPointerOver(event: PointerEvent): void {
    const star = starOf(event);

    if (star !== null && !this.isDisabled() && !this.readonly()) {
      this.hover.set(star);
    }
  }

  protected onBlur(): void {
    this.markTouched();
  }

  private focusCurrent(): void {
    afterNextRender(() => this.host.nativeElement.querySelector<HTMLElement>('[role="radio"][tabindex="0"]')?.focus(), {
      injector: this.injector,
    });
  }
}
