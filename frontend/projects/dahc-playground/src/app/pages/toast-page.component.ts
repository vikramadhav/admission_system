import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DahcButtonComponent, DahcSpaceComponent, DahcToastRegionComponent, DahcToastService, DahcToastVariant } from 'dahc-ui';

import {
  DocExampleComponent,
  InspectorChoiceComponent,
  InspectorTextComponent,
  PlaygroundPageComponent,
} from 'dahc-playground-kit';

@Component({
  selector: 'dahc-toast-page',
  templateUrl: './toast-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcButtonComponent,
    DahcSpaceComponent,
    DahcToastRegionComponent,
    DocExampleComponent,
    InspectorChoiceComponent,
    InspectorTextComponent,
    PlaygroundPageComponent,
  ],
})
export class ToastPageComponent {
  protected readonly whenToUse: readonly string[] = [
    'Confirm that something happened, such as Draft saved or Document uploaded.',
    'Keep the text short; anything the user must act on belongs in an alert or a dialog.',
    'Place one dahc-toast-region in the root layout of the application.',
  ];

  protected showToast(variant: DahcToastVariant): void {
    this.toasts.show({ variant, heading: `${variant.charAt(0).toUpperCase()}${variant.slice(1)} toast`, message: 'A short message.' });
  }

  protected showPersistent(): void {
    this.toasts.show({ variant: 'warning', heading: 'You are offline', message: 'Changes are saved when you reconnect.', duration: 0 });
  }

  protected showHeadingOnly(): void {
    this.toasts.show({ variant: 'success', heading: 'Copied to clipboard' });
  }

  protected readonly sourceFiles = [
    'feedback/toast/toast.service.ts',
    'feedback/toast/toast-region.component.ts',
    'feedback/toast/toast-region.component.html',
    'feedback/toast/toast-region.component.css',
  ];
  protected readonly variants: readonly DahcToastVariant[] = ['info', 'success', 'warning', 'error'];
  protected readonly durations: readonly string[] = ['5000', '0', '1500'];

  protected readonly heading = signal<string>('Draft saved');
  protected readonly message = signal<string>('You can continue later from your dashboard.');
  protected readonly variant = signal<DahcToastVariant>('success');
  protected readonly duration = signal<string>('0');

  private readonly toasts = inject(DahcToastService);

  protected show(): void {
    this.toasts.show({
      variant: this.variant(),
      heading: this.heading(),
      message: this.message(),
      duration: Number(this.duration()),
    });
  }
}
