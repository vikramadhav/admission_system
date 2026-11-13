import { DestroyRef, Directive, ElementRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgControl } from '@angular/forms';

import { DAHC_FORM_FIELD } from '../form-field/form-field-context';

/**
 * Marks a native input, textarea, select or button (combobox triggers) as the control of the
 * surrounding dahc-form-field:
 * it takes the field's id (so the label points at it), aria-describedby (hint or error),
 * aria-invalid and aria-required. The element keeps all its native behaviour, attributes
 * (type, autocomplete, inputmode, readonly, maxlength) and form bindings.
 * Its look comes from the global .dahc-input rules in styles/base/_forms.scss, because projected
 * content cannot be styled by the form field's encapsulated stylesheet.
 */
@Directive({
  selector: 'input[dahcInput], textarea[dahcInput], select[dahcInput], button[dahcInput]',
  host: {
    class: 'dahc-input',
    '[id]': 'field.controlId',
    '[attr.aria-describedby]': 'field.describedBy()',
    '[attr.aria-invalid]': "field.showError() ? 'true' : null",
    '[attr.aria-required]': "field.required() ? 'true' : null",
    '(input)': 'measure()',
  },
})
export class DahcInputDirective implements OnInit {
  protected readonly field = inject(DAHC_FORM_FIELD);

  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly destroyRef = inject(DestroyRef);
  private readonly element = inject<ElementRef<HTMLInputElement | HTMLTextAreaElement | HTMLElement>>(ElementRef);
  private readonly invalidAndTouched = signal<boolean>(false);
  private readonly length = signal<number>(0);
  private readonly maxLength = signal<number>(-1);

  constructor() {
    this.field.registerControlInvalid(this.invalidAndTouched.asReadonly());
    this.field.registerControlLength?.(this.length.asReadonly(), this.maxLength.asReadonly());
  }

  /** Value length and maxlength for the field's optional character counter. */
  protected measure(): void {
    const element = this.element.nativeElement;

    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
      this.length.set(element.value.length);
      this.maxLength.set(element.maxLength);
    }
  }

  ngOnInit(): void {
    this.measure();
    const control = this.ngControl?.control;

    if (!control) {
      return;
    }

    const update = (): void => {
      this.invalidAndTouched.set(control.invalid && control.touched);
      // Programmatic value changes (patchValue) also update the counter.
      queueMicrotask(() => this.measure());
    };
    update();
    control.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(update);
  }
}
