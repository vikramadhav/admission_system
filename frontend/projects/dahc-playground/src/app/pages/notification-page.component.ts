import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  DahcButtonComponent,
  DahcNotificationRegionComponent,
  DahcNotificationService,
  DahcNotificationVariant,
  DahcSpaceComponent,
} from 'dahc-ui';

import {
  DocExampleComponent,
  InspectorChoiceComponent,
  InspectorTextComponent,
  PlaygroundPageComponent,
} from 'dahc-playground-kit';

@Component({
  selector: 'dahc-notification-page',
  templateUrl: './notification-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcButtonComponent,
    DahcNotificationRegionComponent,
    DahcSpaceComponent,
    DocExampleComponent,
    InspectorChoiceComponent,
    InspectorTextComponent,
    PlaygroundPageComponent,
  ],
})
export class NotificationPageComponent {
  protected readonly whenToUse: readonly string[] = [
    'Tell the user about something that happened outside their current task, such as Score announced.',
    'Use a heading and a short message; link to details instead of long text.',
    'Use one notification style per application (toast or notification).',
  ];

  protected showNotification(variant: DahcNotificationVariant): void {
    this.notifications.notify({ variant, heading: `${variant.charAt(0).toUpperCase()}${variant.slice(1)} notification`, message: 'Details about what happened.' });
  }

  protected showPersistentNotification(): void {
    this.notifications.notify({ variant: 'info', heading: 'Score announced', message: 'You can appeal within 48 hours.', duration: 0 });
  }

  protected showLongNotification(): void {
    this.notifications.notify({
      variant: 'warning',
      heading: 'Documents need attention',
      message: 'Two documents could not be verified. Upload clear copies of your passport and your graduation certificate before 30 September.',
    });
  }

  protected readonly sourceFiles = [
    'feedback/notification/notification.service.ts',
    'feedback/notification/notification-region.component.ts',
    'feedback/notification/notification-region.component.html',
    'feedback/notification/notification-region.component.css',
  ];
  protected readonly variants: readonly DahcNotificationVariant[] = ['info', 'success', 'warning', 'error'];
  protected readonly durations: readonly string[] = ['0', '5000', '1500'];

  protected readonly heading = signal<string>('Score announced');
  protected readonly message = signal<string>('Your portfolio result is ready. You can appeal within 48 hours.');
  protected readonly variant = signal<DahcNotificationVariant>('info');
  protected readonly duration = signal<string>('0');

  private readonly notifications = inject(DahcNotificationService);

  protected show(): void {
    this.notifications.notify({
      variant: this.variant(),
      heading: this.heading(),
      message: this.message(),
      duration: Number(this.duration()),
    });
  }
}
