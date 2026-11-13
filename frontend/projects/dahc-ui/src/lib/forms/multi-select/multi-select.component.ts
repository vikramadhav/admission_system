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

import { dahcUniqueId } from '../../core/a11y/unique-id';
import { DahcFormControl, provideDahcValueAccessor } from '../../core/forms/form-control';
import { DahcIconComponent } from '../../core/icon/icon.component';
import { dahcAutoUpdate, dahcPositionFloating } from '../../core/overlay/position';
import { DahcFormFieldComponent } from '../form-field/form-field.component';
import { DahcInputDirective } from '../input/input.directive';
import { DahcSelectOption } from '../select/select-option';

/**
 * Choose several options from a list, optionally filtered by a search field inside the list
 * (GME "Training sites"). The form value is the array of selected values, in option order.
 * WAI-ARIA combobox with a multi-selectable listbox: Enter, Space or ArrowDown on the field opens
 * the list; ArrowUp / ArrowDown / Home / End move; Enter (and Space without search) toggles the
 * option and keeps the list open; Escape closes back to the field; Tab closes.
 * Figma Dropdown › Multi select dropdown (50:13367, open with search 50:13417): Input field box,
 * comma-separated value with ellipsis, list radius 12 with Shadow 4, 48px option rows with DH
 * checkboxes, hover blue-100, in-list search field. Ported from dubai-health-ui (select/dh-select.ts).
 */
@Component({
  selector: 'dahc-multi-select',
  templateUrl: './multi-select.component.html',
  styleUrl: './multi-select.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcFormFieldComponent, DahcIconComponent, DahcInputDirective],
  providers: [provideDahcValueAccessor(() => DahcMultiSelectComponent)],
  host: {
    // Options are reached with aria-activedescendant, so clicks are delegated from the host.
    '(pointerdown)': 'onOptionPointerDown($event)',
    '(click)': 'onOptionClick($event)',
  },
})
export class DahcMultiSelectComponent extends DahcFormControl<readonly string[]> {
  readonly label = input.required<string>();
  readonly options = input.required<readonly DahcSelectOption[]>();
  readonly placeholder = input<string>($localize`:@@dahcUi.multiSelect.placeholder:Select options`);
  readonly hint = input<string>('');
  readonly errorMessage = input<string>('');
  readonly invalid = input<boolean>(false);
  readonly required = input<boolean>(false);
  /** Shows a filter field at the top of the list. */
  readonly searchable = input<boolean>(true);
  readonly searchLabel = input<string>($localize`:@@dahcUi.multiSelect.search:Search options`);
  readonly noResultsText = input<string>($localize`:@@dahcUi.multiSelect.noResults:No matching options`);

  protected readonly listId = dahcUniqueId('dahc-multi-select-list');
  protected readonly open = signal<boolean>(false);
  protected readonly query = signal<string>('');
  protected readonly activeIndex = signal<number>(-1);

  protected readonly visibleOptions = computed<readonly DahcSelectOption[]>(() => {
    const query = this.query().trim().toLowerCase();

    return query ? this.options().filter(option => option.label.toLowerCase().includes(query)) : this.options();
  });

  protected readonly summary = computed<string>(() =>
    this.options()
      .filter(option => this.value().includes(option.value))
      .map(option => option.label)
      .join(', '),
  );

  protected readonly activeId = computed<string | null>(() => {
    const index = this.activeIndex();

    return this.open() && index >= 0 && index < this.visibleOptions().length ? this.optionId(index) : null;
  });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly popup = viewChild.required<ElementRef<HTMLElement>>('popup');
  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('search');
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

  protected emptyValue(): readonly string[] {
    return [];
  }

  protected optionId(index: number): string {
    return `${this.listId}-${index}`;
  }

  protected isSelected(option: DahcSelectOption): boolean {
    return this.value().includes(option.value);
  }

  protected toggleOpen(): void {
    if (this.open()) {
      this.close(true);
    } else {
      this.show();
    }
  }

