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
  output,
  signal,
  viewChild,
} from '@angular/core';

import { dahcUniqueId } from '../../core/a11y/unique-id';
import { DahcFormControl, provideDahcValueAccessor } from '../../core/forms/form-control';
import { dahcAutoUpdate, dahcPositionFloating } from '../../core/overlay/position';
import { DahcFormFieldComponent } from '../form-field/form-field.component';
import { DahcInputDirective } from '../input/input.directive';

export interface DahcMentionOption {
  readonly value: string;
  readonly label: string;
  readonly disabled?: boolean;
}

function optionIndex(event: Event): number | null {
  const option = event.target instanceof Element ? event.target.closest<HTMLElement>('[role="option"]') : null;

  return option?.dataset['index'] === undefined ? null : Number(option.dataset['index']);
}

const escapeRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Text area that suggests people (or anything) after a trigger character. The form value is the
 * text. Typing [prefix] ("@" by default) opens suggestions from [options] that match what follows
 * it; ArrowDown / ArrowUp move, Enter or Tab inserts "@Label ", Escape closes. The textarea is a
 * WAI-ARIA combobox with list autocomplete. (mentioned) reports each inserted option.
 * DERIVED design: DH Input field (textarea) and dropdown list. Ported from dubai-health-ui
 * dh-mention (entry/dh-mention.ts).
 */
@Component({
  selector: 'dahc-mention',
  templateUrl: './mention.component.html',
  styleUrls: ['../entry-popup/entry-options.css', './mention.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcFormFieldComponent, DahcInputDirective],
  providers: [provideDahcValueAccessor(() => DahcMentionComponent)],
  host: {
    // Suggestions are reached with aria-activedescendant, so clicks are delegated from the host.
    '(pointerdown)': 'onOptionPointerDown($event)',
    '(click)': 'onOptionClick($event)',
  },
})
export class DahcMentionComponent extends DahcFormControl<string> {
  readonly label = input.required<string>();
  readonly options = input.required<readonly DahcMentionOption[]>();
  readonly hint = input<string>('');
  readonly errorMessage = input<string>('');
  readonly invalid = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly placeholder = input<string>('');
  readonly rows = input<number>(3);
  /** Trigger character. */
  readonly prefix = input<string>('@');
  readonly suggestionsLabel = input<string>($localize`:@@dahcUi.mention.suggestions:Suggestions`);
  readonly mentioned = output<DahcMentionOption>();

  protected readonly listId = dahcUniqueId('dahc-mention-list');
  protected readonly open = signal<boolean>(false);
  protected readonly query = signal<string>('');
  protected readonly activeIndex = signal<number>(0);
  /** Text written into the textarea: outside writes and insertions only (keeps the caret). */
  protected readonly display = signal<string>('');

  protected readonly suggestions = computed<readonly DahcMentionOption[]>(() => {
    const query = this.query().toLowerCase();

    return this.options().filter(
      option => !option.disabled && (option.label.toLowerCase().includes(query) || option.value.toLowerCase().includes(query)),
    );
  });

  protected readonly expanded = computed<boolean>(() => this.open() && this.suggestions().length > 0);
  protected readonly activeId = computed<string | null>(() =>
    this.expanded() && this.suggestions()[this.activeIndex()] ? `${this.listId}-${this.activeIndex()}` : null,
  );

  private readonly document = inject(DOCUMENT);
  private readonly textarea = viewChild.required<ElementRef<HTMLTextAreaElement>>('textarea');
  private readonly popup = viewChild.required<ElementRef<HTMLElement>>('popup');
  private start = -1;
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
    this.commitValue((event.target as HTMLTextAreaElement).value);
    this.detect();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (!this.expanded()) {
      return;
    }

    const list = this.suggestions();

    switch (event.key) {
      case 'ArrowDown':
        this.activeIndex.set((this.activeIndex() + 1) % list.length);
        break;
      case 'ArrowUp':
        this.activeIndex.set((this.activeIndex() - 1 + list.length) % list.length);
        break;
      case 'Enter':
      case 'Tab': {
        const option = list[this.activeIndex()];

        if (option) {
          this.insert(option);
        }

        break;
      }
      case 'Escape':
        event.stopPropagation();
        this.open.set(false);
        break;
      default:
        return;
    }

    event.preventDefault();
  }

  /** Finds a "@query" that ends at the caret. */
  protected detect(): void {
    const textarea = this.textarea().nativeElement;
    const prefix = this.prefix();

    if (prefix === '') {
      return;
    }

    const before = textarea.value.slice(0, textarea.selectionStart ?? 0);
    const match = new RegExp(`(?:^|\\s)${escapeRegExp(prefix)}([^\\s${escapeRegExp(prefix)}]*)$`).exec(before);

    if (match) {
      const query = match[1] ?? '';
      this.query.set(query);
      this.start = before.length - query.length - prefix.length;
      this.activeIndex.set(0);
      this.open.set(true);
    } else {
      this.open.set(false);
    }
  }

  protected insert(option: DahcMentionOption): void {
    const textarea = this.textarea().nativeElement;

    if (this.start < 0) {
      return;
    }

    const caret = textarea.selectionStart ?? textarea.value.length;
    const text = `${this.prefix()}${option.label} `;
    const next = textarea.value.slice(0, this.start) + text + textarea.value.slice(caret);
    const position = this.start + text.length;

    textarea.value = next;
    textarea.setSelectionRange(position, position);
    textarea.focus();
    this.display.set(next);
    this.commitValue(next);
    this.open.set(false);
    this.mentioned.emit(option);
  }

  /** Keeps focus in the textarea while a suggestion is clicked. */
  protected onOptionPointerDown(event: PointerEvent): void {
    if (optionIndex(event) !== null) {
      event.preventDefault();
    }
  }

  protected onOptionClick(event: MouseEvent): void {
    const index = optionIndex(event);
    const option = index === null ? undefined : this.suggestions()[index];

    if (option !== undefined) {
      this.insert(option);
    }
  }

  protected onBlur(): void {
    this.open.set(false);
    this.markTouched();
  }

  private syncPopup(show: boolean): void {
    const popup = this.popup().nativeElement;
    const anchor = this.textarea().nativeElement.parentElement ?? this.textarea().nativeElement;

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
    }
  }
}
