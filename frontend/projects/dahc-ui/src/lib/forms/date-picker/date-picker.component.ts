import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  LOCALE_ID,
  computed,
  forwardRef,
  inject,
  input,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

import { dahcUniqueId } from '../../core/a11y/unique-id';
import {
  dahcCompareDates,
  dahcFormatDisplayDate,
  dahcFromIsoDate,
  dahcParseDisplayDate,
  dahcToIsoDate,
} from '../../core/date/date-utils';
import { DahcFormControl, provideDahcValueAccessor } from '../../core/forms/form-control';
import { DahcIconComponent } from '../../core/icon/icon.component';
import { dahcAutoUpdate, dahcPositionFloating } from '../../core/overlay/position';
import { DahcCalendarComponent } from '../calendar/calendar.component';
import { DahcFormFieldComponent } from '../form-field/form-field.component';
import { DahcInputDirective } from '../input/input.directive';

/**
 * Date field: type DD/MM/YYYY (UAE) or choose from a calendar popup. The form value is an ISO date
 * (YYYY-MM-DD) or '' when empty. It is also a validator: an unreadable date gives
 * { dahcDateFormat }, and dates outside min / max give { dahcDateMin } / { dahcDateMax }.
 * Field: Figma Input field 50:7763 with the calendar icon (GME date fields). Popup: DERIVED design,
 * pending UX sign-off. Ported from dubai-health-ui (packages/components/src/date/dh-date-picker.ts).
 */
@Component({
  selector: 'dahc-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcCalendarComponent, DahcFormFieldComponent, DahcIconComponent, DahcInputDirective],
  providers: [
    provideDahcValueAccessor(() => DahcDatePickerComponent),
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => DahcDatePickerComponent), multi: true },
  ],
})
export class DahcDatePickerComponent extends DahcFormControl<string> implements Validator {
  readonly label = input.required<string>();
  readonly hint = input<string>('');
  /** Message for errors the consumer reports through [invalid], for example "Enter your date of birth." */
  readonly errorMessage = input<string>('');
  readonly invalid = input<boolean>(false);
  readonly required = input<boolean>(false);
  /** Earliest allowed date, ISO. */
  readonly min = input<string>('');
  /** Latest allowed date, ISO. */
  readonly max = input<string>('');
  readonly placeholder = input<string>('DD/MM/YYYY');
  readonly locale = input<string>(inject(LOCALE_ID));
  readonly firstDayOfWeek = input<number>(1);
  readonly chooseDateLabel = input<string>($localize`:@@dahcUi.datePicker.choose:Choose date`);
  readonly formatErrorMessage = input<string>($localize`:@@dahcUi.datePicker.format:Enter a date as DD/MM/YYYY.`);

  protected readonly popupId = dahcUniqueId('dahc-date-picker-popup');
  protected readonly open = signal<boolean>(false);
  /** The text in the field; follows the value until the user types. */
  protected readonly text = linkedSignal<string>(() => {
    const date = dahcFromIsoDate(this.value());

    return date ? dahcFormatDisplayDate(date) : '';
  });
  private readonly badInput = signal<boolean>(false);

  private readonly rangeError = computed<string>(() => {
    const date = dahcFromIsoDate(this.value());
    const min = dahcFromIsoDate(this.min());
    const max = dahcFromIsoDate(this.max());

    if (date && min && dahcCompareDates(date, min) < 0) {
      return $localize`:@@dahcUi.datePicker.min:Choose a date on or after ${dahcFormatDisplayDate(min)}:date:.`;
    }

    if (date && max && dahcCompareDates(date, max) > 0) {
      return $localize`:@@dahcUi.datePicker.max:Choose a date on or before ${dahcFormatDisplayDate(max)}:date:.`;
    }

    return '';
  });

  protected readonly errorText = computed<string>(() => {
    if (this.badInput()) {
      return this.formatErrorMessage();
    }

    return this.rangeError() || this.errorMessage();
  });

  protected readonly showError = computed<boolean>(() => this.badInput() || this.rangeError() !== '' || this.invalid());

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  private readonly inputElement = viewChild.required<ElementRef<HTMLInputElement>>('field');
  private readonly toggleButton = viewChild.required<ElementRef<HTMLButtonElement>>('toggleButton');
  private readonly popup = viewChild.required<ElementRef<HTMLElement>>('popup');
  private readonly calendar = viewChild(DahcCalendarComponent);
  private stopAutoUpdate: (() => void) | null = null;
  private onValidatorChange: () => void = () => undefined;

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

  validate(control: AbstractControl): ValidationErrors | null {
    if (this.badInput()) {
      return { dahcDateFormat: true };
    }

    const date = typeof control.value === 'string' ? dahcFromIsoDate(control.value) : null;
    const min = dahcFromIsoDate(this.min());
    const max = dahcFromIsoDate(this.max());

    if (date && min && dahcCompareDates(date, min) < 0) {
      return { dahcDateMin: { min: this.min(), actual: control.value } };
    }

    if (date && max && dahcCompareDates(date, max) > 0) {
      return { dahcDateMax: { max: this.max(), actual: control.value } };
    }

    return null;
  }

  registerOnValidatorChange(onChange: () => void): void {
    this.onValidatorChange = onChange;
  }

  protected emptyValue(): string {
    return '';
  }

  protected onTextInput(event: Event): void {
    this.text.set((event.target as HTMLInputElement).value);
  }

  /** On change (blur or Enter) the typed text is parsed into the value. */
  protected onTextChange(): void {
    const text = this.text().trim();
    const parsed = dahcParseDisplayDate(text);
    this.badInput.set(text !== '' && parsed === null);

    if (text === '') {
      this.commitValue('');
    } else if (parsed) {
      this.commitValue(dahcToIsoDate(parsed));
    }

    this.onValidatorChange();
  }

  protected onFieldKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' && event.altKey) {
      event.preventDefault();
      this.show();
    }
  }

  protected toggle(): void {
    if (this.open()) {
      this.close(false);
    } else {
      this.show();
    }
  }

  protected onDateSelected(iso: string): void {
    this.badInput.set(false);
    this.commitValue(iso);
    this.onValidatorChange();
    this.close(false);
    this.inputElement().nativeElement.focus();
  }

  protected onPopupKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.stopPropagation();
      this.close(true);
    }
  }

  protected onBlur(): void {
    this.markTouched();
  }

  private show(): void {
    const popup = this.popup().nativeElement;
    const anchor = this.inputElement().nativeElement.parentElement ?? this.host.nativeElement;
    const view = this.document.defaultView;

    this.open.set(true);
    popup.showPopover();
    const place = (): void => {
      dahcPositionFloating(anchor, popup);
    };
    place();
    this.stopAutoUpdate = view ? dahcAutoUpdate(view, place) : null;
    this.calendar()?.focusDay();
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
      this.toggleButton().nativeElement.focus();
    }
  }
}
