import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';

import { dahcUniqueId } from '../../core/a11y/unique-id';
import { DahcFormControl, provideDahcValueAccessor } from '../../core/forms/form-control';
import { dahcAutoUpdate, dahcPositionFloating } from '../../core/overlay/position';
import { DahcFormFieldComponent } from '../form-field/form-field.component';
import { DahcInputDirective } from '../input/input.directive';

function optionIndex(event: Event): number | null {
  const option = event.target instanceof Element ? event.target.closest<HTMLElement>('[role="option"]') : null;

  return option?.dataset['index'] === undefined ? null : Number(option.dataset['index']);
}

/**
 * Text field with suggestions: the candidate may type any value or pick a suggestion. The form
 * value is the text. WAI-ARIA combobox with list autocomplete: typing filters [options] (up to
 * [maxSuggestions]); ArrowDown / ArrowUp move through the suggestions, Enter picks the active
 * one, Escape closes the list (a second Escape is left to the page).
 * PARTIAL Figma: DH Search dropdown with suggestions (50:8605); component DERIVED.
 * Ported from dubai-health-ui dh-auto-complete (form/dh-form-controls.ts).
 */
@Component({
  selector: 'dahc-auto-complete',
  templateUrl: './auto-complete.component.html',
  styleUrls: ['../entry-popup/entry-options.css', './auto-complete.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcFormFieldComponent, DahcInputDirective],
  providers: [provideDahcValueAccessor(() => DahcAutoCompleteComponent)],
  host: {
    // Suggestions are reached with aria-activedescendant, so clicks are delegated from the host.
    '(pointerdown)': 'onOptionPointerDown($event)',
    '(click)': 'onOptionClick($event)',
  },
})
export class DahcAutoCompleteComponent extends DahcFormControl<string> {
  readonly label = input.required<string>();
  readonly options = input.required<readonly string[]>();
  readonly hint = input<string>('');
  readonly errorMessage = input<string>('');
  readonly invalid = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly placeholder = input<string>('');
  readonly maxSuggestions = input<number>(8);
  readonly suggestionsLabel = input<string>($localize`:@@dahcUi.autoComplete.suggestions:Suggestions`);

  protected readonly listId = dahcUniqueId('dahc-auto-complete-list');
  protected readonly open = signal<boolean>(false);
  protected readonly activeIndex = signal<number>(-1);
  /** Text written into the field: changes on outside writes and picks, never while typing (keeps the caret). */
  protected readonly display = signal<string>('');

  protected readonly suggestions = computed<readonly string[]>(() => {
    const query = this.value().trim().toLowerCase();

    if (query === '') {
      return [];
    }

    return this.options()
      .filter(option => option.toLowerCase().includes(query) && option.toLowerCase() !== query)
      .slice(0, this.maxSuggestions());
  });

  protected readonly expanded = computed<boolean>(() => this.open() && this.suggestions().length > 0);

  protected readonly activeId = computed<string | null>(() => {
    const index = this.activeIndex();

    return this.expanded() && index >= 0 ? `${this.listId}-${index}` : null;
  });

  private readonly document = inject(DOCUMENT);
  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');
  private readonly popup = viewChild.required<ElementRef<HTMLElement>>('popup');
  private stopAutoUpdate: (() => void) | null = null;

  constructor() {
    super();
    afterRenderEffect(() => this.syncPopup(this.expanded()));
    inject(DestroyRef).onDestroy(() => this.stopAutoUpdate?.());
  }

  protected emptyValue(): string {
    return '';
  }

  override writeValue(value: string | null | undefined): void {
    super.writeValue(value);
    this.display.set(this.value());
  }

  protected optionId(index: number): string {
    return `${this.listId}-${index}`;
  }

  protected onInput(event: Event): void {
    this.commitValue((event.target as HTMLInputElement).value);
    this.open.set(true);
    this.activeIndex.set(-1);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const list = this.suggestions();

    switch (event.key) {
      case 'ArrowDown':
        if (list.length === 0) {
          return;
        }

        this.open.set(true);
        this.activeIndex.set((this.activeIndex() + 1) % list.length);
        break;
      case 'ArrowUp':
        if (list.length === 0) {
          return;
        }

        this.open.set(true);
        this.activeIndex.set((this.activeIndex() - 1 + list.length) % list.length);
        break;
      case 'Enter': {
        const option = list[this.activeIndex()];

        if (!this.expanded() || !option) {
          return;
        }

        this.pick(option);
        break;
      }
      case 'Escape':
        if (!this.expanded()) {
          return;
        }

        event.stopPropagation();
        this.open.set(false);
        break;
      default:
        return;
    }

    event.preventDefault();
  }

  protected pick(option: string): void {
    this.commitValue(option);
    this.display.set(option);
    this.field().nativeElement.value = option;
    this.open.set(false);
    this.activeIndex.set(-1);
  }

  /** Keeps focus in the field while a suggestion is clicked. */
  protected onOptionPointerDown(event: PointerEvent): void {
    if (optionIndex(event) !== null) {
      event.preventDefault();
    }
  }

  protected onOptionClick(event: MouseEvent): void {
    const index = optionIndex(event);
    const option = index === null ? undefined : this.suggestions()[index];

    if (option !== undefined) {
      this.pick(option);
    }
  }

  protected onBlur(): void {
    this.open.set(false);
    this.markTouched();
  }

  private syncPopup(show: boolean): void {
    const popup = this.popup().nativeElement;
    const anchor = this.field().nativeElement.parentElement ?? this.field().nativeElement;

    if (show && !popup.matches(':popover-open')) {
      popup.showPopover();
      const view = this.document.defaultView;
      const place = (): void => {
        dahcPositionFloating(anchor, popup, { matchWidth: true });
      };
      place();
      this.stopAutoUpdate = view ? dahcAutoUpdate(view, place) : null;
    } else if (!show && popup.matches(':popover-open')) {
      popup.hidePopover();
      this.stopAutoUpdate?.();
      this.stopAutoUpdate = null;
    } else if (show) {
      dahcPositionFloating(anchor, popup, { matchWidth: true });
    }
  }
}
