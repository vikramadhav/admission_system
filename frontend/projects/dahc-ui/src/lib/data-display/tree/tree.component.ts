import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';

import { DahcIconComponent } from '../../core/icon/icon.component';

export interface DahcTreeNode {
  readonly label: string;
  readonly value: string;
  readonly children?: readonly DahcTreeNode[];
  readonly disabled?: boolean;
}

interface VisibleNode {
  readonly node: DahcTreeNode;
  readonly parent: DahcTreeNode | null;
}

/**
 * Hierarchical list with expandable nodes (WAI-ARIA APG tree view, single select). One node is
 * in the tab order. Keys: Up / Down move, Right opens a node or enters it, Left closes it or goes
 * to the parent (mirrored in RTL), Home / End jump, Enter / Space select. Clicking a parent also
 * opens or closes it. DERIVED. Ported from dubai-health-ui dh-tree.
 */
@Component({
  selector: 'dahc-tree',
  templateUrl: './tree.component.html',
  styleUrl: './tree.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcIconComponent, NgTemplateOutlet],
  host: {
    class: 'dahc-tree',
    '(keydown)': 'onKeydown($event)',
    '(click)': 'onClick($event)',
  },
})
export class DahcTreeComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  readonly items = input.required<readonly DahcTreeNode[]>();
  readonly label = input<string>($localize`:@@dahcUi.tree.label:Tree`);
  /** Selected node value. */
  readonly value = model<string>('');
  /** Values of the open nodes. */
  readonly expanded = model<readonly string[]>([]);
  /** A node was selected (also on re-selecting the same node). */
  readonly nodeSelected = output<string>();

  private readonly focusedValue = signal<string>('');

  /** The node in the tab order: the last focused, else the selected, else the first. */
  protected readonly tabStop = computed<string>(() => this.focusedValue() || this.value() || this.items()[0]?.value || '');

  protected hasChildren(node: DahcTreeNode): boolean {
    return (node.children?.length ?? 0) > 0;
  }

  protected isOpen(node: DahcTreeNode): boolean {
    return this.expanded().includes(node.value);
  }

  /** All nodes by value, for events handled on the host. */
  private readonly nodesByValue = computed<ReadonlyMap<string, DahcTreeNode>>(() => {
    const map = new Map<string, DahcTreeNode>();
    const walk = (nodes: readonly DahcTreeNode[]): void =>
      nodes.forEach(node => {
        map.set(node.value, node);
        walk(node.children ?? []);
      });
    walk(this.items());

    return map;
  });

  protected onClick(event: Event): void {
    const item = (event.target as Element | null)?.closest<HTMLElement>('[data-value]');
    const node = item ? this.nodesByValue().get(item.dataset['value'] ?? '') : undefined;

    if (!node) {
      return;
    }

    if (this.hasChildren(node)) {
      this.toggle(node);
    }

    this.select(node);
  }

  protected onFocus(node: DahcTreeNode, event: FocusEvent): void {
    if (event.target === event.currentTarget) {
      this.focusedValue.set(node.value);
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    const list = this.visible();
    const index = list.findIndex(entry => entry.node.value === this.tabStop());
    const entry = list[index];

    if (!entry) {
      return;
    }

    const rtl = getComputedStyle(this.host.nativeElement).direction === 'rtl';
    const inward = rtl ? 'ArrowLeft' : 'ArrowRight';
    const outward = rtl ? 'ArrowRight' : 'ArrowLeft';
    const hasChildren = this.hasChildren(entry.node);
    const open = this.isOpen(entry.node);
    let target: string | undefined;

    switch (event.key) {
      case 'ArrowDown':
        target = list[index + 1]?.node.value;
        break;
      case 'ArrowUp':
        target = list[index - 1]?.node.value;
        break;
      case 'Home':
        target = list[0]?.node.value;
        break;
      case 'End':
        target = list[list.length - 1]?.node.value;
        break;
      case inward:
        if (hasChildren && !open) {
          this.toggle(entry.node, true);
        } else if (hasChildren) {
          target = entry.node.children?.[0]?.value;
        }
        break;
      case outward:
        if (hasChildren && open) {
          this.toggle(entry.node, false);
        } else if (entry.parent) {
          target = entry.parent.value;
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.select(entry.node);

        return;
      default:
        return;
    }

    event.preventDefault();

    if (target) {
      this.focusNode(target);
    }
  }

  private visible(): VisibleNode[] {
    const result: VisibleNode[] = [];
    const walk = (nodes: readonly DahcTreeNode[], parent: DahcTreeNode | null): void => {
      for (const node of nodes) {
        result.push({ node, parent });

        if (this.hasChildren(node) && this.isOpen(node)) {
          walk(node.children ?? [], node);
        }
      }
    };
    walk(this.items(), null);

    return result;
  }

  private toggle(node: DahcTreeNode, open = !this.isOpen(node)): void {
    this.expanded.update(values => (open ? [...values.filter(value => value !== node.value), node.value] : values.filter(value => value !== node.value)));
  }

  private select(node: DahcTreeNode): void {
    if (node.disabled) {
      return;
    }

    this.value.set(node.value);
    this.focusedValue.set(node.value);
    this.nodeSelected.emit(node.value);
  }

  private focusNode(value: string): void {
    this.focusedValue.set(value);
    afterNextRender(
      () => this.host.nativeElement.querySelector<HTMLElement>(`[data-value="${CSS.escape(value)}"]`)?.focus(),
      { injector: this.injector },
    );
  }
}
