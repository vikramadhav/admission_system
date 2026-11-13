import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DahcButtonComponent, DahcPopconfirmComponent, DahcPopoverTriggerDirective } from 'dahc-ui';

import { DocExampleComponent, EventLogComponent, InspectorTextComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-popconfirm-page',
  templateUrl: './popconfirm-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcButtonComponent,
    DahcPopconfirmComponent,
    DahcPopoverTriggerDirective,
    DocExampleComponent,
    EventLogComponent,
    InspectorTextComponent,
    PlaygroundPageComponent,
  ],
})
export class PopconfirmPageComponent {
  protected readonly whenToUse: readonly string[] = [
    'Confirm a small, reversible action in place, such as removing an uploaded file.',
    'Use a modal for consequences that cannot be undone or need more explanation.',
    'Write the question so the confirm button text answers it, such as Remove this document? Remove.',
  ];

  protected readonly sourceFiles = [
    'feedback/popover/popconfirm.component.ts',
    'feedback/popover/popup-base.ts',
    'feedback/popover/popover.component.css',
  ];

  protected readonly heading = signal<string>('Remove this document?');
  protected readonly okText = signal<string>('Remove');
  protected readonly cancelText = signal<string>('Keep');
  protected readonly events = signal<readonly string[]>([]);

  protected record(event: string): void {
    this.events.update(events => [event, ...events]);
  }
}
