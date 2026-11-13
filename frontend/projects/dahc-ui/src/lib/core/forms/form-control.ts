import { Directive, Provider, Type, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/** Registers a component as the ControlValueAccessor of its host element. */
export function provideDahcValueAccessor(component: () => Type<ControlValueAccessor>): Provider {
  return { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(component), multi: true };
}

/**
 * Shared ControlValueAccessor plumbing for DAHC-UI form controls: the value signal, change and
 * touched callbacks, and a disabled state that combines the input with the form control's state.
 */
@Directive()
export abstract class DahcFormControl<T> implements ControlValueAccessor {
  readonly disabled = input<boolean>(false);

  protected readonly value = signal<T>(this.emptyValue());
  protected readonly isDisabled = computed<boolean>(() => this.disabled() || this.formDisabled());

  private readonly formDisabled = signal<boolean>(false);
  private onChange: (value: T) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  /** The value the control holds when the form writes null or undefined. */
  protected abstract emptyValue(): T;

  writeValue(value: T | null | undefined): void {
    this.value.set(value ?? this.emptyValue());
  }

  registerOnChange(onChange: (value: T) => void): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void): void {
    this.onTouched = onTouched;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  /** Sets the value from a user interaction and reports it to the form. */
  protected commitValue(value: T): void {
    this.value.set(value);
    this.onChange(value);
  }

  protected markTouched(): void {
    this.onTouched();
  }
}
