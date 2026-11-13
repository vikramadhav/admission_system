import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  input,
  output,
  signal,
  viewChild,
  viewChildren,
  Injector,
} from '@angular/core';

import { dahcUniqueId } from '../../core/a11y/unique-id';
import { DahcIconComponent } from '../../core/icon/icon.component';
import { DahcIconName } from '../../core/icon/icon-names';
import { dahcAutoUpdate, dahcPositionFloating } from '../../core/overlay/position';
import { DahcButtonComponent, DahcButtonSize, DahcButtonVariant } from '../button/button.component';

export interface DahcMenuItem {
  readonly value: string;
  readonly label: string;
  readonly icon?: DahcIconName;
  readonly disabled?: boolean;
  /** Destructive action, shown in the error colour. */
  readonly danger?: boolean;
}

/**
 * Action menu: a button that opens a list of actions (WAI-ARIA menu button pattern).
 * Keyboard: Enter, Space or ArrowDown on the button opens the menu on the first item, ArrowUp on
 * the last; in the menu ArrowUp / ArrowDown / Home / End move, Enter or Space chooses, Escape
 * closes back to the button, Tab closes and moves on.
 * List styling: Figma Dropdown frames (50:13293) — white panel, radius 12, Shadow 4, 48px rows,
 * 12/16 padding, hover blue-100. Behaviour DERIVED. Ported from dubai-health-ui (overlay/dh-popups.ts,
 * overlay/dh-menu.ts).
 */
@Component({
  selector: 'dahc-menu',
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcButtonComponent, DahcIconComponent],
  host: {
    '(keydown)': 'onMenuKeydown($event)',
  },
})
export class DahcMenuComponent {
  /** Text of the trigger button. */
  readonly label = input.required<string>();
  readonly items = input.required<readonly DahcMenuItem[]>();
  readonly variant = input<DahcButtonVariant>('secondary');
  readonly size = input<DahcButtonSize>('md');
  readonly disabled = input<boolean>(false);
  /** Emits the value of the chosen item. */
  readonly itemSelected = output<string>();

  protected readonly menuId = dahcUniqueId('dahc-menu');
  protected readonly open = signal<boolean>(false);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly trigger = viewChild.required('trigger', { read: ElementRef<HTMLButtonElement> });
  private readonly popup = viewChild.required<ElementRef<HTMLElement>>('popup');
  private readonly itemElements = viewChildren<ElementRef<HTMLElement>>('item');
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

  protected toggle(): void {
    if (this.open()) {
      this.close(true);
    } else {
      this.show('first');
    }
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.show(event.key === 'ArrowUp' ? 'last' : 'first');
    }
  }

  /** Roving focus inside the open menu; keys on the trigger are handled by onTriggerKeydown. */
  protected onMenuKeydown(event: KeyboardEvent): void {
    if (!this.open()) {
      return;
    }

    // Escape closes an open menu wherever focus is, even before focus has moved into it.
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.close(true);

      return;
    }

    if (!(event.target instanceof HTMLElement) || !this.popup().nativeElement.contains(event.target)) {
      return;
    }

    const enabled = this.enabledItemElements();
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

  protected choose(item: DahcMenuItem): void {
    if (item.disabled) {
      return;
    }

    this.itemSelected.emit(item.value);
    this.close(true);
  }

  private show(focus: 'first' | 'last'): void {
    const popup = this.popup().nativeElement;
    const trigger = this.trigger().nativeElement;
    const view = this.document.defaultView;

    this.open.set(true);
    popup.showPopover();
    const place = (): void => {
      dahcPositionFloating(trigger, popup);
    };
    place();
    this.stopAutoUpdate = view ? dahcAutoUpdate(view, place) : null;

    afterNextRender(
      () => {
        const enabled = this.enabledItemElements();
        (focus === 'first' ? enabled[0] : enabled[enabled.length - 1])?.focus();
      },
      { injector: this.injector },
    );
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

  private enabledItemElements(): HTMLElement[] {
    return this.itemElements()
      .map(item => item.nativeElement)
      .filter(element => element.getAttribute('aria-disabled') !== 'true');
  }
}
