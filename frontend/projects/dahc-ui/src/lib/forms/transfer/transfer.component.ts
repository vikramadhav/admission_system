import { ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, computed, inject, input, output, signal } from '@angular/core';

import { dahcUniqueId } from '../../core/a11y/unique-id';
import { DahcFormControl, provideDahcValueAccessor } from '../../core/forms/form-control';
import { DahcIconComponent } from '../../core/icon/icon.component';

export interface DahcTransferItem {
  readonly value: string;
  readonly label: string;
  readonly disabled?: boolean;
}

export type DahcTransferSide = 'source' | 'target';

export interface DahcTransferMove {
  readonly direction: 'to-target' | 'to-source';
  readonly values: readonly string[];
}

interface PanelView {
  readonly side: DahcTransferSide;
  readonly title: string;
  readonly listId: string;
  readonly items: readonly DahcTransferItem[];
  readonly checkedCount: number;
  readonly all: boolean;
  readonly mixed: boolean;
  readonly active: number;
}

/**
 * Move items between two lists (for example assign programmes to a reviewer). The form value is
 * the array of item values in the target list, in item order. Each list is a multi-selectable
 * WAI-ARIA listbox (focus on the list, aria-activedescendant): ArrowUp / ArrowDown / Home / End
 * move, Space or Enter checks; the header checkbox checks all; the buttons move the checked
 * items. Panels stack below 33rem of component width.
 * DERIVED design: DH dropdown list panels (radius 12, 48px rows, DH checkboxes) and outline
 * round buttons. Ported from dubai-health-ui dh-transfer (entry/dh-transfer.ts).
 */
@Component({
  selector: 'dahc-transfer',
  templateUrl: './transfer.component.html',
  styleUrl: './transfer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcIconComponent],
  providers: [provideDahcValueAccessor(() => DahcTransferComponent)],
  host: {
    // Options are reached with aria-activedescendant, so clicks are delegated from the host.
    '(click)': 'onItemClick($event)',
  },
})
export class DahcTransferComponent extends DahcFormControl<readonly string[]> {
  readonly items = input.required<readonly DahcTransferItem[]>();
  readonly sourceTitle = input<string>($localize`:@@dahcUi.transfer.source:Available`);
  readonly targetTitle = input<string>($localize`:@@dahcUi.transfer.target:Selected`);
  readonly searchable = input<boolean>(false);
  readonly searchLabel = input<string>($localize`:@@dahcUi.transfer.search:Search`);
  readonly emptyText = input<string>($localize`:@@dahcUi.transfer.empty:No items`);
  /** Emitted after items move, with their values. */
  readonly moved = output<DahcTransferMove>();

  protected readonly uid = dahcUniqueId('dahc-transfer');
  protected readonly checked = signal<ReadonlySet<string>>(new Set());
  protected readonly active = signal<Readonly<Record<DahcTransferSide, number>>>({ source: 0, target: 0 });
  protected readonly filters = signal<Readonly<Record<DahcTransferSide, string>>>({ source: '', target: '' });

  protected readonly panels = computed<readonly PanelView[]>(() =>
    (['source', 'target'] as const).map(side => {
      const items = this.list(side);
      const enabled = items.filter(item => !item.disabled);
      const checkedCount = enabled.filter(item => this.checked().has(item.value)).length;
      const all = enabled.length > 0 && checkedCount === enabled.length;

      return {
        side,
        title: side === 'source' ? this.sourceTitle() : this.targetTitle(),
        listId: `${this.uid}-${side}`,
        items,
        checkedCount,
        all,
        mixed: checkedCount > 0 && !all,
        active: Math.min(this.active()[side], Math.max(0, items.length - 1)),
      };
    }),
  );

  protected readonly canMoveToTarget = computed<boolean>(() => this.hasChecked('source'));
  protected readonly canMoveToSource = computed<boolean>(() => this.hasChecked('target'));

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  protected emptyValue(): readonly string[] {
    return [];
  }

  protected countText(panel: PanelView): string {
    const total = panel.items.length;

    return panel.checkedCount > 0
      ? $localize`:@@dahcUi.transfer.countChecked:${panel.checkedCount}:checked:/${total}:total: items`
      : $localize`:@@dahcUi.transfer.count:${total}:total: items`;
  }

