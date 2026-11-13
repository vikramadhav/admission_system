import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  Directive,
  ElementRef,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  contentChildren,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { dahcUniqueId } from '../../core/a11y/unique-id';
import { DahcPlacement, dahcAutoUpdate, dahcPositionFloating } from '../../core/overlay/position';

/**
 * Opens a menu of actions from any trigger (WAI-ARIA menu button pattern). Unlike dahc-menu, the
 * trigger and the items are your own elements:
 *
 * <dahc-dropdown label="Actions" (itemSelected)="run($event)">
 *   <button dahc-button dahcDropdownTrigger type="button">Actions</button>
 *   <button dahcDropdownItem="edit" type="button">Edit</button>
 *   <a dahcDropdownItem="help" href="/help">Help</a>
 * </dahc-dropdown>
 *
 * Keyboard: Enter, Space or ArrowDown on the trigger opens the menu on the first item, ArrowUp on
 * the last; ArrowUp / ArrowDown / Home / End move, Enter or Space chooses, Escape closes back to the
 * trigger, Tab closes and moves on. List styling: Figma Dropdown frames (50:13293) as dahc-menu;
 * behaviour DERIVED. Ported from dubai-health-ui dh-dropdown. Styles are global (BEM, no view
 * encapsulation) so that projected items can be styled.
 */
@Component({
  selector: 'dahc-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'dahc-dropdown',
    '(keydown)': 'onKeydown($event)',
  },
})
export class DahcDropdownComponent {
  /** Accessible name of the menu. */
  readonly label = input.required<string>();
  readonly placement = input<DahcPlacement>('bottom');
  /** Emits the value of the chosen item. */
  readonly itemSelected = output<string>();

  readonly menuId = dahcUniqueId('dahc-dropdown');
  readonly open = signal<boolean>(false);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');
  private readonly items = contentChildren(DahcDropdownItemDirective, { descendants: true });
  private readonly triggers = contentChildren(DahcDropdownTriggerDirective, { descendants: true, read: ElementRef });
  private stopAutoUpdate: (() => void) | null = null;

  private readonly closeOnOutsidePointer = (event: PointerEvent): void => {
    if (this.open() && !event.composedPath().includes(this.host.nativeElement)) {
      this.close(false);
    }
  };

  constructor() {
    this.document.addEventListener('pointerdown', this.closeOnOutsidePointer, true);
    inject(DestroyRef).onDestroy(() => {
      this.document.removeEventListener('pointerdown', this.closeOnOutsidePointer, true);
      this.stopAutoUpdate?.();
    });
  }

  toggle(): void {
    if (this.open()) {
      this.close(true);
    } else {
      this.show('first');
    }
  }

  show(focus: 'first' | 'last'): void {
    const trigger = this.trigger();
    const panel = this.panel().nativeElement;
    const view = this.document.defaultView;

    if (!trigger) {
      return;
    }

    this.open.set(true);
    panel.showPopover();
    const place = (): void => {
      dahcPositionFloating(trigger, panel, { placement: this.placement(), offset: 8 });
    };
    place();
    this.stopAutoUpdate = view ? dahcAutoUpdate(view, place) : null;

    afterNextRender(
      () => {
        const enabled = this.enabledItems();
        (focus === 'first' ? enabled[0] : enabled[enabled.length - 1])?.focus();
      },
      { injector: this.injector },
    );
  }

  close(returnFocus: boolean): void {
    this.open.set(false);
    this.stopAutoUpdate?.();
    this.stopAutoUpdate = null;

    const panel = this.panel().nativeElement;

    if (panel.matches(':popover-open')) {
      panel.hidePopover();
    }

    if (returnFocus) {
      this.trigger()?.focus();
    }
  }

  /** Called by an item. */
  choose(item: DahcDropdownItemDirective): void {
    if (item.disabled()) {
      return;
    }

    this.itemSelected.emit(item.value());
    this.close(true);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (!this.open()) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.close(true);

      return;
    }

    if (!(event.target instanceof HTMLElement) || !this.panel().nativeElement.contains(event.target)) {
      return;
    }

    const enabled = this.enabledItems();
    const current = enabled.indexOf(this.document.activeElement as HTMLElement);
    let next: number | null = null;

    switch (event.key) {
      case 'ArrowDown':
        next = (current + 1) % enabled.length;
        break;
      case 'ArrowUp':
        next = (current - 1 + enabled.length) % enabled.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = enabled.length - 1;
        break;
      case 'Tab':
        this.close(false);

        return;
      default:
        return;
    }

    event.preventDefault();
    enabled[next]?.focus();
  }

  private trigger(): HTMLElement | null {
    return (this.triggers()[0]?.nativeElement as HTMLElement | undefined) ?? null;
  }

  private enabledItems(): HTMLElement[] {
    return this.items()
      .filter(item => !item.disabled())
      .map(item => item.element);
  }
}

/** Marks the element that opens a dahc-dropdown and wires its ARIA. */
@Directive({
  selector: '[dahcDropdownTrigger]',
  host: {
    'aria-haspopup': 'menu',
    '[attr.aria-expanded]': 'dropdown.open()',
    '[attr.aria-controls]': 'dropdown.menuId',
    '(click)': 'dropdown.toggle()',
    '(keydown)': 'onKeydown($event)',
  },
})
export class DahcDropdownTriggerDirective {
  protected readonly dropdown = inject(DahcDropdownComponent);

  protected onKeydown(event: KeyboardEvent): void {
    if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && !this.dropdown.open()) {
      event.preventDefault();
      this.dropdown.show(event.key === 'ArrowUp' ? 'last' : 'first');
    }
  }
}

/** An action in a dahc-dropdown: put it on a button or a link; the value is emitted when chosen. */
@Directive({
  selector: '[dahcDropdownItem]',
  host: {
    class: 'dahc-dropdown__item',
    role: 'menuitem',
    tabindex: '-1',
    '[class.dahc-dropdown__item--danger]': 'danger()',
    '[attr.aria-disabled]': "disabled() ? 'true' : null",
    '(click)': 'onClick($event)',
    '(keydown.space)': 'onSpace($event)',
  },
})
export class DahcDropdownItemDirective {
  readonly value = input<string>('', { alias: 'dahcDropdownItem' });
  readonly disabled = input<boolean>(false);
  /** Destructive action, shown in the error colour. */
  readonly danger = input<boolean>(false);

  readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly dropdown = inject(DahcDropdownComponent);

  protected onClick(event: MouseEvent): void {
    if (this.disabled()) {
      event.preventDefault();

      return;
    }

    this.dropdown.choose(this);
  }

  /** Space chooses links too (buttons already click on Space). */
  protected onSpace(event: Event): void {
    if (this.element instanceof HTMLAnchorElement) {
      event.preventDefault();
      this.element.click();
    }
  }
}
