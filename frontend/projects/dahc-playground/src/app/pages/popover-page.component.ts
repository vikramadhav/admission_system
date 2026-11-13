import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  DahcButtonComponent,
  DahcPlacement,
  DahcPopoverComponent,
  DahcPopoverTriggerDirective,
  DahcSpaceComponent,
} from 'dahc-ui';

import {
  DocExampleComponent,
  EventLogComponent,
  InspectorChoiceComponent,
  InspectorTextComponent,
  PlaygroundPageComponent,
} from 'dahc-playground-kit';

@Component({
  selector: 'dahc-popover-page',
  templateUrl: './popover-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcButtonComponent,
    DahcPopoverComponent,
    DahcPopoverTriggerDirective,
    DahcSpaceComponent,
    DocExampleComponent,
    EventLogComponent,
    InspectorChoiceComponent,
    InspectorTextComponent,
    PlaygroundPageComponent,
  ],
})
export class PopoverPageComponent {
  protected readonly whenToUse: readonly string[] = [
    'Show extra details or help that does not fit next to a field, such as how points work.',
    'Use a tooltip for a one-line hint, and a modal for content the user must act on.',
    'Keep interactive content short; focus moves into the panel.',
  ];

  protected readonly sourceFiles = [
    'feedback/popover/popover.component.ts',
    'feedback/popover/popup-base.ts',
    'feedback/popover/popover.component.css',
  ];
  protected readonly placements: readonly DahcPlacement[] = ['bottom', 'top', 'start', 'end'];

  protected readonly heading = signal<string>('How points work');
  protected readonly placement = signal<DahcPlacement>('bottom');
  protected readonly events = signal<readonly string[]>([]);

  protected record(event: string): void {
    this.events.update(events => [event, ...events]);
  }
}
