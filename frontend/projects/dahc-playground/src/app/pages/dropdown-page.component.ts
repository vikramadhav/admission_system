import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  DahcButtonComponent,
  DahcDropdownComponent,
  DahcDropdownItemDirective,
  DahcDropdownTriggerDirective,
  DahcPlacement,
} from 'dahc-ui';

import { DocExampleComponent, EventLogComponent, InspectorChoiceComponent, PlaygroundPageComponent } from 'dahc-playground-kit';

@Component({
  selector: 'dahc-dropdown-page',
  templateUrl: './dropdown-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcButtonComponent,
    DahcDropdownComponent,
    DahcDropdownItemDirective,
    DahcDropdownTriggerDirective,
    DocExampleComponent,
    EventLogComponent,
    InspectorChoiceComponent,
    PlaygroundPageComponent,
  ],
})
export class DropdownPageComponent {
  protected readonly whenToUse = [
    'Group several related actions behind one button to keep a toolbar or a table row tidy.',
    'Use your own trigger, for example an icon button or a link, when the Menu button does not fit.',
    'Mark destructive actions with danger, and keep disabled actions in the list so users can find them.',
    'For site navigation use the Navigation menu; a dropdown is for actions.',
  ];

  protected readonly sourceFiles = [
    'navigation/dropdown/dropdown.component.ts',
    'navigation/dropdown/dropdown.component.html',
    'navigation/dropdown/dropdown.component.css',
    'core/overlay/position.ts',
  ];
  protected readonly placements: readonly DahcPlacement[] = ['bottom', 'top', 'start', 'end'];
  protected readonly placement = signal<DahcPlacement>('bottom');
  protected readonly events = signal<readonly string[]>([]);

  protected record(value: string): void {
    this.events.update(events => [`itemSelected (${value})`, ...events]);
  }
}
