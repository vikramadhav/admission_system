import { ChangeDetectionStrategy, Component, ElementRef, input, output, viewChild } from '@angular/core';

import { DahcFormControl, provideDahcValueAccessor } from '../../core/forms/form-control';
import { DahcIconComponent } from '../../core/icon/icon.component';
import { DahcFormFieldComponent } from '../form-field/form-field.component';
import { DahcInputDirective } from '../input/input.directive';

/** md 48px (Figma Map / Facility), lg 64px (Figma Hero / Facility web). */
export type DahcSearchSize = 'md' | 'lg';

/**
 * Search field: Figma Search 50:8605, consolidated from its screen-specific variants into one
 * component (radius 12, 0.5px border made 1px, 20px search icon, 24px clear icon).
 * Enter emits (searchSubmitted); the clear button empties the field and returns focus to it.
 * The suggestion panel (Dropdown subcomponent 50:9125) comes with the Phase 5 combobox.
 */
@Component({
  selector: 'dahc-search',
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcFormFieldComponent, DahcIconComponent, DahcInputDirective],
  providers: [provideDahcValueAccessor(() => DahcSearchComponent)],
  host: {
    '[class.dahc-search--lg]': "size() === 'lg'",
  },
})
export class DahcSearchComponent extends DahcFormControl<string> {
  /** Accessible name; hidden visually unless showLabel is set. */
  readonly label = input.required<string>();
  readonly showLabel = input<boolean>(false);
  readonly placeholder = input<string>('');
  readonly size = input<DahcSearchSize>('md');
  /** For example "Sorry, we can't find …" (Figma Search Error 50:8641). */
  readonly errorMessage = input<string>('');
  readonly invalid = input<boolean>(false);
  readonly clearLabel = input<string>($localize`:@@dahcUi.search.clear:Clear search`);
  /** Emits the query when the user presses Enter. */
  readonly searchSubmitted = output<string>();

  private readonly inputElement = viewChild.required<ElementRef<HTMLInputElement>>('field');

  protected emptyValue(): string {
    return '';
  }

  protected onInput(event: Event): void {
    this.commitValue((event.target as HTMLInputElement).value);
  }

  protected onEnter(event: Event): void {
    event.preventDefault();
    this.searchSubmitted.emit(this.value());
  }

  protected clear(): void {
    this.commitValue('');
    this.inputElement().nativeElement.focus();
  }

  protected onBlur(): void {
    this.markTouched();
  }
}
