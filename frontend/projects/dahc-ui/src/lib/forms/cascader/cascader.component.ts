import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
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

export interface DahcCascaderNode {
  readonly value: string;
  readonly label: string;
  readonly children?: readonly DahcCascaderNode[];
  readonly disabled?: boolean;
}

/**
 * Select a value from nested options shown as columns (for example Country › Emirate › Area).
 * The form value is the selected path of values (['ae', 'dubai', 'deira']), [] when empty.
 * WAI-ARIA combobox: focus stays on the field and aria-activedescendant points at the active
 * option. Enter, Space or ArrowDown opens; ArrowUp / ArrowDown move in a column; ArrowRight opens
 * the next level and ArrowLeft goes back (mirrored in RTL); Enter selects; Escape closes; Tab
 * closes. Only leaves are selectable unless [changeOnSelect].
 * DERIVED design: DH Input field trigger (50:7763) and DH dropdown list columns (50:13293).
 * Ported from dubai-health-ui dh-cascader (entry/dh-picker.ts).
 */
@Component({
  selector: 'dahc-cascader',
  templateUrl: './cascader.component.html',
  styleUrls: ['../entry-popup/entry-options.css', './cascader.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcFormFieldComponent, DahcIconComponent, DahcInputDirective],
  providers: [provideDahcValueAccessor(() => DahcCascaderComponent)],
  host: {
    // Options are reached with aria-activedescendant, so clicks are delegated from the host.
    '(pointerdown)': 'onOptionPointerDown($event)',
    '(click)': 'onOptionClick($event)',
  },
})
export class DahcCascaderComponent extends DahcFormControl<readonly string[]> {
  readonly label = input.required<string>();
  readonly options = input.required<readonly DahcCascaderNode[]>();
  readonly hint = input<string>('');
  readonly errorMessage = input<string>('');
  readonly invalid = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly placeholder = input<string>($localize`:@@dahcUi.cascader.placeholder:Select an option`);
  /** Allows selecting a parent level, not only leaves. */
  readonly changeOnSelect = input<boolean>(false);
  /** Accessible name of each column; {n} is replaced by the level number. */
  readonly levelLabel = input<string>($localize`:@@dahcUi.cascader.level:Level {n}`);

  protected readonly popupId = dahcUniqueId('dahc-cascader');
  protected readonly open = signal<boolean>(false);
  /** Highlighted index per column. */
  protected readonly path = signal<readonly number[]>([]);
  /** Column holding the active option. */
  protected readonly column = signal<number>(0);
  /** Alias for templates, where `column` is the loop variable. */
  protected readonly activeColumn = this.column.asReadonly();

  protected readonly columns = computed<readonly (readonly DahcCascaderNode[])[]>(() => {
    const columns: (readonly DahcCascaderNode[])[] = [this.options()];
    const column = this.column();

    this.path().forEach((index, level) => {
      const node = columns[level]?.[index];

      if (node?.children?.length && level < column + 1) {
        columns.push(node.children);
      }
    });

    return columns;
  });

  protected readonly displayText = computed<string>(() =>
    this.nodesFor(this.value())
      .map(node => node.label)
      .join(' / '),
  );

  protected readonly activeId = computed<string | null>(() => {
    const index = this.path()[this.column()];

    return this.open() && index !== undefined ? this.optionId(this.column(), index) : null;
  });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
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

  protected emptyValue(): readonly string[] {
    return [];
  }

  protected optionId(column: number, index: number): string {
    return `${this.popupId}-${column}-${index}`;
  }

  protected columnLabel(column: number): string {
    return this.levelLabel().replace('{n}', String(column + 1));
  }

  protected isOnPath(column: number, node: DahcCascaderNode): boolean {
    return this.value()[column] === node.value;
  }

  protected toggleOpen(): void {
    if (this.open()) {
      this.close(true);
    } else {
      this.show();
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (!this.open()) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        this.show();
      }

      return;
    }

    const rtl = getComputedStyle(this.host.nativeElement).direction === 'rtl';
    const column = this.column();
    const nodes = this.columns()[column] ?? [];
    const index = this.path()[column] ?? 0;
    const node = nodes[index];

    switch (event.key) {
      case 'ArrowDown':
        this.highlight(column, this.nextEnabled(nodes, index, 1));
        break;
      case 'ArrowUp':
        this.highlight(column, this.nextEnabled(nodes, index, -1));
        break;
      case rtl ? 'ArrowLeft' : 'ArrowRight':
        if (node?.children?.length && !node.disabled) {
          this.path.set([...this.path().slice(0, column + 1), 0]);
          this.column.set(column + 1);
        }

        break;
      case rtl ? 'ArrowRight' : 'ArrowLeft':
        if (column > 0) {
          this.path.set(this.path().slice(0, column));
          this.column.set(column - 1);
        }

        break;
      case 'Enter':
      case ' ':
        this.select(column, index);
        break;
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
  }

  /** Keeps focus on the field while an option is clicked. */
  protected onOptionPointerDown(event: PointerEvent): void {
    if (this.optionAt(event) !== null) {
      event.preventDefault();
    }
  }

  protected onOptionClick(event: MouseEvent): void {
    const at = this.optionAt(event);

    if (at !== null) {
      this.select(at.column, at.index);
    }
  }

  protected onBlur(): void {
    this.markTouched();
  }

  private optionAt(event: Event): { column: number; index: number } | null {
    const option = event.target instanceof Element ? event.target.closest<HTMLElement>('[role="option"]') : null;
    const column = option?.dataset['column'];
    const index = option?.dataset['index'];

    return column === undefined || index === undefined ? null : { column: Number(column), index: Number(index) };
  }

  private highlight(column: number, index: number): void {
    this.path.set([...this.path().slice(0, column), index]);
    this.column.set(column);
  }

  private select(column: number, index: number): void {
    const node = this.columns()[column]?.[index];

    if (!node || node.disabled) {
      return;
    }

    this.highlight(column, index);

    if (node.children?.length && !this.changeOnSelect()) {
      this.path.set([...this.path(), 0]);
      this.column.set(column + 1);

      return;
    }

    const columns = this.columns();
    this.commitValue(this.path().map((selected, level) => columns[level]?.[selected]?.value ?? ''));
    this.close(true);
  }

  private nodesFor(values: readonly string[]): DahcCascaderNode[] {
    const nodes: DahcCascaderNode[] = [];
    let level = this.options();

    for (const value of values) {
      const node = level.find(candidate => candidate.value === value);

      if (!node) {
        break;
      }

      nodes.push(node);
      level = node.children ?? [];
    }

    return nodes;
  }

  private nextEnabled(nodes: readonly DahcCascaderNode[], from: number, step: 1 | -1): number {
    for (let offset = 1; offset <= nodes.length; offset++) {
      const index = (from + step * offset + nodes.length) % nodes.length;

      if (!nodes[index]?.disabled) {
        return index;
      }
    }

    return from;
  }

  private show(): void {
    if (this.isDisabled()) {
      return;
    }

    const path: number[] = [];
    let level = this.options();

    for (const value of this.value()) {
      const index = level.findIndex(node => node.value === value);

      if (index < 0) {
        break;
      }

      path.push(index);
      level = level[index]?.children ?? [];
    }

    this.path.set(path.length > 0 ? path : [0]);
    this.column.set(Math.max(0, path.length - 1));
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