  protected onQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.activeIndex.set(this.nextEnabled(-1, 1));
  }

  protected choose(option: DahcSelectOption): void {
    if (option.disabled) {
      return;
    }

    const selected = new Set(this.value());

    if (selected.has(option.value)) {
      selected.delete(option.value);
    } else {
      selected.add(option.value);
    }

    // Keep the value in option order, whatever order the user picked in.
    this.commitValue(this.options().map(candidate => candidate.value).filter(value => selected.has(value)));
  }

  protected onKeydown(event: KeyboardEvent): void {
    const options = this.visibleOptions();
    const fromSearch = event.target === this.searchInput()?.nativeElement;

    if (!this.open()) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        this.show();
      }

      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        this.activeIndex.set(this.nextEnabled(this.activeIndex(), 1));
        break;
      case 'ArrowUp':
        this.activeIndex.set(this.nextEnabled(this.activeIndex(), -1));
        break;
      case 'Home':
        if (fromSearch) {
          return;
        }

        this.activeIndex.set(this.nextEnabled(-1, 1));
        break;
      case 'End':
        if (fromSearch) {
          return;
        }

        this.activeIndex.set(this.nextEnabled(options.length, -1));
        break;
      case 'Enter': {
        const option = options[this.activeIndex()];

        if (option) {
          this.choose(option);
        }

        break;
      }
      case ' ': {
        if (fromSearch) {
          return;
        }

        const option = options[this.activeIndex()];

        if (option) {
          this.choose(option);
        }

        break;
      }
      case 'Escape':
        event.stopPropagation();
        this.close(true);
        break;
      case 'Tab':
        this.close(false);

        return;
      default:
        return;
    }

    event.preventDefault();
    this.scrollActiveIntoView();
  }

  /** Keeps focus in the field or search while an option is clicked. */
  protected onOptionPointerDown(event: PointerEvent): void {
    if (this.optionIndexOf(event) !== null) {
      event.preventDefault();
    }
  }

  protected onOptionClick(event: MouseEvent): void {
    const index = this.optionIndexOf(event);
    const option = index === null ? undefined : this.visibleOptions()[index];

    if (index !== null && option) {
      this.activeIndex.set(index);
      this.choose(option);
    }
  }

  protected onBlur(): void {
    this.markTouched();
  }

  private show(): void {
    if (this.isDisabled()) {
      return;
    }

    const popup = this.popup().nativeElement;
    const anchor = this.trigger().nativeElement.parentElement ?? this.host.nativeElement;
    const view = this.document.defaultView;
    const firstSelected = this.visibleOptions().findIndex(option => this.isSelected(option) && !option.disabled);

    this.open.set(true);
    this.activeIndex.set(firstSelected >= 0 ? firstSelected : this.nextEnabled(-1, 1));
    popup.showPopover();
    const place = (): void => {
      dahcPositionFloating(anchor, popup, { matchWidth: true });
    };
    place();
    this.stopAutoUpdate = view ? dahcAutoUpdate(view, place) : null;

    afterNextRender(
      () => {
        this.searchInput()?.nativeElement.focus();
        this.scrollActiveIntoView();
      },
      { injector: this.injector },
    );
  }

  private close(returnFocus: boolean): void {
    this.open.set(false);
    this.query.set('');
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

  private optionIndexOf(event: Event): number | null {
    const option = event.target instanceof Element ? event.target.closest<HTMLElement>('[role="option"]') : null;

    return option?.dataset['index'] === undefined ? null : Number(option.dataset['index']);
  }

  private nextEnabled(from: number, step: 1 | -1): number {
    const options = this.visibleOptions();

    for (let offset = 1; offset <= options.length; offset++) {
      const index = (from + step * offset + options.length) % options.length;

      if (!options[index]?.disabled) {
        return index;
      }
    }

    return -1;
  }

  private scrollActiveIntoView(): void {
    afterNextRender(
      () => this.host.nativeElement.querySelector('.dahc-multi-select__option--active')?.scrollIntoView({ block: 'nearest' }),
      { injector: this.injector },
    );
  }
}
