import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  DahcButtonComponent,
  DahcMessageRegionComponent,
  DahcMessageService,
  DahcMessageVariant,
  DahcSpaceComponent,
} from 'dahc-ui';

import {
  DocExampleComponent,
  InspectorChoiceComponent,
  InspectorTextComponent,
  PlaygroundPageComponent,
} from 'dahc-playground-kit';

@Component({
  selector: 'dahc-message-page',
  templateUrl: './message-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcButtonComponent,
    DahcMessageRegionComponent,
    DahcSpaceComponent,
    DocExampleComponent,
    InspectorChoiceComponent,
    InspectorTextComponent,
    PlaygroundPageComponent,
  ],
})
export class MessagePageComponent {
  protected readonly whenToUse: readonly string[] = [
    'Confirm a quick action in a few words, such as Copied or Saved.',
    'Use a toast or notification when you need a heading or more text.',
    'Place one dahc-message-region in the root layout.',
  ];

  protected showMessage(variant: DahcMessageVariant): void {
    this.messages.show(`${variant.charAt(0).toUpperCase()}${variant.slice(1)} message`, variant);
  }

  protected showPersistentMessage(): void {
    this.messages.show('Reconnecting…', 'warning', 0);
  }

  protected showShortMessage(): void {
    this.messages.show('Copied', 'success', 1500);
  }

  protected readonly sourceFiles = [
    'feedback/message/message.service.ts',
    'feedback/message/message-region.component.ts',
    'feedback/message/message-region.component.css',
  ];
  protected readonly variants: readonly DahcMessageVariant[] = ['success', 'info', 'warning', 'error'];
  protected readonly durations: readonly string[] = ['0', '3000', '1500'];

  protected readonly text = signal<string>('Copied to clipboard');
  protected readonly variant = signal<DahcMessageVariant>('success');
  protected readonly duration = signal<string>('0');

  private readonly messages = inject(DahcMessageService);

  protected show(): void {
    this.messages.show(this.text(), this.variant(), Number(this.duration()));
  }
}