  protected selectAllLabel(panel: PanelView): string {
    return $localize`:@@dahcUi.transfer.selectAll:Select all ${panel.title}:title:`;
  }

  protected moveLabel(title: string): string {
    return $localize`:@@dahcUi.transfer.move:Move to ${title}:title:`;
  }

  protected isChecked(item: DahcTransferItem): boolean {
    return this.checked().has(item.value);
  }

  protected toggle(item: DahcTransferItem): void {
    if (item.disabled || this.isDisabled()) {
      return;
    }

    const next = new Set(this.checked());

    if (next.has(item.value)) {
      next.delete(item.value);
    } else {
      next.add(item.value);
    }

    this.checked.set(next);
  }

  protected toggleAll(rendered: PanelView): void {
    const panel = this.current(rendered);

    if (this.isDisabled() || !panel) {
      return;
    }

    const enabled = panel.items.filter(item => !item.disabled);
    const next = new Set(this.checked());
    enabled.forEach(item => (panel.all ? next.delete(item.value) : next.add(item.value)));
    this.checked.set(next);
  }

  protected onAllKeydown(event: KeyboardEvent, panel: PanelView): void {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      this.toggleAll(panel);
    }
  }

  protected onItemClick(event: MouseEvent): void {
    const option = event.target instanceof Element ? event.target.closest<HTMLElement>('[role="option"]') : null;
    const side = option?.dataset['side'];
    const index = Number(option?.dataset['index']);
    const panel = this.panels().find(candidate => candidate.side === side);
    const item = panel?.items[index];

    if (panel && item) {
      this.active.set({ ...this.active(), [panel.side]: index });
      this.toggle(item);
    }
  }

  protected onListKeydown(event: KeyboardEvent, rendered: PanelView): void {
    // Keys can arrive faster than the view re-renders, so read the panel's current state.
    const panel = this.current(rendered);
    const items = panel?.items ?? [];

    if (!panel || items.length === 0) {
      return;
    }

    const index = panel.active;
    let next = index;

    switch (event.key) {
      case 'ArrowDown':
        next = Math.min(items.length - 1, index + 1);
        break;
      case 'ArrowUp':
        next = Math.max(0, index - 1);
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = items.length - 1;
        break;
      case ' ':
      case 'Enter': {
        const item = items[index];

        if (item) {
          this.toggle(item);
        }

        break;
      }
      default:
        return;
    }

    event.preventDefault();
    this.active.set({ ...this.active(), [panel.side]: next });
    afterNextRender(
      () => this.host.nativeElement.querySelector(`#${panel.listId}-${next}`)?.scrollIntoView({ block: 'nearest' }),
      { injector: this.injector },
    );
  }

  protected onFilter(event: Event, side: DahcTransferSide): void {
    this.filters.set({ ...this.filters(), [side]: (event.target as HTMLInputElement).value });
    this.active.set({ ...this.active(), [side]: 0 });
  }

  /** Moves the checked items of one list to the other. */
  move(from: DahcTransferSide): void {
    const moving = this.list(from)
      .filter(item => this.checked().has(item.value) && !item.disabled)
      .map(item => item.value);

    if (moving.length === 0 || this.isDisabled()) {
      return;
    }

    const target = new Set(this.value());
    moving.forEach(value => (from === 'source' ? target.add(value) : target.delete(value)));
    this.commitValue(this.items().filter(item => target.has(item.value)).map(item => item.value));
    const checked = new Set(this.checked());
    moving.forEach(value => checked.delete(value));
    this.checked.set(checked);
    this.active.set({ source: 0, target: 0 });
    this.markTouched();
    this.moved.emit({ direction: from === 'source' ? 'to-target' : 'to-source', values: moving });
  }

  private current(rendered: PanelView): PanelView | undefined {
    return this.panels().find(panel => panel.side === rendered.side);
  }

  private list(side: DahcTransferSide): readonly DahcTransferItem[] {
    const target = new Set(this.value());
    const query = this.filters()[side].trim().toLowerCase();

    return this.items().filter(
      item => (side === 'target') === target.has(item.value) && (query === '' || item.label.toLowerCase().includes(query)),
    );
  }

  private hasChecked(side: DahcTransferSide): boolean {
    return this.list(side).some(item => this.checked().has(item.value) && !item.disabled);
  }
}
