import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

export type DahcAlertVariant = 'info' | 'success' | 'warning' | 'error';

/**
 * Inline message. With announce set, it is a live region: errors use role="alert",
 * the other variants role="status". Static guidance leaves announce off.
 */
@Component({
  selector: 'dahc-alert',
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': "'dahc-alert dahc-alert--' + variant()",
  },
})
export class DahcAlertComponent {
  readonly variant = input<DahcAlertVariant>('info');
  readonly heading = input<string>('');
  readonly announce = input<boolean>(false);
  readonly dismissible = input<boolean>(false);
  readonly dismissLabel = input<string>($localize`:@@dahcUi.alert.dismiss:Dismiss message`);
  readonly dismissed = output<void>();

  protected readonly role = computed<string | null>(() => {
    if (!this.announce()) {
      return null;
    }

    return this.variant() === 'error' ? 'alert' : 'status';
  });

  protected readonly variantLabel = computed<string>(() => {
    switch (this.variant()) {
      case 'success':
        return $localize`:@@dahcUi.alert.success:Success`;
      case 'warning':
        return $localize`:@@dahcUi.alert.warning:Warning`;
      case 'error':
        return $localize`:@@dahcUi.alert.error:Error`;
      case 'info':
        return $localize`:@@dahcUi.alert.info:Information`;
    }
  });

  protected dismiss(): void {
    this.dismissed.emit();
  }
}
