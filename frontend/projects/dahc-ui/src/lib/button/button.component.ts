import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, input } from '@angular/core';

export type DahcButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger';
export type DahcButtonSize = 'sm' | 'md' | 'lg';

/**
 * Button styling and states for native <button> and <a> elements, so the browser keeps
 * the semantics, keyboard behaviour and form submission of the host element.
 */
@Component({
  selector: 'button[dahc-button], a[dahc-button]',
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'dahc-button',
    '[class.dahc-button--primary]': "variant() === 'primary'",
    '[class.dahc-button--secondary]': "variant() === 'secondary'",
    '[class.dahc-button--tertiary]': "variant() === 'tertiary'",
    '[class.dahc-button--danger]': "variant() === 'danger'",
    '[class.dahc-button--sm]': "size() === 'sm'",
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
  /** Text announced while loading; the visible label stays in place. */
  readonly loadingLabel = input<string>($localize`:@@dahcUi.button.loading:Please wait`);

  protected readonly isInactive = computed<boolean>(() => this.disabled() || this.loading());
  protected readonly isNativeButton: boolean =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName === 'BUTTON';

  protected onClick(event: Event): void {
    if (this.isInactive()) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
}
