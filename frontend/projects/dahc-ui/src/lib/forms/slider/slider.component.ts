import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, input, signal, viewChild } from '@angular/core';

import { dahcUniqueId } from '../../core/a11y/unique-id';
import { DahcFormControl, provideDahcValueAccessor } from '../../core/forms/form-control';

/** One value, or the [minimum, maximum] pair of a range slider. */
export type DahcSliderValue = number | readonly [number, number];

/**
 * Pick a number, or a range with two thumbs, by dragging or with the keyboard. The form value is
 * a number, or a [low, high] tuple with [range]. WAI-ARIA slider: Arrow keys change by step
 * (Left / Right mirrored in RTL), Page Up / Page Down by ten steps, Home / End jump to the
 * limits; each thumb reports aria-valuenow and aria-valuetext (with [unit]).
 * DERIVED design: 8px rail (navy-100) with a navy track, 24px white thumb with a 2px navy border
 * and Shadow 3, value tooltip on hover, focus and drag. Ported from dubai-health-ui dh-slider
 * (entry/dh-range.ts).
 */
@Component({
  selector: 'dahc-slider',
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideDahcValueAccessor(() => DahcSliderComponent)],
  host: {
    '[class.dahc-slider--disabled]': 'isDisabled()',
  },
})
export class DahcSliderComponent extends DahcFormControl<DahcSliderValue> {
  readonly label = input.required<string>();
  readonly hint = input<string>('');
  readonly min = input<number>(0);
  readonly max = input<number>(100);
  readonly step = input<number>(1);
  /** Two thumbs: the value is [low, high]. */
  readonly range = input<boolean>(false);
  /** Values labelled under the rail. */
  readonly marks = input<readonly number[]>([]);
  /** Appended to values in labels and aria-valuetext, for example "%" or " AED". */
  readonly unit = input<string>('');
  readonly minimumLabel = input<string>($localize`:@@dahcUi.slider.minimum:minimum`);
  readonly maximumLabel = input<string>($localize`:@@dahcUi.slider.maximum:maximum`);

  protected readonly labelId = dahcUniqueId('dahc-slider-label');
  protected readonly hintId = dahcUniqueId('dahc-slider-hint');
  protected readonly dragging = signal<number>(-1);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly rail = viewChild.required<ElementRef<HTMLElement>>('rail');

  /** Current values, snapped and clamped: one, or two in order with [range]. */
  protected readonly values = computed<readonly number[]>(() => {
    const value = this.value();
    const parts = Array.isArray(value) ? value : [value as number];
    const first = this.snap(parts[0] ?? this.min());

    if (!this.range()) {
      return [first];
    }

    const second = this.snap(parts[1] ?? this.max());

    return [Math.min(first, second), Math.max(first, second)];
  });

  protected readonly trackStart = computed<number>(() => (this.range() ? this.percent(this.values()[0] ?? this.min()) : 0));
  protected readonly trackEnd = computed<number>(() => this.percent(this.values()[this.range() ? 1 : 0] ?? this.min()));

  /** Called by the base class before inputs exist; values() normalises it for range and min / max. */
  protected emptyValue(): DahcSliderValue {
    return 0;
  }

  protected percent(value: number): number {
    const span = this.max() - this.min();

    return span === 0 ? 0 : ((value - this.min()) / span) * 100;
  }

  protected text(value: number): string {
    return `${value}${this.unit()}`;
  }

  protected thumbMin(index: number): number {
    return this.range() && index === 1 ? (this.values()[0] ?? this.min()) : this.min();
  }

  protected thumbMax(index: number): number {
    return this.range() && index === 0 ? (this.values()[1] ?? this.max()) : this.max();
  }

  protected thumbLabel(index: number): string | null {
    return this.range() ? `${this.label()} ${index === 0 ? this.minimumLabel() : this.maximumLabel()}` : null;
  }

  protected onKeydown(index: number, event: KeyboardEvent): void {
    if (this.isDisabled()) {
      return;
    }

    const rtl = getComputedStyle(this.host.nativeElement).direction === 'rtl';
    const current = this.values()[index] ?? this.min();
    const step = this.step();
    const deltas: Readonly<Record<string, number>> = {
      ArrowUp: step,
      ArrowDown: -step,
      ArrowRight: rtl ? -step : step,
      ArrowLeft: rtl ? step : -step,
      PageUp: step * 10,
      PageDown: -step * 10,
    };
    let next: number;

    if (event.key === 'Home') {
      next = this.min();
    } else if (event.key === 'End') {
      next = this.max();
    } else if (event.key in deltas) {
      next = current + (deltas[event.key] ?? 0);
    } else {
      return;
    }

    event.preventDefault();
    this.setThumb(index, next);
  }

  protected onPointerDown(event: PointerEvent): void {
    if (this.isDisabled() || event.button !== 0) {
      return;
    }

    event.preventDefault();
    const area = event.currentTarget as HTMLElement;
    const target = this.valueAt(event.clientX);
    const values = this.values();
    const index =
      this.range() && Math.abs(target - (values[1] ?? 0)) < Math.abs(target - (values[0] ?? 0)) ? 1 : 0;

    this.dragging.set(index);
    this.setThumb(index, target);
    area.setPointerCapture(event.pointerId);
    this.host.nativeElement.querySelectorAll<HTMLElement>('[role="slider"]')[index]?.focus();

    const move = (moveEvent: PointerEvent): void => this.setThumb(index, this.valueAt(moveEvent.clientX));
    const up = (): void => {
      area.removeEventListener('pointermove', move);
      area.removeEventListener('pointerup', up);
      area.removeEventListener('pointercancel', up);
      this.dragging.set(-1);
      this.markTouched();
    };

    area.addEventListener('pointermove', move);
    area.addEventListener('pointerup', up);
    area.addEventListener('pointercancel', up);
  }

  protected onBlur(): void {
    this.markTouched();
  }

  private setThumb(index: number, raw: number): void {
    const values = [...this.values()];
    let next = this.snap(raw);

    if (this.range()) {
      next = index === 0 ? Math.min(next, values[1] ?? next) : Math.max(next, values[0] ?? next);
    }

    if (values[index] === next) {
      return;
    }

    values[index] = next;
    this.commitValue(this.range() ? [values[0] ?? this.min(), values[1] ?? this.max()] : next);
  }

  private snap(value: number): number {
    const step = this.step();
    const stepped = Math.round((value - this.min()) / step) * step + this.min();

    return Math.min(this.max(), Math.max(this.min(), Number(stepped.toFixed(10))));
  }

  private valueAt(clientX: number): number {
    const box = this.rail().nativeElement.getBoundingClientRect();

    if (box.width === 0) {
      return this.min();
    }

    const rtl = getComputedStyle(this.host.nativeElement).direction === 'rtl';
    let ratio = (clientX - box.left) / box.width;

    if (rtl) {
      ratio = 1 - ratio;
    }

    return this.min() + Math.min(1, Math.max(0, ratio)) * (this.max() - this.min());
  }
}
