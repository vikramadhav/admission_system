import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  forwardRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { DahcLiveAnnouncer } from '../a11y/live-announcer.service';
import { dahcUniqueId } from '../a11y/unique-id';
import { DahcSelectOption } from '../select/select-option';

type MoveDirection = 'up' | 'down';

/**
 * Multiple choice with an explicit order: a checkbox group to choose items and an ordered
 * list with move buttons to rank them. The value is the chosen option values, in rank order.
 * Moves are announced through the live announcer and focus stays on the moved item.
 */
@Component({
  selector: 'dahc-ranked-selection',
  templateUrl: './ranked-selection.component.html',
  styleUrl: './ranked-selection.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DahcRankedSelectionComponent),
      multi: true,
    },
  ],
})
export class DahcRankedSelectionComponent implements ControlValueAccessor {
  readonly label = input.required<string>();
  readonly options = input<readonly DahcSelectOption[]>([]);
  readonly description = input<string>('');
  readonly errorMessage = input<string>('');
  readonly invalid = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly orderHeading = input<string>($localize`:@@dahcUi.ranked.orderHeading:Your order of preference`);

  protected readonly groupId = dahcUniqueId('dahc-ranked');
  protected readonly descriptionId = `${this.groupId}-description`;
  protected readonly errorId = `${this.groupId}-error`;
  protected readonly orderHeadingId = `${this.groupId}-order`;
  protected readonly selectedValues = signal<readonly string[]>([]);
  protected readonly isDisabled = computed<boolean>(() => this.disabled() || this.formDisabled());
  protected readonly showError = computed<boolean>(() => this.invalid() && this.errorMessage() !== '');
  protected readonly describedBy = computed<string | null>(() => {
    const ids: string[] = [];

    if (this.description() !== '') {
      ids.push(this.descriptionId);
    }

    if (this.showError()) {
      ids.push(this.errorId);
    }

    return ids.length > 0 ? ids.join(' ') : null;
  });

  /** Selected options in rank order; a value no longer offered keeps its raw value so nothing is lost silently. */
  protected readonly rankedItems = computed<readonly DahcSelectOption[]>(() => {
    const optionsByValue = new Map(this.options().map(option => [option.value, option]));

    return this.selectedValues().map(value => optionsByValue.get(value) ?? { value, label: value });
  });

  private readonly formDisabled = signal<boolean>(false);
  private readonly announcer = inject(DahcLiveAnnouncer);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private onChange: (value: string[]) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: readonly string[] | null): void {
    this.selectedValues.set(value ? [...value] : []);
  }

  registerOnChange(onChange: (value: string[]) => void): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void): void {
    this.onTouched = onTouched;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  protected isSelected(value: string): boolean {
    return this.selectedValues().includes(value);
  }

  protected toggle(value: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const current = this.selectedValues();
    const next = checked ? [...current, value] : current.filter(selected => selected !== value);
    this.update(next);
  }

  protected move(index: number, direction: MoveDirection): void {
    const items = [...this.selectedValues()];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (this.isDisabled() || targetIndex < 0 || targetIndex >= items.length) {
      return;
    }

    const movedValue = items[index];
    const swappedValue = items[targetIndex];

    if (movedValue === undefined || swappedValue === undefined) {
      return;
    }

    items[targetIndex] = movedValue;
    items[index] = swappedValue;
    this.update(items);

    const movedLabel = this.rankedItems()[targetIndex]?.label ?? movedValue;
    const position = targetIndex + 1;
    const total = items.length;
    this.announcer.announce(
      $localize`:@@dahcUi.ranked.moved:${movedLabel}:label: moved to position ${position}:position: of ${total}:total:`,
    );
    this.restoreFocus(targetIndex, direction);
  }

  protected markTouched(): void {
    this.onTouched();
  }

  protected moveUpLabel(label: string): string {
    return $localize`:@@dahcUi.ranked.moveUp:Move ${label}:label: up`;
  }

  protected moveDownLabel(label: string): string {
    return $localize`:@@dahcUi.ranked.moveDown:Move ${label}:label: down`;
  }

  private update(values: string[]): void {
    this.selectedValues.set(values);
    this.onChange(values);
    this.onTouched();
  }

  /** Keeps focus on the moved item; at either end the opposite button is the one still useful. */
  private restoreFocus(index: number, direction: MoveDirection): void {
    const lastIndex = this.selectedValues().length - 1;
    let preferred: MoveDirection = direction;

    if (direction === 'up' && index === 0) {
      preferred = 'down';
    } else if (direction === 'down' && index === lastIndex) {
      preferred = 'up';
    }

    // Wait for the list to re-render before moving focus to the item's new row.
    setTimeout(() => {
      const selector = `[data-rank-index="${index}"][data-move="${preferred}"]`;
      this.host.nativeElement.querySelector<HTMLButtonElement>(selector)?.focus();
    });
  }
}
