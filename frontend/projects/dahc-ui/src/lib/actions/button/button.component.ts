import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, input } from '@angular/core';

import { DahcIconComponent, DahcIconSize } from '../../core/icon/icon.component';
import { DahcIconName } from '../../core/icon/icon-names';

/**
 * Figma DH Design System REF, Buttons 50:6786:
 * primary = Solid Primary Navy, secondary = Outline Navy, link = Links Primary Navy,
 * danger-outline = Special Red outline, special-blue / special-green = Special solid.
 * danger (solid red) comes from GME "Withdraw" (decision D3).
 */
export type DahcButtonVariant =
  | 'primary'
  | 'secondary'
  | 'link'
  | 'danger'
  | 'danger-outline'
  | 'special-blue'
  | 'special-green';

/** sm 36px, md 44px, lg 48px (Figma "Small", "Medium", "Large"). */
export type DahcButtonSize = 'sm' | 'md' | 'lg';

/**
 * Button styling and states for native <button> and <a> elements, so the browser keeps
 * the semantics, keyboard behaviour and form submission of the host element.
 * States: default, hover, active, focus-visible (DAHC addition), disabled, loading (DAHC addition).
 */
@Component({
  selector: 'button[dahc-button], a[dahc-button]',
  templateUrl: './button.component.html',
  styleUrl: './button.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcIconComponent],
  host: {
    class: 'dahc-button',
    '[class.dahc-button--primary]': "variant() === 'primary'",
    '[class.dahc-button--secondary]': "variant() === 'secondary'",
    '[class.dahc-button--link]': "variant() === 'link'",
    '[class.dahc-button--danger]': "variant() === 'danger'",
    '[class.dahc-button--danger-outline]': "variant() === 'danger-outline'",
    '[class.dahc-button--special-blue]': "variant() === 'special-blue'",
    '[class.dahc-button--special-green]': "variant() === 'special-green'",
    '[class.dahc-button--sm]': "size() === 'sm'",
    '[class.dahc-button--md]': "size() === 'md'",
    '[class.dahc-button--lg]': "size() === 'lg'",
    '[class.dahc-button--block]': 'block()',
    '[class.dahc-button--loading]': 'loading()',
    '[attr.disabled]': "isNativeButton && isInactive() ? '' : null",
    '[attr.aria-disabled]': "!isNativeButton && isInactive() ? 'true' : null",
    '[attr.tabindex]': "!isNativeButton && isInactive() ? '-1' : null",
    '[attr.aria-busy]': "loading() ? 'true' : null",
    '(click)': 'onClick($event)',
  },
})
export class DahcButtonComponent {
  readonly variant = input<DahcButtonVariant>('primary');
  readonly size = input<DahcButtonSize>('md');
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);
  /** Stretches the button to the width of its container. */
  readonly block = input<boolean>(false);
  /** Icon before the label (Figma "leadingIcon"); mirrored in right-to-left when directional. */
  readonly iconStart = input<DahcIconName | null>(null);
  /** Icon after the label (Figma "trailingIcon"). */
  readonly iconEnd = input<DahcIconName | null>(null);
  /** Text announced while loading; the visible label stays in place. */
  readonly loadingLabel = input<string>($localize`:@@dahcUi.button.loading:Please wait`);

  protected readonly isInactive = computed<boolean>(() => this.disabled() || this.loading());
  /** Figma icon sizes: 20 on Large and Medium, 16 on Small; links 24 / 16 / 16. */
  protected readonly iconSize = computed<DahcIconSize>(() => {
    if (this.variant() === 'link') {
      return this.size() === 'lg' ? 'lg' : 'sm';
    }

    return this.size() === 'sm' ? 'sm' : 'md';
  });

  protected readonly isNativeButton: boolean =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName === 'BUTTON';

  protected onClick(event: Event): void {
    if (this.isInactive()) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
}
