import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { DahcIconComponent } from '../../core/icon/icon.component';
import { DahcIconName } from '../../core/icon/icon-names';

export type DahcAlertVariant = 'info' | 'success' | 'warning' | 'error';

/**
 * Inline message. With announce set, it is a live region: errors use role="alert",
 * the other variants role="status". Static guidance leaves announce off.
 * The type is conveyed by icon, colour and the hidden prefix ("Error: "), never by colour alone.
 * Visual design aligned with the dubai-health-ui alert (DERIVED, see the stylesheet).
 */
@Component({
  selector: 'dahc-alert',
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DahcIconComponent],
  host: {
    class: 'dahc-alert',
    '[class.dahc-alert--info]': "variant() === 'info'",
    '[class.dahc-alert--success]': "variant() === 'success'",
    '[class.dahc-alert--warning]': "variant() === 'warning'",
    '[class.dahc-alert--error]': "variant() === 'error'",
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

  protected readonly icon = computed<DahcIconName>(() => {
    switch (this.variant()) {
      case 'success':
        return 'check';
      case 'error':
        return 'close';
      default:
        return 'information';
    }
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
