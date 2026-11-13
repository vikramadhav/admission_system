import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ElementRef,
  computed,
  inject,
  input,
  model,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { dahcUniqueId } from '../../core/a11y/unique-id';
import { DahcIconComponent } from '../../core/icon/icon.component';
import { DahcIconName } from '../../core/icon/icon-names';

export type DahcNavMenuMode = 'horizontal' | 'vertical';

const ITEM_SELECTOR = '.dahc-nav-menu-item__item:not([aria-disabled="true"]), .dahc-nav-sub-menu__head';

/**
 * Site navigation: a horizontal header menu or a vertical side menu of links. The current page has
 * aria-current="page". Arrow keys move between items (Left / Right in a horizontal menu, Up / Down
 * in a vertical one; Home / End), Tab leaves the menu. For a menu of actions use dahc-menu or
 * dahc-dropdown. Figma: horizontal = DH "Menu items" 50:11253 (80px, Regular 16/20, current Bold with
 * a 4px navy underline); vertical = DH Hamburger "Menu Item" 50:10172 (40px rows, Medium 14/18,
 * current blue-100 with a 2px navy start edge). Ported from dubai-health-ui dh-menu.
 */
@Component({
  selector: 'dahc-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrl: './nav-menu.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.dahc-nav-menu--horizontal]': "mode() === 'horizontal'",
    '[class.dahc-nav-menu--vertical]': "mode() === 'vertical'",
    '(keydown)': 'onKeydown($event)',
  },
})
export class DahcNavMenuComponent {
  readonly mode = input<DahcNavMenuMode>('vertical');
  /** Accessible name of the navigation landmark. */
  readonly label = input<string>($localize`:@@dahcUi.navMenu.label:Menu`);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);

  protected onKeydown(event: KeyboardEvent): void {
    const items = [...this.host.nativeElement.querySelectorAll<HTMLElement>(ITEM_SELECTOR)].filter(
      item => item.offsetParent !== null,
    );
    const current = items.indexOf(this.document.activeElement as HTMLElement);

    if (current === -1) {
      return;
    }

    const horizontal = this.mode() === 'horizontal';
    const rtl = getComputedStyle(this.host.nativeElement).direction === 'rtl';
    const nextKey = horizontal ? (rtl ? 'ArrowLeft' : 'ArrowRight') : 'ArrowDown';
    const previousKey = horizontal ? (rtl ? 'ArrowRight' : 'ArrowLeft') : 'ArrowUp';
    let next: number | null = null;

    switch (event.key) {
      case nextKey:
        next = (current + 1) % items.length;
        break;
      case previousKey:
        next = (current - 1 + items.length) % items.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = items.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    items[next]?.focus();
  }
}

/**
 * An item of a dahc-nav-menu: a link (route or href) or, when disabled, plain text.
 * Ported from dubai-health-ui dh-menu-item.
 */
@Component({
  selector: 'dahc-nav-menu-item',
  templateUrl: './nav-menu-item.component.html',
  styleUrl: './nav-menu.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcIconComponent, NgTemplateOutlet, RouterLink],
  host: {
    role: 'listitem',
    '[class.dahc-nav-menu-item--horizontal]': "mode() === 'horizontal'",
    '[class.dahc-nav-menu-item--vertical]': "mode() === 'vertical'",
    '[class.dahc-nav-menu-item--selected]': 'selected()',
    '[class.dahc-nav-menu-item--disabled]': 'disabled()',
  },
})
export class DahcNavMenuItemComponent {
  /** Router link of the item. */
  readonly route = input<string | readonly unknown[] | null>(null);
  /** Plain URL, when there is no route. */
  readonly href = input<string>('');
  /** The current page. */
  readonly selected = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly icon = input<DahcIconName | null>(null);

  private readonly menu = inject(DahcNavMenuComponent, { optional: true });

  protected readonly mode = computed<DahcNavMenuMode>(() => this.menu?.mode() ?? 'vertical');
}

/**
 * Expandable group of items in a vertical dahc-nav-menu (disclosure pattern; sub-items indented
 * 24px). DH Hamburger "Menu Item" Sub-menu=Yes. Ported from dubai-health-ui dh-sub-menu.
 */
@Component({
  selector: 'dahc-nav-sub-menu',
  templateUrl: './nav-sub-menu.component.html',
  styleUrl: './nav-menu.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcIconComponent],
  host: {
    role: 'listitem',
    class: 'dahc-nav-sub-menu',
    '[class.dahc-nav-sub-menu--open]': 'open()',
  },
})
export class DahcNavSubMenuComponent {
  readonly heading = input.required<string>();
  /** Expanded; two-way bindable. */
  readonly open = model<boolean>(false);

  protected readonly itemsId = dahcUniqueId('dahc-nav-sub-menu');

  protected toggle(): void {
    this.open.update(open => !open);
  }
}
