import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';

import { DahcButtonComponent } from '../../actions/button/button.component';
import { dahcUniqueId } from '../../core/a11y/unique-id';
import { DahcFormControl, provideDahcValueAccessor } from '../../core/forms/form-control';
import { DahcIconComponent } from '../../core/icon/icon.component';
import { dahcAutoUpdate, dahcPositionFloating } from '../../core/overlay/position';
import { DahcFormFieldComponent } from '../form-field/form-field.component';
import { DahcInputDirective } from '../input/input.directive';

/** Default swatches: DAHC palette primitives (--dahc-<name>). */
export const DAHC_COLOR_PICKER_PRESETS: readonly string[] = [
  'navy',
  'navy-700',
  'navy-300',
  'navy-100',
  'blue',
  'light-blue',
  'green',
  'orange',
  'red',
  'purple',
  'pink',
  'blue-black',
];

const HEX = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i;
const COLUMNS = 4;

/** Normalises "#abc", "abc" or "#AABBCC" to "#aabbcc", or '' when invalid. */
export function dahcNormaliseHex(value: string): string {
  const match = HEX.exec(value.trim());
  const hex = match?.[1];

  if (!hex) {
    return '';
  }

  const full = hex.length === 3 ? [...hex].map(character => character + character).join('') : hex;

  return `#${full.toLowerCase()}`;
}

interface Swatch {
  readonly name: string;
  readonly hex: string;
}

/**
 * Pick a colour from the DAHC palette or enter a custom hex value. The form value is "#rrggbb",
 * '' when empty. [presets] are hex values or palette names ("navy-700"). The field is a combobox
 * with aria-haspopup="dialog"; the panel holds a listbox of swatches (Arrow keys move, Enter or
 * Space picks, with a roving tab stop), the native colour input and a hex field with Apply.
 * Escape closes back to the field.
 * DERIVED design: DAHC palette (Figma Colors 50:2565) as presets, DH Input field.
 * Ported from dubai-health-ui dh-color-picker (entry/dh-picker.ts).
 */
@Component({
  selector: 'dahc-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrl: './color-picker.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcButtonComponent, DahcFormFieldComponent, DahcIconComponent, DahcInputDirective],
  providers: [provideDahcValueAccessor(() => DahcColorPickerComponent)],
  host: {
    // Swatches take focus themselves; their keys and clicks are handled here for the whole grid.
    '(keydown)': 'onHostKeydown($event)',
    '(click)': 'onHostClick($event)',
  },
})
export class DahcColorPickerComponent extends DahcFormControl<string> {
  readonly label = input.required<string>();
  readonly hint = input<string>('');
  readonly errorMessage = input<string>('');
  readonly invalid = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly placeholder = input<string>($localize`:@@dahcUi.colorPicker.placeholder:Choose a colour`);
  readonly presets = input<readonly string[]>(DAHC_COLOR_PICKER_PRESETS);
  readonly presetsLabel = input<string>($localize`:@@dahcUi.colorPicker.presets:Preset colours`);
  readonly customLabel = input<string>($localize`:@@dahcUi.colorPicker.custom:Custom colour`);
  readonly hexLabel = input<string>($localize`:@@dahcUi.colorPicker.hex:Hex value`);
  readonly applyLabel = input<string>($localize`:@@dahcUi.colorPicker.apply:Apply`);

  protected readonly panelId = dahcUniqueId('dahc-color-picker');
  protected readonly open = signal<boolean>(false);
  protected readonly draft = signal<string>('');
  protected readonly swatches = signal<readonly Swatch[]>([]);
  protected readonly focusIndex = signal<number>(0);
  protected readonly draftValid = computed<boolean>(() => dahcNormaliseHex(this.draft()) !== '');
  protected readonly nativeValue = computed<string>(() => dahcNormaliseHex(this.draft()) || '#002f70');

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly popup = viewChild.required<ElementRef<HTMLElement>>('popup');
  private stopAutoUpdate: (() => void) | null = null;

  private readonly closeOnOutsidePointer = (event: PointerEvent): void => {
    if (this.open() && !event.composedPath().includes(this.host.nativeElement)) {
      this.close(false);
    }
  };

  constructor() {
    super();
    this.document.addEventListener('pointerdown', this.closeOnOutsidePointer, true);
    inject(DestroyRef).onDestroy(() => {
      this.document.removeEventListener('pointerdown', this.closeOnOutsidePointer, true);
      this.stopAutoUpdate?.();
    });
  }

  protected emptyValue(): string {
    return '';
  }

