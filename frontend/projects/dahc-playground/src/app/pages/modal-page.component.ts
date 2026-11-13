import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  DahcButtonComponent,
  DahcDialogCloseRequest,
  DahcIconComponent,
  DahcModalComponent,
  DahcModalSize,
  DahcSpaceComponent,
} from 'dahc-ui';

import {
  DocExampleComponent,
  EventLogComponent,
  InspectorChoiceComponent,
  InspectorTextComponent,
  InspectorToggleComponent,
  PlaygroundPageComponent,
} from 'dahc-playground-kit';

@Component({
  selector: 'dahc-modal-page',
  templateUrl: './modal-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcButtonComponent,
    DahcIconComponent,
    DahcModalComponent,
    DahcSpaceComponent,
    DocExampleComponent,
    EventLogComponent,
    InspectorChoiceComponent,
    InspectorTextComponent,
    InspectorToggleComponent,
    PlaygroundPageComponent,
  ],
})
export class ModalPageComponent {
  protected readonly whenToUse: readonly string[] = [
    'Confirm an action with consequences, such as submitting or withdrawing an application.',
    'Show a short, focused task or a result that needs acknowledgement, such as Payment received.',
    'Avoid long forms in a modal; use a page or a drawer instead.',
  ];

  protected readonly basicOpen = signal<boolean>(false);
  protected readonly largeOpen = signal<boolean>(false);
  protected readonly withdrawOpen = signal<boolean>(false);
  protected readonly receiptOpen = signal<boolean>(false);

  protected readonly sourceFiles = [
    'feedback/dialog/modal.component.ts',
    'feedback/dialog/modal.component.html',
    'feedback/dialog/modal.component.css',
    'feedback/dialog/dialog-base.ts',
  ];
  protected readonly sizes: readonly DahcModalSize[] = ['sm', 'md', 'lg'];

  protected readonly heading = signal<string>('Submit your application?');
  protected readonly size = signal<DahcModalSize>('md');
  protected readonly closable = signal<boolean>(true);
  protected readonly closeOnBackdrop = signal<boolean>(true);
  protected readonly confirmClose = signal<boolean>(false);
  protected readonly open = signal<boolean>(false);
  protected readonly events = signal<readonly string[]>([]);

  protected readonly discardOpen = signal<boolean>(false);
  protected readonly successOpen = signal<boolean>(false);

  protected onCloseRequested(request: DahcDialogCloseRequest): void {
    this.record(`closeRequested (${request.reason})`);

    if (this.confirmClose() && request.reason !== 'api') {
      request.cancel();
      this.record('close cancelled');
    }
  }

  protected record(event: string): void {
    this.events.update(events => [event, ...events]);
  }
}
