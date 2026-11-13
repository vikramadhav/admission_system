import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DahcAlertComponent, DahcAlertVariant, DahcSpaceComponent } from 'dahc-ui';

import {
  DocExampleComponent,
  EventLogComponent,
  InspectorChoiceComponent,
  InspectorTextComponent,
  InspectorToggleComponent,
  PlaygroundPageComponent,
} from 'dahc-playground-kit';

@Component({
  selector: 'dahc-alert-page',
  templateUrl: './alert-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DahcAlertComponent,
    DahcSpaceComponent,
    DocExampleComponent,
    EventLogComponent,
    InspectorChoiceComponent,
    InspectorTextComponent,
    InspectorToggleComponent,
    PlaygroundPageComponent,
  ],
})
export class AlertPageComponent {
  protected readonly whenToUse: readonly string[] = [
    'Show messages that belong to a page or section and stay until the user acts, such as an error summary after Save.',
    'Use info alerts for guidance before a task, for example the documents needed for an application.',
    'Set announce when the alert appears after an action, so screen readers read it.',
    'Use a toast or message for short confirmations that disappear on their own.',
  ];

  protected readonly sourceFiles = ['feedback/alert/alert.component.ts', 'feedback/alert/alert.component.html', 'feedback/alert/alert.component.css'];
  protected readonly variants: readonly DahcAlertVariant[] = ['info', 'success', 'warning', 'error'];

  protected readonly variant = signal<DahcAlertVariant>('error');
  protected readonly heading = signal<string>('Your draft could not be saved');
  protected readonly body = signal<string>('Please try again. Reference for support: 4bf92f3577b34da6a3ce929d0e0e4736');
  protected readonly announce = signal<boolean>(false);
  protected readonly dismissible = signal<boolean>(true);
  protected readonly dismissLabel = signal<string>('Dismiss message');
  protected readonly visible = signal<boolean>(true);
  protected readonly events = signal<readonly string[]>([]);

  protected onDismissed(): void {
    this.visible.set(false);
    this.events.update(events => ['dismissed', ...events]);
  }

  protected show(): void {
    this.visible.set(true);
  }
}
