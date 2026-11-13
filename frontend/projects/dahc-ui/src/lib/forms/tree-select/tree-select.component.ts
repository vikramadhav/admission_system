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

export interface DahcTreeSelectNode {
  readonly value: string;
  readonly label: string;
  readonly children?: readonly DahcTreeSelectNode[];
  readonly disabled?: boolean;
}

interface VisibleNode {
  readonly node: DahcTreeSelectNode;
  readonly level: number;
  readonly parent: string | null;
  readonly setSize: number;
  readonly position: number;
}

/**
 * Select one value from a hierarchy shown as a tree in a dropdown. The form value is the chosen
 * node's value, '' when empty. The field is a combobox with aria-haspopup="tree"; opening moves
 * focus into a WAI-ARIA tree (roving tab stop): ArrowUp / ArrowDown move, ArrowRight expands or
 * goes to the first child, ArrowLeft collapses or goes to the parent (mirrored in RTL), Home /
 * End, Enter or Space selects; Escape closes back to the field; Tab closes. Only leaves are
 * selectable unless [selectableParents].
 * DERIVED design: DH Input field (50:7763) and dropdown list (50:13293) with an indented tree.
 * Ported from dubai-health-ui dh-tree-select (entry/dh-picker.ts).
 */
@Component({
  selector: 'dahc-tree-select',
  templateUrl: './tree-select.component.html',
  styleUrls: ['../entry-popup/entry-options.css', './tree-select.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcFormFieldComponent, DahcIconComponent, DahcInputDirective],
  providers: [provideDahcValueAccessor(() => DahcTreeSelectComponent)],
  host: {
    // Tree items take focus themselves; their keys and clicks are handled here for the whole tree.
    '(keydown)': 'onHostKeydown($event)',
    '(click)': 'onHostClick($event)',
  },
})
export class DahcTreeSelectComponent extends DahcFormControl<string> {
  readonly label = input.required<string>();
  readonly items = input.required<readonly DahcTreeSelectNode[]>();
  readonly hint = input<string>('');
  readonly errorMessage = input<string>('');
  readonly invalid = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly placeholder = input<string>($localize`:@@dahcUi.treeSelect.placeholder:Select an option`);
  readonly selectableParents = input<boolean>(false);

  protected readonly treeId = dahcUniqueId('dahc-tree-select');
  protected readonly open = signal<boolean>(false);
  protected readonly expanded = signal<ReadonlySet<string>>(new Set());
  protected readonly focused = signal<string>('');

  protected readonly visible = computed<readonly VisibleNode[]>(() => {
    const out: VisibleNode[] = [];
    const expanded = this.expanded();
    const walk = (nodes: readonly DahcTreeSelectNode[], level: number, parent: string | null): void => {
      nodes.forEach((node, index) => {
        out.push({ node, level, parent, setSize: nodes.length, position: index + 1 });

        if (node.children?.length && expanded.has(node.value)) {
          walk(node.children, level + 1, node.value);
        }
      });
    };
    walk(this.items(), 1, null);

    return out;
  });

  protected readonly displayText = computed<string>(() => this.trail(this.value()).at(-1)?.label ?? '');

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

  protected itemId(value: string): string {
    return `${this.treeId}-${value}`;
  }

  protected hasChildren(node: DahcTreeSelectNode): boolean {
    return (node.children?.length ?? 0) > 0;
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

  private onTreeKeydown(event: KeyboardEvent): void {
    const visible = this.visible();
    const index = visible.findIndex(item => item.node.value === this.focused());
    const item = visible[index];

    if (!item) {
      return;
    }

    const rtl = getComputedStyle(this.host.nativeElement).direction === 'rtl';
    const expand = rtl ? 'ArrowLeft' : 'ArrowRight';
    const collapse = rtl ? 'ArrowRight' : 'ArrowLeft';

    switch (event.key) {
      case 'ArrowDown':
        this.focusItem(visible[Math.min(visible.length - 1, index + 1)]?.node.value);
        break;
      case 'ArrowUp':
        this.focusItem(visible[Math.max(0, index - 1)]?.node.value);
        break;
      case 'Home':
        this.focusItem(visible[0]?.node.value);
        break;
      case 'End':
        this.focusItem(visible.at(-1)?.node.value);
        break;
      case expand:
        if (this.hasChildren(item.node)) {
          if (this.expanded().has(item.node.value)) {
            this.focusItem(item.node.children?.[0]?.value);
          } else {
            this.toggleExpanded(item.node.value);
          }
        }

        break;
      case collapse:
        if (this.hasChildren(item.node) && this.expanded().has(item.node.value)) {
          this.toggleExpanded(item.node.value);
        } else if (item.parent !== null) {
          this.focusItem(item.parent);
        }

        break;
      case 'Enter':
      case ' ':
        this.choose(item.node);
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

  protected onHostKeydown(event: KeyboardEvent): void {
    if (event.target instanceof Element && event.target.closest('[role="tree"]')) {
      this.onTreeKeydown(event);
    }
  }

  protected onHostClick(event: MouseEvent): void {
    const target = event.target instanceof Element ? event.target : null;
    const item = target?.closest<HTMLElement>('[role="treeitem"]');
    const node = this.visible().find(candidate => candidate.node.value === item?.dataset['value'])?.node;

    if (!node) {
      return;
    }

    this.focused.set(node.value);

    if (target?.closest('.dahc-tree-select__toggle') || (this.hasChildren(node) && !this.selectableParents())) {
      this.toggleExpanded(node.value);

      return;
    }

    this.choose(node);
  }

  protected onBlur(): void {
    this.markTouched();
  }

  private choose(node: DahcTreeSelectNode): void {
    if (node.disabled) {
      return;
    }

    if (this.hasChildren(node) && !this.selectableParents()) {
      this.toggleExpanded(node.value);

      return;
    }

    this.commitValue(node.value);
    this.close(true);
  }

  private toggleExpanded(value: string): void {
    const next = new Set(this.expanded());

    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }

    this.expanded.set(next);
  }

  private focusItem(value: string | undefined): void {
    if (value === undefined) {
      return;
    }

    this.focused.set(value);
    afterNextRender(() => this.document.getElementById(this.itemId(value))?.focus(), { injector: this.injector });
  }

  private trail(value: string): DahcTreeSelectNode[] {
    const walk = (nodes: readonly DahcTreeSelectNode[], path: DahcTreeSelectNode[]): DahcTreeSelectNode[] | null => {
      for (const node of nodes) {
        if (node.value === value) {
          return [...path, node];
        }

        const found = node.children ? walk(node.children, [...path, node]) : null;

        if (found) {
          return found;
        }
      }

      return null;
    };

    return value === '' ? [] : (walk(this.items(), []) ?? []);
  }

  private show(): void {
    if (this.isDisabled()) {
      return;
    }

    const trail = this.trail(this.value());
    this.expanded.set(new Set(trail.slice(0, -1).map(node => node.value)));
    this.open.set(true);

    const popup = this.popup().nativeElement;
    const anchor = this.trigger().nativeElement.parentElement ?? this.host.nativeElement;
    const view = this.document.defaultView;
    popup.showPopover();
    const place = (): void => {
      dahcPositionFloating(anchor, popup, { matchWidth: true, offset: 6 });
    };
    place();
    this.stopAutoUpdate = view ? dahcAutoUpdate(view, place) : null;
    this.focusItem(trail.at(-1)?.value ?? this.items()[0]?.value);
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
