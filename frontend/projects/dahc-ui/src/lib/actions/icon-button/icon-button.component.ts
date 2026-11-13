import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, input } from '@angular/core';

import { DahcIconComponent } from '../../core/icon/icon.component';
import { DahcIconName } from '../../core/icon/icon-names';

/**
 * outline: Figma Buttons 50:6786 "Icon only" (50:7051-50:7060), 1px navy ring.
 * ghost: GME header icon buttons (GME 1:2189), filled with the muted surface (decision D3).
 */
export type DahcIconButtonVariant = 'outline' | 'ghost';

/** md 40px (GME header), lg 48px (Figma Large). */
export type DahcIconButtonSize = 'md' | 'lg';

/**
 * A button or link that shows only an icon. Its text content is the accessible name and is
 * visually hidden, so it must always be given (WCAG 1.1.1, 4.1.2):
 * <button dahc-icon-button icon="search">Search</button>
 */
@Component({
  selector: 'button[dahc-icon-button], a[dahc-icon-button]',
  template: '<dahc-icon [name]="icon()" size="md" /><span class="dahc-visually-hidden"><ng-content /></span>',
  styleUrl: './icon-button.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcIconComponent],
  host: {
    class: 'dahc-icon-button',
    '[class.dahc-icon-button--outline]': "variant() === 'outline'",
    '[class.dahc-icon-button--ghost]': "variant() === 'ghost'",
    '[class.dahc-icon-button--md]': "size() === 'md'",
    '[class.dahc-icon-button--lg]': "size() === 'lg'",
    '[attr.disabled]': "isNativeButton && disabled() ? '' : null",
    '[attr.aria-disabled]': "!isNativeButton && disabled() ? 'true' : null",
    '[attr.tabindex]': "!isNativeButton && disabled() ? '-1' : null",
    '(click)': 'onClick($event)',
  },
})
export class DahcIconButtonComponent {
  readonly icon = input.required<DahcIconName>();
  readonly variant = input<DahcIconButtonVariant>('outline');
  readonly size = input<DahcIconButtonSize>('lg');
  readonly disabled = input<boolean>(false);

  protected readonly isNativeButton: boolean =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName === 'BUTTON';

  protected readonly isInactive = computed<boolean>(() => this.disabled());

  protected onClick(event: Event): void {
    if (this.isInactive()) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
}