  override writeValue(value: string | null | undefined): void {
    super.writeValue(dahcNormaliseHex(value ?? ''));
  }

  protected swatchLabel(swatch: Swatch): string {
    return `${swatch.name} ${swatch.hex.toUpperCase()}`;
  }

  protected toggleOpen(): void {
    if (this.open()) {
      this.close(true);
    } else {
      this.show();
    }
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (!this.open() && ['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      this.show();
    }
  }

  protected onPanelKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.close(true);
    }
  }

  protected onHostKeydown(event: KeyboardEvent): void {
    if (event.target instanceof Element && event.target.closest('.dahc-color-picker__grid')) {
      this.onGridKeydown(event);
    }
  }

  protected onHostClick(event: MouseEvent): void {
    const swatch = event.target instanceof Element ? event.target.closest<HTMLElement>('[role="option"]') : null;
    const index = swatch?.dataset['index'];
    const hex = index === undefined ? undefined : this.swatches()[Number(index)]?.hex;

    if (index !== undefined && hex !== undefined) {
      this.focusIndex.set(Number(index));
      this.pick(hex);
    }
  }

  private onGridKeydown(event: KeyboardEvent): void {
    const swatches = this.swatches();
    const index = this.focusIndex();
    const rtl = getComputedStyle(this.host.nativeElement).direction === 'rtl';
    const moves: Readonly<Record<string, number>> = {
      ArrowRight: rtl ? -1 : 1,
      ArrowLeft: rtl ? 1 : -1,
      ArrowDown: COLUMNS,
      ArrowUp: -COLUMNS,
    };

    if (event.key in moves) {
      event.preventDefault();
      this.focusSwatch(Math.min(swatches.length - 1, Math.max(0, index + (moves[event.key] ?? 0))));
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      this.focusSwatch(event.key === 'Home' ? 0 : swatches.length - 1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const swatch = swatches[index];

      if (swatch) {
        this.pick(swatch.hex);
      }
    }
  }

  protected onDraft(event: Event): void {
    this.draft.set((event.target as HTMLInputElement).value);
  }

  protected onHexKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.draftValid()) {
      event.preventDefault();
      this.pick(dahcNormaliseHex(this.draft()));
    }
  }

  protected apply(): void {
    if (this.draftValid()) {
      this.pick(dahcNormaliseHex(this.draft()));
    }
  }

  protected pick(hex: string): void {
    this.commitValue(hex);
    this.close(true);
  }

  protected onBlur(): void {
    this.markTouched();
  }

  private focusSwatch(index: number): void {
    this.focusIndex.set(index);
    afterNextRender(() => this.host.nativeElement.querySelector<HTMLElement>(`#${this.panelId}-${index}`)?.focus(), {
      injector: this.injector,
    });
  }

  private resolveSwatches(): readonly Swatch[] {
    const styles = getComputedStyle(this.document.documentElement);

    return this.presets()
      .map(preset => {
        const direct = dahcNormaliseHex(preset);
        const hex = direct || dahcNormaliseHex(styles.getPropertyValue(`--dahc-${preset}`));
        const name = direct
          ? direct.toUpperCase()
          : preset
              .split('-')
              .map(word => (/^\d+$/.test(word) ? word : `${word.charAt(0).toUpperCase()}${word.slice(1)}`))
              .join(' ');

        return { name, hex };
      })
      .filter(swatch => swatch.hex !== '');
  }

  private show(): void {
    if (this.isDisabled()) {
      return;
    }

    const swatches = this.resolveSwatches();
    const selected = swatches.findIndex(swatch => swatch.hex === this.value());
    this.swatches.set(swatches);
    this.draft.set(this.value());
    this.open.set(true);

    const popup = this.popup().nativeElement;
    const anchor = this.trigger().nativeElement.parentElement ?? this.host.nativeElement;
    const view = this.document.defaultView;
    popup.showPopover();
    const place = (): void => {
      dahcPositionFloating(anchor, popup, { offset: 6 });
    };
    place();
    this.stopAutoUpdate = view ? dahcAutoUpdate(view, place) : null;
    this.focusSwatch(selected >= 0 ? selected : 0);
  }

  private close(returnFocus: boolean): void {
    this.open.set(false);
    this.stopAutoUpdate?.();
    this.stopAutoUpdate = null;

    const popup = this.popup().nativeElement;

    if (popup.matches(':popover-open')) {
      popup.hidePopover();
    }

    if (returnFocus) {
      this.trigger().nativeElement.focus();
    }
  }
}
